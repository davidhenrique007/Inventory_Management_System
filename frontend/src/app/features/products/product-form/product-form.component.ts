import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';
import { ProductValidator } from '../../../validators/product.validator';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    ImageUploadComponent,
    InputMaskDirective
  ],
  template: `
    <div class="product-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEditing ? 'Editar Produto' : 'Novo Produto' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome do produto</mat-label>
                <input matInput formControlName="name" placeholder="Ex: Notebook Dell Inspiron">
                <mat-error *ngIf="productForm.get('name')?.hasError('required')">
                  Nome é obrigatório
                </mat-error>
                <mat-error *ngIf="productForm.get('name')?.hasError('minlength')">
                  Nome deve ter no mínimo 3 caracteres
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Código de barras</mat-label>
                <input matInput formControlName="code" placeholder="Código único do produto">
                <mat-error *ngIf="productForm.get('code')?.hasError('required')">
                  Código é obrigatório
                </mat-error>
                <mat-error *ngIf="productForm.get('code')?.hasError('minlength')">
                  Código deve ter no mínimo 3 caracteres
                </mat-error>
                <mat-error *ngIf="productForm.get('code')?.hasError('unique')">
                  Este código já está em uso
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoryId">
                  <mat-option *ngFor="let cat of categories" [value]="cat.id">
                    {{ cat.name }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="productForm.get('categoryId')?.hasError('required')">
                  Categoria é obrigatória
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Preço de venda</mat-label>
                <input matInput formControlName="price" appInputMask="currency">
                <mat-error *ngIf="productForm.get('price')?.hasError('required')">
                  Preço é obrigatório
                </mat-error>
                <mat-error *ngIf="productForm.get('price')?.hasError('invalid')">
                  Preço inválido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Preço de custo</mat-label>
                <input matInput formControlName="costPrice" appInputMask="currency">
              </mat-form-field>
            </div>

            <div class="form-row three-columns">
              <mat-form-field appearance="outline">
                <mat-label>Quantidade em estoque</mat-label>
                <input matInput formControlName="stockQuantity" type="number">
                <mat-error *ngIf="productForm.get('stockQuantity')?.hasError('negative')">
                  Quantidade não pode ser negativa
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estoque mínimo</mat-label>
                <input matInput formControlName="minStock" type="number">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estoque máximo</mat-label>
                <input matInput formControlName="maxStock" type="number">
                <mat-error *ngIf="productForm.get('maxStock')?.hasError('minGreater')">
                  Estoque mínimo não pode ser maior que o máximo
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Localização</mat-label>
                <input matInput formControlName="location" placeholder="Ex: A-01-01">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descrição</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Descrição detalhada do produto"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <label class="image-label">Imagem do produto</label>
              <app-image-upload formControlName="image"></app-image-upload>
            </div>

            <div class="form-row">
              <mat-slide-toggle formControlName="isActive">Produto ativo</mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button type="button" mat-button (click)="goBack()">Cancelar</button>
              <button type="submit" mat-raised-button color="primary" [disabled]="productForm.invalid || saving">
                <mat-spinner diameter="20" *ngIf="saving"></mat-spinner>
                <span *ngIf="!saving">{{ isEditing ? 'Atualizar' : 'Salvar' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .product-form-container {
      max-width: 800px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .form-row {
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .three-columns {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }
    .image-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .form-actions button[type="submit"] {
      min-width: 120px;
    }
    .form-actions mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
    @media (max-width: 600px) {
      .two-columns, .three-columns {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  isEditing = false;
  productId: string | null = null;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: ['', Validators.required],
      price: [null, [Validators.required, ProductValidator.priceValid()]],
      costPrice: [null],
      stockQuantity: [0, ProductValidator.stockValid()],
      minStock: [5],
      maxStock: [100],
      location: [''],
      description: [''],
      image: [null],
      isActive: [true]
    }, { validators: ProductValidator.minMaxStock('minStock', 'maxStock') });
  }

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.productId = id;
      this.loadProduct();
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories({ limit: 100 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data.categories;
        }
      }
    });
  }

  loadProduct(): void {
    if (!this.productId) return;

    this.productService.getProductById(this.productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.productForm.patchValue({
            name: response.data.name,
            code: response.data.code,
            categoryId: response.data.category?.id,
            price: response.data.price,
            costPrice: response.data.costPrice,
            stockQuantity: response.data.stockQuantity,
            minStock: response.data.minStock,
            maxStock: response.data.maxStock,
            location: response.data.location,
            description: response.data.description,
            isActive: response.data.isActive
          });
        }
      },
      error: () => {
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.saving = true;
    const data = this.productForm.value;

    const request = this.isEditing
      ? this.productService.updateProduct(this.productId!, data)
      : this.productService.createProduct(data);

    request.subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (error) => {
        const message = error.error?.message || 'Erro ao salvar produto';
        alert(message);
        this.saving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
