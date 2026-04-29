import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuantitySelectorComponent),
      multi: true
    }
  ],
  template: `
    <div class="quantity-selector">
      <button
        type="button"
        mat-icon-button
        (click)="decrement()"
        [disabled]="disabled || value <= min"
        class="quantity-btn"
      >
        <mat-icon>remove</mat-icon>
      </button>
      
      <input
        type="number"
        class="quantity-input"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [min]="min"
        [max]="max"
        [disabled]="disabled"
        [readonly]="readonly"
      >
      
      <button
        type="button"
        mat-icon-button
        (click)="increment()"
        [disabled]="disabled || value >= max"
        class="quantity-btn"
      >
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .quantity-selector {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 4px;
      background: white;
    }
    .quantity-btn {
      width: 32px;
      height: 32px;
    }
    .quantity-input {
      width: 60px;
      text-align: center;
      border: none;
      font-size: 16px;
      font-weight: 500;
      padding: 8px 0;
    }
    .quantity-input:focus {
      outline: none;
    }
    .quantity-input[type="number"]::-webkit-inner-spin-button,
    .quantity-input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `]
})
export class QuantitySelectorComponent implements ControlValueAccessor {
  @Input() min = 1;
  @Input() max = 999999;
  @Input() disabled = false;
  @Input() readonly = false;
  @Output() quantityChange = new EventEmitter<number>();
  
  value = 1;
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: number): void {
    this.value = value || 1;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  increment(): void {
    if (this.value < this.max && !this.disabled) {
      this.value++;
      this.emit();
    }
  }

  decrement(): void {
    if (this.value > this.min && !this.disabled) {
      this.value--;
      this.emit();
    }
  }

  onValueChange(value: number): void {
    let newValue = value;
    if (isNaN(newValue)) newValue = this.min;
    if (newValue < this.min) newValue = this.min;
    if (newValue > this.max) newValue = this.max;
    
    this.value = newValue;
    this.emit();
  }

  private emit(): void {
    this.onChange(this.value);
    this.quantityChange.emit(this.value);
  }
}