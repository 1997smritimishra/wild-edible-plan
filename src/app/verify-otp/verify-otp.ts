import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserSessionService } from '../services/user-session.service';

const API = 'http://localhost:8080/api';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyOtpComponent implements OnInit {

  otpCode    = '';
  loading    = false;
  errorMsg   = '';
  phoneMasked = '';
  userName   = '';
  devOtp     = '';   // shown in dev mode only

  private userId = '';

  constructor(
    private http:    HttpClient,
    private router:  Router,
    private session: UserSessionService,
    private cdr:     ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.userId     = sessionStorage.getItem('pendingUserId')   ?? '';
    this.userName   = sessionStorage.getItem('pendingUserName') ?? '';
    this.phoneMasked = sessionStorage.getItem('phoneMasked')   ?? '';
    this.devOtp     = sessionStorage.getItem('devOtp')         ?? '';

    // If no pending login, redirect back
    if (!this.userId) {
      this.router.navigate(['/welcome']);
    }
  }

  verify(): void {
    if (!this.otpCode.trim()) return;
    this.loading  = true;
    this.errorMsg = '';

    this.http.post<any>(`${API}/auth/verify-otp`, {
      userId:  Number(this.userId),
      otpCode: this.otpCode.trim(),
    }).subscribe({
      next: res => {
        // Save session
        const features    = (res.featureAllowed ?? '').split(',').map((s: string) => s.trim());
        const canDownload = features.includes('4');
        this.session.save({
          name:       res.userName,
          phone:      res.phoneNumber ?? '',
          email:      res.emailId     ?? '',
          permission: canDownload ? 'both' : 'view',
        });

        // Clean up sessionStorage
        sessionStorage.removeItem('pendingUserId');
        sessionStorage.removeItem('pendingUserName');
        sessionStorage.removeItem('phoneMasked');
        sessionStorage.removeItem('devOtp');

        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/']);
      },
      error: err => {
        this.errorMsg = err.error?.error ?? 'OTP verification failed';
        this.loading  = false;
        this.cdr.markForCheck();
      },
    });
  }

  back(): void { this.router.navigate(['/welcome']); }
}
