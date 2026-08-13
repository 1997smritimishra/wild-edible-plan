import { Routes } from '@angular/router';

export const routes: Routes = [
  // ── Entry (role selection — first page) ───────────────────
  {
    path: 'entry',
    loadComponent: () => import('./entry/entry').then(m => m.EntryComponent),
  },
  // ── Admin: Create User page ───────────────────────────────
  {
    path: 'admin-create-user',
    loadComponent: () => import('./admin-create-user/admin-create-user')
      .then(m => m.AdminCreateUserComponent),
  },
  // ── User registration (field operator / reviewer flow) ───
  {
    path: 'register',
    loadComponent: () => import('./user-register/user-register')
      .then(m => m.UserRegisterComponent),
  },
  // ── GIS Portal ────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./portal/portal').then(m => m.PortalComponent),
  },
  // ── Admin Console (existing) ──────────────────────────────
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  // Default
  { path: '**', redirectTo: 'entry' },
];
