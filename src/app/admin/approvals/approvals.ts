import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Plant Approval Workflows</h2>
        <span class="page-sub">Review and approve scientific plant submissions</span>
      </div>
    </div>
    <div class="card">
      <table class="admin-table">
        <thead><tr><th>#</th><th>Plant Name</th><th>Submitted By</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let p of pending; let i = index">
            <td class="muted">{{ i + 1 }}</td>
            <td><em>{{ p.name }}</em></td>
            <td>{{ p.user }}</td>
            <td class="muted">{{ p.date }}</td>
            <td><span class="badge badge-warning">Pending</span></td>
            <td class="action-cell">
              <button class="act-btn edit">Approve</button>
              <button class="act-btn delete">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrl: '../users/users.css',
})
export class ApprovalsComponent {
  pending = [
    { name: 'Ficus benghalensis',  user: 'priya',  date: '2026-07-28' },
    { name: 'Ocimum tenuiflorum',  user: 'rajan',  date: '2026-07-30' },
    { name: 'Azadirachta indica',  user: 'dev',    date: '2026-08-01' },
    { name: 'Mangifera indica',    user: 'sana',   date: '2026-08-03' },
  ];
}
