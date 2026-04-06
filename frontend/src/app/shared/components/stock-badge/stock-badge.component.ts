import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="stock-badge" [ngClass]="stockClass">
      <span class="stock-icon">{{ icon }}</span>
      <span class="stock-value">{{ stockQuantity }}</span>
    </span>
  `,
  styles: [`
    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      background: #f5f5f5;
      color: #666;
    }
    .stock-icon {
      font-size: 14px;
    }
    .stock-value {
      font-weight: 600;
    }
    .normal {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .low {
      background: #fff3e0;
      color: #ed6c02;
    }
    .critical {
      background: #ffebee;
      color: #d32f2f;
    }
  `]
})
export class StockBadgeComponent {
  @Input() stockQuantity: number = 0;
  @Input() minStock: number = 5;

  get stockClass(): string {
    if (this.stockQuantity === 0) return 'critical';
    if (this.stockQuantity <= this.minStock) return 'low';
    return 'normal';
  }

  get icon(): string {
    if (this.stockQuantity === 0) return '⚠️';
    if (this.stockQuantity <= this.minStock) return '📦';
    return '✅';
  }
}
