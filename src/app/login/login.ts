import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserSessionService } from '../services/user-session.service';

const API = 'http://localhost:8080/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {

  emailId     = '';
  phoneNumber = '';
  loading     = false;
  errorMsg    = '';

  constructor(
    private http:    HttpClient,
    private router:  Router,
    private session: UserSessionService,
    private cdr:     ChangeDetectorRef,
  ) {}

  login(): void {
    if (!this.emailId.trim() || !this.phoneNumber.trim()) return;
    this.loading  = true;
    this.errorMsg = '';

    this.http.post<{ success: boolean; user: any }>(`${API}/users/login`, {
      emailId:     this.emailId.trim(),
      phoneNumber: this.phoneNumber.trim(),
    }).subscribe({
      next: res => {
        const user = res.user;

        // Map role features to session permission
        // feature_allowed contains feature IDs — 4 = Reports (download)
        const features: string[] = (user.featureAllowed ?? '').split(',').map((s: string) => s.trim());
        const canDownload = features.includes('4');
        const permission  = canDownload ? 'both' : 'view';

        this.session.save({
          name:       user.userName,
          phone:      user.phoneNumber ?? '',
          email:      user.emailId     ?? '',
          permission,
        });

        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/']);
      },
      error: err => {
        this.errorMsg = err.error?.error ?? 'Login failed. Please check your credentials.';
        this.loading  = false;
        this.cdr.markForCheck();
      },
    });
  }

  back(): void { this.router.navigate(['/entry']); }
}
