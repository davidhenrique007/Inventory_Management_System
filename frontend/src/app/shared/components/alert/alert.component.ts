import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="alert" [ngClass]="type" *ngIf="visible">
      <mat-icon class="alert-icon">{{ icon }}</mat-icon>
      <div class="alert-content">
        <strong *ngIf="title">{{ title }}</strong>
        <p>{{ message }}</p>
      </div>
      <button class="alert-close" (click)="close()" *ngIf="dismissible">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      animation: slideIn 0.2s ease-out;
    }

    .alert-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .alert-content {
      flex: 1;
    }

    .alert-content strong {
      display: block;
      margin-bottom: 4px;
    }

    .alert-content p {
      margin: 0;
      font-size: 14px;
    }

    .alert-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .alert-close:hover {
      opacity: 1;
    }

    .alert-close mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .success {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
    }
    .success .alert-icon { color: #4caf50; }

    .error {
      background: #ffebee;
      border-left: 4px solid #f44336;
    }
    .error .alert-icon { color: #f44336; }

    .warning {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
    }
    .warning .alert-icon { color: #ff9800; }

    .info {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
    }
    .info .alert-icon { color: #2196f3; }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() title: string = '';
  @Input() dismissible: boolean = true;
  @Input() visible: boolean = true;

  @Output() closed = new EventEmitter<void>();

  get icon(): string {
    const icons: Record<AlertType, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[this.type];
  }

  close(): void {
    this.visible = false;
    this.closed.emit();
  }
}
