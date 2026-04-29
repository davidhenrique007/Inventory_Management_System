import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovementService, ProductStock } from '../../../core/services/movement.service';
import { BarcodeScannerComponent } from '../../../shared/components/barcode-scanner/barcode-scanner.component';
import { QuantitySelectorComponent } from '../../../shared/components/quantity-selector/quantity-selector.component';

@Component({
  selector: 'app-movement-out',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BarcodeScannerComponent,
    QuantitySelectorComponent
  ],
  template: `
    <div class="movement-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>remove</mat-icon>
            Saída de Estoque
          </mat-card-title>
          <mat-card-subtitle>Registrar saída de produtos do estoque</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="search-section">
            <h3>Buscar produto</h3>
            <app-barcode-scanner
              (search)="onSearchProduct($event)"
              [loading]="searching"
            ></app-barcode-scanner>
          </div>

          <div *ngIf="product" class="product-info" [class.low-stock]="isLowStock()">
            <div class="product-details">
              <div class="product-header">
                <h3>{{ product.name }}</h3>
                <span class="product-code">Código: {{ product.code }}</span>
              </div>
              <div class="stock-info">
                <span class="stock-label">Estoque disponível:</span>
                <span class="stock-value">{{ product.stockQuantity }} unidades</span>
              </div>
              <div *ngIf="isLowStock()" class="low-stock-warning">
                <mat-icon>warning</mat-icon>
                Estoque baixo! Mínimo recomendado: {{ product.minStock || 5 }}
              </div>
            </div>
          </div>

          <form [formGroup]="exitForm" (ngSubmit)="onSubmit()" *ngIf="product">
            <div class="form-row">
              <label>Quantidade a remover</label>
              <app-quantity-selector
                formControlName="quantity"
                [min]="1"
                [max]="product.stockQuantity"
                (quantityChange)="validateQuantity($event)"
              ></app-quantity-selector>
              <mat-error *ngIf="exitForm.get('quantity')?.hasError('max')">
                Quantidade não pode exceder o estoque disponível
              </mat-error>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Observação (opcional)</mat-label>
              <textarea
                matInput
                formControlName="notes"
                rows="2"
                placeholder="Ex: Venda, Devolução, Perda..."
              ></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button type="button" mat-button (click)="reset()">Limpar</button>
              <button
                type="submit"
                mat-raised-button
                color="primary"
                [disabled]="exitForm.invalid || saving"
              >
                <mat-spinner diameter="20" *ngIf="saving"></mat-spinner>
                <span *ngIf="!saving">Registrar Saída</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .movement-container {
      max-width: 600px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .search-section {
      margin-bottom: 24px;
    }
    .search-section h3 {
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 500;
    }
    .product-info {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .product-info.low-stock {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
    }
    .product-header {
      margin-bottom: 12px;
    }
    .product-header h3 {
      margin: 0 0 4px;
      font-size: 18px;
    }
    .product-code {
      font-size: 12px;
      color: #666;
    }
    .stock-info {
      display: flex;
      gap: 8px;
      font-size: 14px;
    }
    .stock-label {
      color: #666;
    }
    .stock-value {
      font-weight: 600;
      color: #3f51b5;
    }
    .low-stock-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px;
      background: #fff3e0;
      border-radius: 4px;
      color: #ed6c02;
      font-size: 13px;
    }
    .low-stock-warning mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .form-row {
      margin-bottom: 16px;
    }
    .form-row label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .full-width {
      width: 100%;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class MovementOutComponent {
  exitForm: FormGroup;
  product: ProductStock | null = null;
  searching = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private movementService: MovementService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.exitForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  onSearchProduct(code: string): void {
    if (!code) {
      this.product = null;
      return;
    }

    this.searching = true;
    this.movementService.getProductByCode(code).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.product = response.data;
          this.exitForm.get('quantity')?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(this.product.stockQuantity)
          ]);
          this.exitForm.get('quantity')?.updateValueAndValidity();
        } else {
          this.snackBar.open('Produto não encontrado', 'Fechar', { duration: 3000 });
          this.product = null;
        }
        this.searching = false;
      },
      error: () => {
        this.snackBar.open('Erro ao buscar produto', 'Fechar', { duration: 3000 });
        this.product = null;
        this.searching = false;
      }
    });
  }

  validateQuantity(quantity: number): void {
    if (this.product && quantity > this.product.stockQuantity) {
      this.exitForm.get('quantity')?.setErrors({ max: true });
    }
  }

  isLowStock(): boolean {
    return this.product ? this.product.stockQuantity <= (this.product.minStock || 5) : false;
  }

  onSubmit(): void {
    if (!this.product || this.exitForm.invalid) return;

    this.saving = true;
    const data = {
      productId: this.product.id,
      quantity: this.exitForm.value.quantity,
      notes: this.exitForm.value.notes
    };

    this.movementService.createExit(data).subscribe({
      next: () => {
        this.snackBar.open('Saída registrada com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/movements']);
      },
      error: (error) => {
        const message = error.error?.message || 'Erro ao registrar saída';
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
        this.saving = false;
      }
    });
  }

  reset(): void {
    this.product = null;
    this.exitForm.reset({ quantity: 1 });
  }
}