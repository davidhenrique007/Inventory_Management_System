import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ],
  template: `
    <div class="image-upload-container">
      <div class="preview-area" *ngIf="previewUrl">
        <img [src]="previewUrl" alt="Preview" class="preview-image">
        <button type="button" mat-icon-button class="remove-btn" (click)="removeImage()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="upload-area" *ngIf="!previewUrl" (click)="fileInput.click()">
        <input
          #fileInput
          type="file"
          accept="image/jpeg,image/png,image/webp"
          (change)="onFileSelected($event)"
          style="display: none"
        >
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <p>Clique para selecionar uma imagem</p>
        <small>Formatos: JPG, PNG, WEBP (máx. 5MB)</small>
      </div>
    </div>
  `,
  styles: [`
    .image-upload-container {
      width: 100%;
    }
    .preview-area {
      position: relative;
      display: inline-block;
    }
    .preview-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid #e0e0e0;
    }
    .remove-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .upload-area:hover {
      border-color: #3f51b5;
      background: #f5f5f5;
    }
    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
      margin-bottom: 16px;
    }
    .upload-area p {
      margin: 8px 0;
      color: #666;
    }
    .upload-area small {
      color: #999;
      font-size: 12px;
    }
  `]
})
export class ImageUploadComponent implements ControlValueAccessor {
  @Input() imageUrl: string | null = null;
  @Output() imageChange = new EventEmitter<File | null>();

  previewUrl: string | null = null;
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: string | null): void {
    if (value) {
      this.previewUrl = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem não pode exceder 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.onChange(file);
      this.imageChange.emit(file);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.previewUrl = null;
    this.onChange(null);
    this.imageChange.emit(null);
  }
}
