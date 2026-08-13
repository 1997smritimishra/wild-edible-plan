import { Routes } from '@angular/router';
import { AdminShellComponent } from './admin-shell/admin-shell';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'users',     loadComponent: () => import('./users/users').then(m => m.UsersComponent) },
      { path: 'gis-layers',loadComponent: () => import('./gis-layers/gis-layers').then(m => m.GisLayersComponent) },
      { path: 'approvals', loadComponent: () => import('./approvals/approvals').then(m => m.ApprovalsComponent) },
      { path: 'audit',     loadComponent: () => import('./audit/audit').then(m => m.AuditComponent) },
      { path: 'config',    loadComponent: () => import('./config/config').then(m => m.ConfigComponent) },
    ],
  },
];
