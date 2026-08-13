import {
  Component, OnInit, OnDestroy, NgZone,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { TerrainService } from '../services/terrain.service';
import { MapService } from '../services/map.service';

type PanelState = 'idle' | 'running' | 'done' | 'error';
type PickTarget = 'topLeft' | 'bottomRight' | null;

@Component({
  selector: 'app-terrain',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terrain.html',
  styleUrl: './terrain.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerrainComponent implements OnInit, OnDestroy {

  panelOpen = false;

  // AOI corners
  leftLon:   number | null = null;
  topLat:    number | null = null;
  rightLon:  number | null = null;
  bottomLat: number | null = null;

  // Angles
  verticalAngle = 45;
  azimuthAngle  = 45;

  // Processing state
  state: PanelState = 'idle';
  progress  = 0;
  errorMsg  = '';
  jobId     = '';   // Node.js GDAL job ID

  // Map-pick
  activePickTarget: PickTarget = null;

  private pollSub?: Subscription;
  private pickSub?: Subscription;
  private outputFetched = false;

  constructor(
    private terrainService: TerrainService,
    private mapService: MapService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  // ── Panel ─────────────────────────────────────────────────
  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
    if (!this.panelOpen) this.cancelPick();
  }

  // ── Coordinate picking from map ────────────────────────────
  togglePick(target: PickTarget): void {
    if (this.activePickTarget === target) { this.cancelPick(); return; }
    this.cancelPick();
    this.activePickTarget = target;
    this.mapService.startPickMode();

    this.pickSub = this.mapService.coordPicked$.pipe(take(1)).subscribe(coord => {
      if (target === 'topLeft') {
        this.leftLon = parseFloat(coord.lon.toFixed(6));
        this.topLat  = parseFloat(coord.lat.toFixed(6));
      } else {
        this.rightLon  = parseFloat(coord.lon.toFixed(6));
        this.bottomLat = parseFloat(coord.lat.toFixed(6));
      }
      this.activePickTarget = null;
      this.cdr.markForCheck();
    });
  }

  private cancelPick(): void {
    this.mapService.stopPickMode();
    this.activePickTarget = null;
    this.pickSub?.unsubscribe();
  }

  // ── Generate (calls Node.js GDAL backend) ─────────────────
  generate(): void {
    const ext = this.buildExtent();
    if (!ext) {
      this.errorMsg = 'Please enter valid AOI coordinates.';
      this.state    = 'error';
      return;
    }

    this.mapService.drawAOI(ext);
    this.state         = 'running';
    this.progress      = 0;
    this.errorMsg      = '';
    this.outputFetched = false;

    const aoi = this.terrainService.buildAOI(
      this.leftLon!, this.topLat!, this.rightLon!, this.bottomLat!
    );

    this.terrainService.execute(aoi, this.azimuthAngle, this.verticalAngle).subscribe({
      next:  res => { this.jobId = res.jobId; this.startPolling(); },
      error: err => this.handleError('Execute failed', err),
    });
  }

  // ── Poll job status ────────────────────────────────────────
  private startPolling(): void {
    this.pollSub = this.terrainService.pollStatus(this.jobId, 2000).subscribe({
      next: res => {
        this.ngZone.run(() => {
          if (!isNaN(res.progress)) this.progress = res.progress;

          if (res.status === 'failed') {
            this.handleError('Processing failed on server', null);
            return;
          }

          if (res.status === 'done' && !this.outputFetched) {
            this.outputFetched = true;
            this.progress = 100;
            this.pollSub?.unsubscribe();
            this.fetchOutput();
          }
          this.cdr.markForCheck();
        });
      },
      error: err => this.ngZone.run(() => {
        this.handleError('Status polling failed', err);
        this.cdr.markForCheck();
      }),
    });
  }

  // ── Fetch output PNG and show on map ──────────────────────
  private fetchOutput(): void {
    this.terrainService.output(this.jobId).subscribe({
      next: res => {
        this.ngZone.run(() => {
          const url = this.terrainService.getPngUrl(res.fileName);
          this.mapService.showImageOverlay(url, res.extent);
          this.state = 'done';
          this.cdr.markForCheck();
        });
      },
      error: err => this.ngZone.run(() => {
        this.handleError('Output fetch failed', err);
        this.cdr.markForCheck();
      }),
    });
  }

  // ── Reset ─────────────────────────────────────────────────
  reset(): void {
    this.pollSub?.unsubscribe();
    this.cancelPick();
    this.mapService.removeImageOverlay();
    this.mapService.clearAOI();
    this.leftLon       = null;
    this.topLat        = null;
    this.rightLon      = null;
    this.bottomLat     = null;
    this.state         = 'idle';
    this.progress      = 0;
    this.jobId         = '';
    this.errorMsg      = '';
    this.outputFetched = false;
    this.verticalAngle = 45;
    this.azimuthAngle  = 45;
    this.cdr.markForCheck();
  }

  private handleError(msg: string, err: any): void {
    console.error(msg, err);
    this.state    = 'error';
    this.errorMsg = msg;
    this.pollSub?.unsubscribe();
  }

  private buildExtent(): [number, number, number, number] | null {
    if (this.leftLon == null || this.topLat == null ||
        this.rightLon == null || this.bottomLat == null) return null;
    const minLon = Math.min(this.leftLon,  this.rightLon);
    const maxLon = Math.max(this.leftLon,  this.rightLon);
    const minLat = Math.min(this.topLat,   this.bottomLat);
    const maxLat = Math.max(this.topLat,   this.bottomLat);
    if (minLon === maxLon || minLat === maxLat) return null;
    return [minLon, minLat, maxLon, maxLat];
  }

  // SVG circle progress helpers
  readonly circumference = 2 * Math.PI * 36;
  get dashoffset(): number {
    return this.circumference * (1 - this.progress / 100);
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.cancelPick();
  }
}
