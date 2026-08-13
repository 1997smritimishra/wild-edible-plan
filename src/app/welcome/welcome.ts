import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const API = 'http://localhost:8080/api';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {

  roles = [
    { id: 'Admin',          label: 'Admin',          icon: '🔧', desc: 'System administration' },
    { id: 'Field Operator', label: 'Field Operator', icon: '🌿', desc: 'Upload plant records'   },
    { id: 'Reviewer',       label: 'Reviewer',       icon: '🔍', desc: 'Review & approve plants' },
  ];

  selectedRole = '';   // set when radio clicked
  emailId      = '';
  password     = '';
  loading      = false;
  errorMsg     = '';

  constructor(
    private http:   HttpClient,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  selectRole(roleId: string): void {
    this.selectedRole = roleId;
    this.errorMsg     = '';
    this.cdr.markForCheck();
  }

  get formVisible(): boolean { return !!this.selectedRole; }

  login(): void {
    if (!this.selectedRole || !this.emailId.trim() || !this.password) return;

    this.loading  = true;
    this.errorMsg = '';

    this.http.post<any>(`${API}/auth/login`, {
      emailId:  this.emailId.trim(),
      password: this.password,
      roleName: this.selectedRole,
    }).subscribe({
      next: res => {
        this.loading = false;
        this.cdr.markForCheck();
        // Store userId temporarily for OTP page
        sessionStorage.setItem('pendingUserId',   String(res.userId));
        sessionStorage.setItem('pendingUserName',  res.userName);
        sessionStorage.setItem('phoneMasked',      res.phoneMasked);
        // Dev only: store OTP so tester can see it
        if (res.otp) sessionStorage.setItem('devOtp', res.otp);
        this.router.navigate(['/verify-otp']);
      },
      error: err => {
        this.errorMsg = err.error?.error ?? 'Login failed';
        this.loading  = false;
        this.cdr.markForCheck();
      },
    });
  }
}
