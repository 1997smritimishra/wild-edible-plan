import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShellComponent {
  sidebarOpen = true;

  navItems = [
    { label: 'Dashboard',       icon: '📊', route: '/admin/dashboard'   },
    { label: 'User Management', icon: '👥', route: '/admin/users'        },
    { label: 'GIS Layers',      icon: '🗺️',  route: '/admin/gis-layers'  },
    { label: 'Plant Approvals', icon: '✅', route: '/admin/approvals'   },
    { label: 'Audit Log',       icon: '📋', route: '/admin/audit'       },
    { label: 'Configuration',   icon: '⚙️',  route: '/admin/config'      },
  ];

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
