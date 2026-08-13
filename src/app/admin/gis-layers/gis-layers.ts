import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gis-layers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">GIS Layer Management</h2>
        <span class="page-sub">Manage satellite and vector map layers</span>
      </div>
      <button class="btn-primary">+ Add Layer</button>
    </div>
    <div class="card">
      <table class="admin-table">
        <thead><tr><th>#</th><th>Layer Name</th><th>Type</th><th>Source</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let l of layers; let i = index">
            <td class="muted">{{ i + 1 }}</td>
            <td><strong>{{ l.name }}</strong></td>
            <td>{{ l.type }}</td>
            <td class="muted">{{ l.source }}</td>
            <td><span class="status-badge" [class.on]="l.active">{{ l.active ? 'Active' : 'Disabled' }}</span></td>
            <td><button class="act-btn edit">Edit</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrl: '../users/users.css',
})
export class GisLayersComponent {
  layers = [
    { name: 'Satellite Base',       type: 'WMTS',   source: '192.24.10.56:8080', active: true  },
    { name: 'Plant Distribution',   type: 'WFS',    source: 'PostGIS',           active: true  },
    { name: 'Terrain Relief',       type: 'WPS',    source: '192.24.10.56:8080', active: true  },
    { name: 'Administrative Zones', type: 'Vector', source: 'GeoServer',         active: false },
    { name: 'Hydrology Layer',      type: 'WMS',    source: 'GeoServer',         active: true  },
  ];
}
