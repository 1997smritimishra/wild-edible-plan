import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Audit Log</h2>
        <span class="page-sub">System activity and security audit trail</span>
      </div>
      <button class="btn-primary">Export CSV</button>
    </div>
    <div class="card">
      <table class="admin-table">
        <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>IP Address</th><th>Result</th></tr></thead>
        <tbody>
          <tr *ngFor="let log of logs">
            <td class="muted">{{ log.time }}</td>
            <td>{{ log.user }}</td>
            <td>{{ log.action }}</td>
            <td class="muted">{{ log.ip }}</td>
            <td><span class="badge" [class.badge-success]="log.ok" [class.badge-danger]="!log.ok">
              {{ log.ok ? 'Success' : 'Failed' }}
            </span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrl: '../users/users.css',
})
export class AuditComponent {
  logs = [
    { time: '2026-08-05 09:12', user: 'admin',  action: 'User login',                ip: '10.0.0.1',  ok: true  },
    { time: '2026-08-05 09:15', user: 'rajan',  action: 'Uploaded GIS layer',        ip: '10.0.0.12', ok: true  },
    { time: '2026-08-05 09:44', user: 'unknown',action: 'Failed login attempt',      ip: '45.33.22.1',ok: false },
    { time: '2026-08-05 10:02', user: 'priya',  action: 'Submitted plant record',    ip: '10.0.0.15', ok: true  },
    { time: '2026-08-05 10:30', user: 'admin',  action: 'Approved plant #1042',      ip: '10.0.0.1',  ok: true  },
    { time: '2026-08-05 11:05', user: 'dev',    action: 'Exported audit log',        ip: '10.0.0.20', ok: true  },
  ];
}
