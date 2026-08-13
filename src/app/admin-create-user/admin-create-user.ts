import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Role    { roleId: number; roleName: string; featureAllowed: string; }
interface Feature { featureId: number; featureName: string; permissions: string; }

const API = 'http://localhost:8080/api';

// Icon map per feature name
const FEATURE_ICONS: Record<string, string> = {
  'gis page':      '🗺️',
  'upload plant':  '📤',
  'approve':       '✅',
  'reports':       '📊',
};

@Component({
  selector: 'app-admin-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-create-user.html',
  styleUrl: './admin-create-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCreateUserComponent implements OnInit {

  // Form fields
  userName    = '';
  phoneNumber = '';
  emailId     = '';
  selectedRoleId: number | null = null;

  // API data
  roles:    Role[]    = [];
  features: Feature[] = [];

  // UI state
  loading     = false;
  saving      = false;
  successMsg  = '';
  errorMsg    = '';

  constructor(
    private http:   HttpClient,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.loading = true;
    this.http.get<Role[]>(`${API}/roles`).subscribe({
      next: roles => {
        this.roles   = roles;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        this.errorMsg = 'Failed to load roles: ' + err.message;
        this.loading  = false;
        this.cdr.markForCheck();
      },
    });
  }

  // Called when role dropdown changes
  onRoleChange(): void {
    if (!this.selectedRoleId) { this.features = []; return; }
    this.http.get<Feature[]>(`${API}/roles/features/${this.selectedRoleId}`).subscribe({
      next: features => {
        this.features = features;
        this.cdr.markForCheck();
      },
    });
  }

  featureIcon(name: string): string {
    return FEATURE_ICONS[name.toLowerCase().trim()] ?? '🔹';
  }

  // Create user
  createUser(): void {
    if (!this.userName.trim() || !this.selectedRoleId) return;
    this.saving = true;
    this.errorMsg = '';

    this.http.post(`${API}/users/create`, {
      userName:    this.userName.trim(),
      roleId:      this.selectedRoleId,
      phoneNumber: this.phoneNumber.trim(),
      emailId:     this.emailId.trim(),
    }).subscribe({
      next: () => {
        this.successMsg = `✅ User "${this.userName}" created successfully!`;
        this.saving     = false;
        this.userName   = '';
        this.phoneNumber = '';
        this.emailId    = '';
        this.selectedRoleId = null;
        this.features   = [];
        this.cdr.markForCheck();
        setTimeout(() => { this.successMsg = ''; this.cdr.markForCheck(); }, 3000);
      },
      error: err => {
        this.errorMsg = 'Failed to create user: ' + (err.error?.error ?? err.message);
        this.saving   = false;
        this.cdr.markForCheck();
      },
    });
  }

  back(): void { this.router.navigate(['/entry']); }
}
