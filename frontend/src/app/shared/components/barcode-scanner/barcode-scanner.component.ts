import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="barcode-container">
      <mat-form-field appearance="outline" class="barcode-field">
        <mat-label>Código de barras</mat-label>
        <input
          matInput
          [(ngModel)]="barcode"
          (ngModelChange)="onBarcodeChange()"
          (keyup.enter)="onSearch()"
          placeholder="Digite ou leia o código"
          autofocus
        >
        <mat-icon matSuffix>qr_code_scanner</mat-icon>
        <button
          *ngIf="barcode"
          mat-icon-button
          matSuffix
          (click)="clear()"
          class="clear-button"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
      <button
        mat-raised-button
        color="primary"
        (click)="onSearch()"
        [disabled]="!barcode || loading"
        class="search-button"
      >
        <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
        <span *ngIf="!loading">Buscar</span>
      </button>
    </div>
  `,
  styles: [`
    .barcode-container {
      display: flex;
      gap: 12px;
      align-items: center;
      width: 100%;
    }
    .barcode-field {
      flex: 1;
    }
    .clear-button {
      position: absolute;
      right: 8px;
      top: 0;
    }
    .search-button {
      height: 56px;
      min-width: 100px;
    }
    .search-button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class BarcodeScannerComponent {
  @Input() loading = false;
  @Output() search = new EventEmitter<string>();
  
  barcode = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value) {
        this.search.emit(value);
      }
    });
  }

  onBarcodeChange(): void {
    this.searchSubject.next(this.barcode);
  }

  onSearch(): void {
    if (this.barcode) {
      this.search.emit(this.barcode);
    }
  }

  clear(): void {
    this.barcode = '';
    this.search.emit('');
  }
}