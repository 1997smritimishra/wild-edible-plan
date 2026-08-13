import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { MapService } from '../services/map.service';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements AfterViewInit {

  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() }),   // OpenStreetMap — no server needed
      ],
      view: new View({
        center: fromLonLat([78, 26]),   // India centre (WebMercator)
        zoom: 5,
      }),
    });

    this.mapService.registerMap(map);
  }
}
