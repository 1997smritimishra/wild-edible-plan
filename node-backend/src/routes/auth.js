'use strict';
/**
 * Auth routes:
 *   POST /api/auth/login        — verify email+password, generate OTP, send SMS via Twilio
 *   POST /api/auth/verify-otp   — verify OTP code, return user session data
 *
 * OTP: 6-digit, stored in otp_table, expires in 5 minutes.
 * SMS delivery: Twilio SMS API → user's phone_number from user_table.
 */
require('dotenv').config();
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const pool    = require('../db');

// ── Twilio setup ───────────────────────────────────────────
const twilio = require('twilio');

const TWILIO_SID    = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM   = process.env.TWILIO_FROM_NUMBER;

// Only initialise Twilio if credentials are configured
const twilioClient = (TWILIO_SID && TWILIO_TOKEN && !TWILIO_SID.startsWith('ACxx'))
  ? twilio(TWILIO_SID, TWILIO_TOKEN)
  : null;

// ── Helper: generate 6-digit OTP ──────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Helper: mask phone number ──────────────────────────────
// 9876543210  →  ******3210
function maskPhone(phone) {
  if (!phone || phone.length < 4) return '****';
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

// ── Helper: format phone for Twilio (needs +country code) ─
// India numbers: 9876543210 → +919876543210
function formatPhone(phone) {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('91') && clean.length === 12) return `+${clean}`;
  if (clean.length === 10) return `+91${clean}`;   // default to India
  return `+${clean}`;
}

// ── Helper: send SMS via Twilio ────────────────────────────
async function sendOtpSms(toPhone, otp) {
  if (!twilioClient) {
    // Twilio not configured — log OTP to console for dev testing
    console.log(`[DEV] OTP for ${toPhone}: ${otp}`);
    return { dev: true };
  }

  const message = await twilioClient.messages.create({
    body: `Your Web GIS Plant Portal OTP is: ${otp}. Valid for 5 minutes. Do not share.`,
    from: TWILIO_FROM,
    to:   formatPhone(toPhone),
  });

  console.log(`SMS sent to ${maskPhone(toPhone)} — SID: ${message.sid}`);
  return { sid: message.sid };
}

// ── POST /api/auth/login ───────────────────────────────────
router.post('/login', async (req, res) => {
  const { emailId, password, roleName } = req.body;

  if (!emailId || !password || !roleName) {
    return res.status(400).json({ error: 'emailId, password and roleName are required' });
  }

  try {
    // Find user by email + role name
    const { rows } = await pool.query(`
      SELECT u.user_id, u.user_name, u.phone_number, u.email_id,
             u.password_hash,
             TRIM(r.role_name)  AS "roleName",
             r.feature_allowed  AS "featureAllowed"
      FROM user_table u
      JOIN role_table r ON u.role_id = r.role_id
      WHERE LOWER(u.email_id)  = LOWER($1)
        AND TRIM(r.role_name)  = $2
    `, [emailId.trim(), roleName]);

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid email or role. Please check and try again.' });
    }

    const user = rows[0];

    // Password check — support plain 'HASHED_PASSWORD' for test seed data
    const isValid = user.password_hash === 'HASHED_PASSWORD'
      ? password === 'HASHED_PASSWORD'
      : await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Generate OTP
    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Remove old unverified OTPs for this user
    await pool.query(
      `DELETE FROM otp_table WHERE user_id = $1 AND verified = FALSE`,
      [user.user_id]
    );

    // Save new OTP
    await pool.query(
      `INSERT INTO otp_table (user_id, otp_code, expires_at) VALUES ($1, $2, $3)`,
      [user.user_id, otp, expiresAt]
    );

    // Send OTP via SMS
    const smsResult = await sendOtpSms(user.phone_number, otp);

    // Build response
    const response = {
      success:     true,
      userId:      user.user_id,
      userName:    user.user_name,
      phoneMasked: maskPhone(user.phone_number),
    };

    // ⚠️ Include OTP in response ONLY when Twilio is not configured (dev mode)
    if (smsResult.dev) {
      response.otp = otp;
    }

    res.json(response);

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/verify-otp ──────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { userId, otpCode } = req.body;

  if (!userId || !otpCode) {
    return res.status(400).json({ error: 'userId and otpCode are required' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT o.otp_id, o.otp_code, o.expires_at,
             u.user_name, u.email_id, u.phone_number,
             TRIM(r.role_name)  AS "roleName",
             r.feature_allowed  AS "featureAllowed"
      FROM otp_table o
      JOIN user_table u ON o.user_id = u.user_id
      JOIN role_table r ON u.role_id = r.role_id
      WHERE o.user_id   = $1
        AND o.verified  = FALSE
      ORDER BY o.created_at DESC
      LIMIT 1
    `, [userId]);

    if (!rows.length) {
      return res.status(401).json({ error: 'No pending OTP found. Please login again.' });
    }

    const record = rows[0];

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      return res.status(401).json({ error: 'OTP has expired (5 min). Please login again.' });
    }

    // Check code
    if (record.otp_code !== otpCode.trim()) {
      return res.status(401).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Mark as verified
    await pool.query(
      `UPDATE otp_table SET verified = TRUE WHERE otp_id = $1`,
      [record.otp_id]
    );

    res.json({
      success:        true,
      userId,
      userName:       record.user_name,
      emailId:        record.email_id,
      phoneNumber:    record.phone_number,
      roleName:       record.roleName,
      featureAllowed: record.featureAllowed,
    });

  } catch (err) {
    console.error('OTP verify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
