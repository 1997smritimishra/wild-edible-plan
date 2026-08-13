import { Routes } from '@angular/router';

export const routes: Routes = [
  // ── Welcome (role select + login) — first page ───────────
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome').then(m => m.WelcomeComponent),
  },
  // ── OTP verification ──────────────────────────────────────
  {
    path: 'verify-otp',
    loadComponent: () => import('./verify-otp/verify-otp').then(m => m.VerifyOtpComponent),
  },
  // ── GIS Portal (after successful login) ───────────────────
  {
    path: '',
    loadComponent: () => import('./portal/portal').then(m => m.PortalComponent),
  },
  // ── Admin Console ─────────────────────────────────────────
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  // Default redirect → welcome
  { path: '**', redirectTo: 'welcome' },
];
