import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapComponent }       from '../map/map';
import { TerrainComponent }   from '../terrain/terrain';
import { PlantComponent }     from '../plant/plant';
import { UserSessionService } from '../services/user-session.service';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [MapComponent, TerrainComponent, PlantComponent, RouterLink],
  template: `
    <app-map></app-map>
    <app-terrain></app-terrain>
    <app-plant></app-plant>
    <a routerLink="/admin" class="admin-shortcut" title="Open Admin Console">
      <span>⚙️</span>
      <span class="admin-label">Admin</span>
    </a>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100vh; }
    .admin-shortcut {
      position: fixed; bottom: 20px; right: 20px; z-index: 1200;
      display: flex; align-items: center; gap: 6px;
      padding: 9px 16px; background: #1e2a38; color: #fff;
      border-radius: 24px; text-decoration: none; font-size: 13px;
      font-weight: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: background 0.2s, transform 0.15s;
    }
    .admin-shortcut:hover { background: #2d4f78; transform: translateY(-2px); }
    @media (max-width: 640px) { .admin-label { display: none; } }
  `],
})
export class PortalComponent implements OnInit {

  constructor(private session: UserSessionService, private router: Router) {}

  ngOnInit(): void {
    // Redirect to entry if no session exists
    if (!this.session.get()) {
      this.router.navigate(['/entry']);
    }
  }
}
