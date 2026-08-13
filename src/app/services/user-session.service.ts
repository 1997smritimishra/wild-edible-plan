import { Injectable } from '@angular/core';

export type PlantPermission = 'view' | 'download' | 'both';

export interface UserSession {
  name:        string;
  phone:       string;
  email:       string;
  permission:  PlantPermission;
}

@Injectable({ providedIn: 'root' })
export class UserSessionService {

  private session: UserSession | null = null;

  save(s: UserSession): void {
    this.session = s;
  }

  get(): UserSession | null {
    return this.session;
  }

  /** True if the user can view plant data */
  canView(): boolean {
    return !!this.session;
  }

  /** True if the user can download the PDF */
  canDownload(): boolean {
    const p = this.session?.permission;
    return p === 'download' || p === 'both';
  }

  clear(): void {
    this.session = null;
  }
}
