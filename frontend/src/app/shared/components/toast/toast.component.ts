import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast" [ngClass]="type" [class.hide]="!visible">
      <div class="toast-icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="toast-content">
        <strong *ngIf="title">{{ title }}</strong>
        <p>{{ message }}</p>
      </div>
      <button class="toast-close" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 280px;
      max-width: 400px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    }
    .toast.hide {
      animation: slideOut 0.3s ease-out forwards;
    }
    .toast-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .toast-content {
      flex: 1;
    }
    .toast-content strong {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }
    .toast-content p {
      margin: 0;
      font-size: 13px;
      color: #666;
    }
    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      opacity: 0.6;
    }
    .toast-close:hover {
      opacity: 1;
    }
    .toast-close mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .success { border-left: 4px solid #4caf50; }
    .success .toast-icon mat-icon { color: #4caf50; }
    .error { border-left: 4px solid #f44336; }
    .error .toast-icon mat-icon { color: #f44336; }
    .warning { border-left: 4px solid #ff9800; }
    .warning .toast-icon mat-icon { color: #ff9800; }
    .info { border-left: 4px solid #2196f3; }
    .info .toast-icon mat-icon { color: #2196f3; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `]
})
export class ToastComponent implements OnDestroy {
  @Input() type: ToastType = 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() duration: number = 3000;
  @Output() closed = new EventEmitter<void>();

  visible = true;
  private timeout: any;

  constructor() {
    this.timeout = setTimeout(() => {
      this.close();
    }, this.duration);
  }

  ngOnDestroy(): void {
    if (this.timeout) clearTimeout(this.timeout);
  }

  close(): void {
    this.visible = false;
    setTimeout(() => {
      this.closed.emit();
    }, 300);
  }

  get icon(): string {
    const icons: Record<ToastType, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[this.type];
  }
}
