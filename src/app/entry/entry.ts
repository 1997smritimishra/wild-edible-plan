import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserSessionService } from '../services/user-session.service';

@Component({
  selector: 'app-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entry.html',
  styleUrl: './entry.css',
})
export class EntryComponent {

  cards = [
    {
      id:    'admin',
      label: 'Admin',
      icon:  '🔧',
      desc:  'Create users, manage roles and system settings',
      color: '#1e3a5f',
      badge: 'Admin only',
    },
    {
      id:    'reviewer',
      label: 'Reviewer',
      icon:  '🔍',
      desc:  'Review & approve plant submissions, view reports',
      color: '#92400e',
      badge: 'Features: GIS, Approve, Reports',
    },
    {
      id:    'fieldoperator',
      label: 'Field Operator',
      icon:  '🌿',
      desc:  'Upload plant records and view GIS map',
      color: '#14532d',
      badge: 'Features: GIS, Upload Plant',
    },
  ];

  constructor(
    private router:  Router,
    private session: UserSessionService,
  ) {}

  select(id: string): void {
    if (id === 'admin') {
      // Admin goes to user-create page
      this.router.navigate(['/admin-create-user']);
    } else if (id === 'reviewer') {
      // Reviewer → set session with download permission → portal
      this.session.save({ name: 'Reviewer', phone: '', email: '', permission: 'both' });
      this.router.navigate(['/']);
    } else if (id === 'fieldoperator') {
      // Field Operator → set session with view permission → portal
      this.session.save({ name: 'Field Operator', phone: '', email: '', permission: 'view' });
      this.router.navigate(['/']);
    }
  }
}
