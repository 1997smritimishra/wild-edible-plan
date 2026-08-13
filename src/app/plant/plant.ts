import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TerrainService } from '../services/terrain.service';
import { UserSessionService } from '../services/user-session.service';
import { Plant } from '../models/terrain.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-plant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plant.html',
  styleUrl: './plant.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlantComponent implements OnInit {

  panelOpen    = false;
  uploadOpen   = false;   // upload popup toggle
  plants: Plant[] = [];
  loading      = false;
  errorMsg     = '';

  // ── Upload form — all plant fields ───────────────
  uploadForm = {
    // Identity
    commonName:         '',
    scientificName:     '',
    family:             '',
    // Details
    habitat:            '',
    distribution:       '',
    edibleParts:        '',
    nutritionalValue:   '',
    floweringSeason:    '',
    conservationStatus: '',
    // Location
    latitude:           null as number | null,
    longitude:          null as number | null,
    // Meta
    imageId:            null as number | null,
    imageUrl:           '',
    uploadedBy:         null as number | null,
    verifiedStatus:     false,
    createdDate:        new Date().toISOString().slice(0, 10),
    // File
    imageFile:          null as File | null,
    previewUrl:         null as string | null,
  };

  constructor(
    private terrainService: TerrainService,
    private sessionService: UserSessionService,
    private cdr: ChangeDetectorRef,
  ) {}

  // Permission helpers — used in template
  get canDownload(): boolean { return this.sessionService.canDownload(); }

  ngOnInit(): void {
    this.fetchPlants();
  }

  togglePanel(): void { this.panelOpen = !this.panelOpen; }

  openUpload(): void  { this.uploadOpen = true;  this.cdr.markForCheck(); }
  closeUpload(): void {
    this.uploadOpen = false;
    this.uploadForm = {
      commonName: '', scientificName: '', family: '',
      habitat: '', distribution: '', edibleParts: '',
      nutritionalValue: '', floweringSeason: '', conservationStatus: '',
      latitude: null, longitude: null,
      imageId: null, imageUrl: '', uploadedBy: null,
      verifiedStatus: false,
      createdDate: new Date().toISOString().slice(0, 10),
      imageFile: null, previewUrl: null,
    };
    this.cdr.markForCheck();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadForm.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadForm.previewUrl = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  // ── Fetch all plants from API ─────────────────────
  private fetchPlants(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.terrainService.getAllPlants().subscribe({
      next: (data: Plant[]) => {
        this.plants  = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Plant fetch error:', err);
        this.errorMsg = 'Failed to load plant data.';
        this.loading  = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ── Download PDF ──────────────────────────────────
  downloadPDF(): void {
    if (!this.plants.length) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // ── Title ─────────────────────────────────────
    doc.setFontSize(16);
    doc.setTextColor(30, 42, 56);
    doc.text('Plant Report', 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);
    doc.text(`Total Records: ${this.plants.length}`, 14, 26);

    // ── Table ─────────────────────────────────────
    autoTable(doc, {
      startY: 30,
      head: [[
        '#',
        'Plant ID',
        'Common Name',
        'Scientific Name',
        'Family',
        'Latitude',
        'Longitude',
        'Image URL',
        'Created Date',
        'Uploaded By',
        'Verified',
      ]],
      body: this.plants.map((p, i) => [
        i + 1,
        p.plantId        ?? '',
        p.commonName     ?? '',
        p.scientificName ?? '',
        p.family         ?? '',
        p.latitude       ?? '',
        p.longitude      ?? '',
        p.imageUrl       ?? '',
        p.createdDate    ?? '',
        p.uploadedBy     ?? '',
        p.verifiedStatus ? '✓ Yes' : '✗ No',
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 42, 56],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [232, 237, 243],
      },
      // Highlight the 3 new fields with a distinct header background
      didParseCell: (data: any) => {
        // if (data.section === 'head' && data.column.index >= 8) {
        //   data.cell.styles.fillColor = [34, 139, 34];   // forest-green for the 3 key columns
        //   data.cell.styles.textColor = 255;
        // }
        if (data.section === 'body' && data.column.index === 10) {
          // Colour verified cell: green for Yes, red for No
          const val = String(data.cell.raw ?? '');
          data.cell.styles.textColor = val.includes('Yes') ? [0, 128, 0] : [180, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      columnStyles: {
        0:  { cellWidth: 8  },   // #
        1:  { cellWidth: 15 },   // Plant ID
        2:  { cellWidth: 28 },   // Common Name
        3:  { cellWidth: 35 },   // Scientific Name
        4:  { cellWidth: 25 },   // Family
        5:  { cellWidth: 18 },   // Latitude
        6:  { cellWidth: 18 },   // Longitude
        7:  { cellWidth: 30 },   // Image URL
        8:  { cellWidth: 32 },   // Created Date
        9:  { cellWidth: 18 },   // Uploaded By
        10: { cellWidth: 18 },   // Verified
      },
      margin: { left: 14, right: 14 },
    });

    doc.save('plant_report.pdf');
  }
}
