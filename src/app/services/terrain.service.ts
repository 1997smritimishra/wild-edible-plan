import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { switchMap, takeWhile, map } from 'rxjs/operators';

import {
  Plant,
  Observation,
  IdentificationResult,
} from '../models/terrain.model';
import { CryptoService } from './crypto.service';

// ── All APIs go to Node.js backend ────────────────────────
const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class TerrainService {

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private crypto: CryptoService,
  ) {}

  // ── Terrain (GDAL) ────────────────────────────────────────

  /** Start GDAL hillshade job. Returns { jobId } */
  execute(aoi: string, azimuthAngle: number, verticalAngle: number): Observable<{ jobId: string }> {
    return this.http.post<{ jobId: string }>(`${API}/terrain/execute`, {
      aoi, azimuthAngle, verticalAngle,
    });
  }

  /** Build AOI string "leftLon,topLat,rightLon,bottomLat" */
  buildAOI(
    leftLon: number, topLat: number,
    rightLon: number, bottomLat: number,
  ): string {
    return `${leftLon},${topLat},${rightLon},${bottomLat}`;
  }

  /** Poll job status every intervalMs ms */
  pollStatus(jobId: string, intervalMs = 2000): Observable<{ status: string; progress: number }> {
    return new Observable(observer => {
      this.ngZone.run(() => {
        const sub = timer(0, intervalMs).pipe(
          switchMap(() =>
            this.http.get<{ status: string; progress: number }>(
              `${API}/terrain/status/${jobId}`
            )
          ),
          takeWhile(r => r.status === 'running', true),
        ).subscribe(observer);
        return () => sub.unsubscribe();
      });
    });
  }

  /** Fetch job output when status is 'done' */
  output(jobId: string): Observable<{ fileName: string; extent: [number, number, number, number] }> {
    return this.http.get<{ fileName: string; extent: [number, number, number, number] }>(
      `${API}/terrain/output/${jobId}`
    );
  }

  /** Build URL to the generated PNG served by Node.js */
  getPngUrl(fileName: string): string {
    return `http://localhost:8080/gdal_output/${fileName}`;
  }

  // ── Plants ────────────────────────────────────────────────

  getAllPlants(): Observable<Plant[]> {
    return this.http.get<{ data: string }>(`${API}/plants/all`).pipe(
      map(res => JSON.parse(this.crypto.decrypt(res.data)) as Plant[]),
    );
  }

  getPlantById(id: number): Observable<Plant> {
    return this.http.get<{ data: string }>(`${API}/plants/${id}`).pipe(
      map(res => JSON.parse(this.crypto.decrypt(res.data)) as Plant),
    );
  }

  // ── Observations (FR06) ────────────────────────────────────

  submitObservation(
    plantId: number, userId: number,
    latitude: number, longitude: number,
    image: File,
  ): Observable<Observation> {
    const form = new FormData();
    form.append('plantId',   String(plantId));
    form.append('userId',    String(userId));
    form.append('latitude',  String(latitude));
    form.append('longitude', String(longitude));
    form.append('image',     image);
    return this.http.post<Observation>(`${API}/observations/submit`, form);
  }

  getPendingObservations(): Observable<Observation[]> {
    return this.http.get<Observation[]>(`${API}/observations/pending`);
  }

  approveObservation(id: number, feedback = ''): Observable<Observation> {
    return this.http.put<Observation>(
      `${API}/observations/${id}/approve?feedback=${encodeURIComponent(feedback)}`, {}
    );
  }

  rejectObservation(id: number, feedback: string): Observable<Observation> {
    return this.http.put<Observation>(
      `${API}/observations/${id}/reject?feedback=${encodeURIComponent(feedback)}`, {}
    );
  }

  // ── Identification (FR07) ──────────────────────────────────

  identifyPlant(image: File, note = ''): Observable<IdentificationResult[]> {
    const form = new FormData();
    form.append('image', image);
    form.append('note',  note);
    return this.http.post<IdentificationResult[]>(`${API}/identify/`, form);
  }
}
