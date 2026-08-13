import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Map from 'ol/Map';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import { transformExtent, transform } from 'ol/proj';
import { Extent } from 'ol/extent';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
export interface LatLon { lat: number; lon: number; }

@Injectable({ providedIn: 'root' })
export class MapService {

  private mapInstance!: Map;
  private overlayLayer: ImageLayer<ImageStatic> | null = null;
  private aoiLayer: VectorLayer<VectorSource> | null = null;

  /** Emits a picked coordinate when map-pick mode is active */
  readonly coordPicked$ = new Subject<LatLon>();

  private pickMode = false;
  private pickListener?: (e: any) => void;

  // ── Map registration ─────────────────────────────
  registerMap(map: Map): void {
    this.mapInstance = map;
  }

  // ── Map-click coordinate picking ─────────────────

  /**
   * Activate pick mode: the next map click emits via coordPicked$
   * and automatically deactivates pick mode.
   */
  startPickMode(): void {
    if (!this.mapInstance) return;
    this.pickMode = true;
    // Change cursor to crosshair
    (this.mapInstance.getTargetElement() as HTMLElement).style.cursor = 'crosshair';

    this.pickListener = (evt: any) => {
      if (!this.pickMode) return;
      const mapProj = this.mapInstance.getView().getProjection();
      const [lon, lat] = transform(evt.coordinate, mapProj, 'EPSG:4326');
      this.coordPicked$.next({ lat, lon });
      this.stopPickMode();
    };

    this.mapInstance.once('singleclick', this.pickListener as any);
  }

  stopPickMode(): void {
    this.pickMode = false;
    if (this.mapInstance) {
      (this.mapInstance.getTargetElement() as HTMLElement).style.cursor = '';
    }
  }

  // ── AOI Drawing ───────────────────────────────────

  /**
   * Draw AOI rectangle.
   * extent4326: [minLon, minLat, maxLon, maxLat]
   */
  drawAOI(extent4326: [number, number, number, number]): void {
    if (!this.mapInstance) return;

    const [minLon, minLat, maxLon, maxLat] = extent4326;

    // Validate non-empty extent
    if (minLon === maxLon || minLat === maxLat) {
      console.warn('drawAOI: extent is empty, skipping draw');
      return;
    }

    if (this.aoiLayer) {
      this.mapInstance.removeLayer(this.aoiLayer);
    }

    const mapProj = this.mapInstance.getView().getProjection();

    // Convert the four corners to map projection individually
    const sw = transform([minLon, minLat], 'EPSG:4326', mapProj);
    const nw = transform([minLon, maxLat], 'EPSG:4326', mapProj);
    const ne = transform([maxLon, maxLat], 'EPSG:4326', mapProj);
    const se = transform([maxLon, minLat], 'EPSG:4326', mapProj);

    const polygon = new Polygon([[sw, nw, ne, se, sw]]);
    const feature = new Feature({ geometry: polygon });

    const source = new VectorSource({ features: [feature] });
    this.aoiLayer = new VectorLayer({
      source,
      style: new Style({
        stroke: new Stroke({ color: '#ff6600', width: 2 }),
        fill: new Fill({ color: 'rgba(255,102,0,0.10)' }),
      }),
      zIndex: 10,
    });

    this.mapInstance.addLayer(this.aoiLayer);

    // Fit map to the AOI extent
    const mapExtent = transformExtent(extent4326, 'EPSG:4326', mapProj) as Extent;
    this.mapInstance.getView().fit(mapExtent, { padding: [60, 60, 60, 60], maxZoom: 14, duration: 500 });
  }

  clearAOI(): void {
    if (this.aoiLayer && this.mapInstance) {
      this.mapInstance.removeLayer(this.aoiLayer);
      this.aoiLayer = null;
    }
  }

  // ── PNG Overlay ───────────────────────────────────

  showImageOverlay(pngUrl: string, extent4326: [number, number, number, number]): void {
    if (!this.mapInstance) return;

    if (this.overlayLayer) {
      this.mapInstance.removeLayer(this.overlayLayer);
    }

    const mapProj = this.mapInstance.getView().getProjection();
    const extent  = transformExtent(extent4326, 'EPSG:4326', mapProj) as Extent;

    this.overlayLayer = new ImageLayer({
      source: new ImageStatic({
        url: pngUrl,
        imageExtent: extent,
        projection: mapProj,
      }),
      opacity: 0.85,
      zIndex: 5,
    });

    this.mapInstance.addLayer(this.overlayLayer);
    this.mapInstance.getView().fit(extent, { padding: [60, 60, 60, 60], maxZoom: 14 });
  }

  removeImageOverlay(): void {
    if (this.overlayLayer && this.mapInstance) {
      this.mapInstance.removeLayer(this.overlayLayer);
      this.overlayLayer = null;
    }
  }
}
