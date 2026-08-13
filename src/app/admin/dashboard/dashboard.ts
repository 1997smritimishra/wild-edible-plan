import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  stats = [
    { label: 'Total Plants',    value: '1,284', icon: '🌿', color: '#14532d' },
    { label: 'Pending Reviews', value: '23',    icon: '⏳', color: '#b45309' },
    { label: 'Active Users',    value: '47',    icon: '👥', color: '#1d4ed8' },
    { label: 'GIS Layers',      value: '12',    icon: '🗺️',  color: '#7c3aed' },
  ];

  recentActivity = [
    { user: 'admin',   action: 'Approved plant record #1042',     time: '2 min ago',   type: 'success' },
    { user: 'rajan',   action: 'Uploaded new satellite layer',     time: '15 min ago',  type: 'info'    },
    { user: 'priya',   action: 'Submitted plant for validation',   time: '1 hr ago',    type: 'warning' },
    { user: 'system',  action: 'Audit log export completed',       time: '3 hrs ago',   type: 'info'    },
    { user: 'admin',   action: 'Rejected duplicate entry #998',    time: '5 hrs ago',   type: 'danger'  },
  ];
}
