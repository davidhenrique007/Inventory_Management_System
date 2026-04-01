import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="category-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEditing ? 'Editar Categoria' : 'Nova Categoria' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome da categoria</mat-label>
              <input matInput formControlName="name" placeholder="Ex: Eletrônicos">
              <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">
                Nome é obrigatório
              </mat-error>
              <mat-error *ngIf="categoryForm.get('name')?.hasError('minlength')">
                Nome deve ter no mínimo 3 caracteres
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descrição</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Descrição da categoria (opcional)"></textarea>
              <mat-error *ngIf="categoryForm.get('description')?.hasError('maxlength')">
                Descrição não pode ter mais de 500 caracteres
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button type="button" mat-button (click)="goBack()">Cancelar</button>
              <button type="submit" mat-raised-button color="primary" [disabled]="categoryForm.invalid || loading">
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <span *ngIf="!loading">{{ isEditing ? 'Atualizar' : 'Salvar' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .category-form-container {
      max-width: 600px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }
    .form-actions button[type="submit"] {
      min-width: 100px;
    }
    .form-actions mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditing = false;
  categoryId: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.categoryId = id;
      this.loadCategory();
    }
  }

  loadCategory(): void {
    if (!this.categoryId) return;

    this.loading = true;
    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (response) => {
        if (response.success) {
          this.categoryForm.patchValue({
            name: response.data.name,
            description: response.data.description || ''
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categoria:', error);
        this.snackBar.open('Erro ao carregar categoria', 'Fechar', { duration: 3000 });
        this.router.navigate(['/categories']);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    this.loading = true;
    const data = this.categoryForm.value;

    const request = this.isEditing
      ? this.categoryService.updateCategory(this.categoryId!, data)
      : this.categoryService.createCategory(data);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          const message = this.isEditing ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!';
          this.snackBar.open(message, 'Fechar', { duration: 3000 });
          this.router.navigate(['/categories']);
        }
        this.loading = false;
      },
      error: (error) => {
        const message = error.error?.message || (this.isEditing ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria');
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }
}
