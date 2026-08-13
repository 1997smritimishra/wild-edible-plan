'use strict';
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// POST /api/users/create  — Admin creates a new user
router.post('/create', async (req, res) => {
  const { userName, roleId, phoneNumber, emailId } = req.body;

  if (!userName || !roleId) {
    return res.status(400).json({ error: 'userName and roleId are required' });
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO new_user_table (role_id, user_name, phone_number, email_id)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id AS "userId", user_name AS "userName",
                role_id AS "roleId", phone_number AS "phoneNumber",
                email_id AS "emailId"
    `, [roleId, userName, phoneNumber || null, emailId || null]);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users  — list all users with role name
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.user_id AS "userId", u.user_name AS "userName",
             u.phone_number AS "phoneNumber", u.email_id AS "emailId",
             TRIM(r.role_name) AS "roleName"
      FROM new_user_table u
      JOIN role_table r ON u.role_id = r.role_id
      ORDER BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
