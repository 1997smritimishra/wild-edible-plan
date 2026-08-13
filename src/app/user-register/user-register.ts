import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserSessionService, PlantPermission } from '../services/user-session.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-register.html',
  styleUrl: './user-register.css',
})
export class UserRegisterComponent {

  name       = '';
  phone      = '';
  email      = '';
  permission: PlantPermission = 'view';

  constructor(
    private session: UserSessionService,
    private router:  Router,
  ) {}

  enter(): void {
    if (!this.name.trim() || !this.email.trim()) return;

    this.session.save({
      name:       this.name.trim(),
      phone:      this.phone.trim(),
      email:      this.email.trim(),
      permission: this.permission,
    });

    this.router.navigate(['/']);
  }

  back(): void {
    this.router.navigate(['/entry']);
  }
}
