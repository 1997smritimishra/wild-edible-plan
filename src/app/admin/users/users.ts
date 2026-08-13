import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersComponent {
  searchQuery = '';

  users = [
    { id: 1, name: 'Admin User',   email: 'admin@gis.gov',  role: 'Admin',      status: 'Active'   },
    { id: 2, name: 'Rajan Kumar',  email: 'rajan@gis.gov',  role: 'Editor',     status: 'Active'   },
    { id: 3, name: 'Priya Sharma', email: 'priya@gis.gov',  role: 'Viewer',     status: 'Active'   },
    { id: 4, name: 'Dev Patel',    email: 'dev@gis.gov',    role: 'Validator',  status: 'Inactive' },
    { id: 5, name: 'Sana Mirza',   email: 'sana@gis.gov',   role: 'Editor',     status: 'Active'   },
  ];

  get filteredUsers() {
    if (!this.searchQuery.trim()) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }

  roleColor(role: string): string {
    return { Admin: '#7c3aed', Editor: '#1d4ed8', Viewer: '#0369a1', Validator: '#15803d' }[role] ?? '#475569';
  }
}
