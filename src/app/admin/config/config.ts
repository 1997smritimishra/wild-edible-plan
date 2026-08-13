import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config.html',
  styleUrl: './config.css',
})
export class ConfigComponent {
  settings = {
    apiBase:       'http://localhost:8080/api',
    gisServerUrl:  'https://192.24.10.56:8080/IGIST',
    sessionTimeout: 30,
    maxUploadMb:   10,
    encryptionEnabled: true,
    auditEnabled:  true,
  };

  saved = false;

  save(): void {
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }
}
