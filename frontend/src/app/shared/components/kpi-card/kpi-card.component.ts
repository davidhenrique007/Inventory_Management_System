import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="kpi-card" [class.warning]="type === 'warning'" [class.danger]="type === 'danger'">
      <mat-card-content>
        <div class="kpi-header">
          <span class="kpi-title">{{ title }}</span>
          <mat-icon class="kpi-icon" [class]="type">{{ icon }}</mat-icon>
        </div>
        <div class="kpi-value">{{ value | number: '1.0-0' }}</div>
        <div class="kpi-subtitle" *ngIf="subtitle">{{ subtitle }}</div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .kpi-card {
      border-radius: 16px;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .kpi-title {
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      letter-spacing: 0.3px;
    }
    .kpi-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #3b82f6;
    }
    .kpi-icon.warning {
      color: #f59e0b;
    }
    .kpi-icon.danger {
      color: #ef4444;
    }
    .kpi-value {
      font-size: 32px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .kpi-subtitle {
      font-size: 12px;
      color: #94a3b8;
    }
    .kpi-card.warning .kpi-icon { color: #f59e0b; }
    .kpi-card.danger .kpi-icon { color: #ef4444; }
  `]
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() icon: string = 'trending_up';
  @Input() subtitle?: string;
  @Input() type: 'default' | 'warning' | 'danger' = 'default';
}
