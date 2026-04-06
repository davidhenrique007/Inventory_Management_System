import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort'; // <-- CORREÇÃO AQUI
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService, Product, ProductFilters } from '../../../core/services/product.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { StockBadgeComponent } from '../../../shared/components/stock-badge/stock-badge.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { CurrencyFormatPipe } from '../../../pipes/currency-format.pipe';
import { HighlightDirective } from '../../../directives/highlight.directive';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    StockBadgeComponent,
    SearchBarComponent,
    CurrencyFormatPipe,
    HighlightDirective
  ],
  template: `
    <div class="product-list-container">
      <div class="page-header">
        <h1>Produtos</h1>
        <button mat-raised-button color="primary" (click)="navigateToCreate()">
          <mat-icon>add</mat-icon>
          Novo Produto
        </button>
      </div>

      <div class="filters-bar">
        <app-search-bar
          placeholder="Buscar por nome ou código..."
          (search)="onSearchChange($event)"
        ></app-search-bar>

        <mat-form-field appearance="outline" class="category-filter">
          <mat-label>Categoria</mat-label>
          <mat-select [(ngModel)]="filters.category" (selectionChange)="applyFilters()">
            <mat-option value="">Todas</mat-option>
            <mat-option *ngFor="let cat of categories" [value]="cat.id">
              {{ cat.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="stock-filter">
          <mat-label>Filtro de estoque</mat-label>
          <mat-select [(ngModel)]="filters.lowStock" (selectionChange)="applyFilters()">
            <mat-option [value]="undefined">Todos</mat-option>
            <mat-option [value]="true">Estoque baixo</mat-option>
            <mat-option [value]="false">Estoque normal</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading">
        <div class="empty-state" *ngIf="products.length === 0">
          <mat-icon>inventory_2</mat-icon>
          <p>Nenhum produto encontrado</p>
          <button mat-stroked-button color="primary" (click)="navigateToCreate()">
            Adicionar primeiro produto
          </button>
        </div>

        <div *ngIf="products.length > 0">
          <div class="table-container">
            <table mat-table [dataSource]="products" matSort (matSortChange)="onSortChange($event)" class="mat-elevation-z1">

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Produto </th>
                <td mat-cell *matCellDef="let product">
                  <div class="product-name">
                    <div class="product-info">
                      <div class="product-title" [appHighlight]="searchTerm">
                        {{ product.name }}
                      </div>
                      <div class="product-code">Código: {{ product.code }}</div>
                    </div>
                  </div>
                 </td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Categoria </th>
                <td mat-cell *matCellDef="let product"> {{ product.category?.name || '—' }}  </td>
              </ng-container>

              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Preço </th>
                <td mat-cell *matCellDef="let product"> {{ product.price | currencyFormat }}  </td>
              </ng-container>

              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Estoque </th>
                <td mat-cell *matCellDef="let product">
                  <app-stock-badge
                    [stockQuantity]="product.stockQuantity"
                    [minStock]="product.minStock || 5"
                  ></app-stock-badge>
                 </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Criado em </th>
                <td mat-cell *matCellDef="let product"> {{ product.createdAt | date:'dd/MM/yyyy' }}  </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Ações </th>
                <td mat-cell *matCellDef="let product">
                  <button mat-icon-button color="primary" (click)="navigateToEdit(product.id)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteProduct(product)" matTooltip="Excluir">
                    <mat-icon>delete</mat-icon>
                  </button>
                 </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"> </tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"> </tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-list-container {
      padding: 24px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .filters-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .filters-bar app-search-bar {
      flex: 2;
      min-width: 250px;
    }
    .category-filter, .stock-filter {
      width: 200px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .empty-state {
      text-align: center;
      padding: 48px;
      background: #fafafa;
      border-radius: 8px;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
      margin-bottom: 16px;
    }
    .empty-state p {
      margin-bottom: 16px;
      color: #666;
    }
    .table-container {
      overflow-x: auto;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
    }
    .product-name {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .product-info {
      flex: 1;
    }
    .product-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .product-code {
      font-size: 12px;
      color: #666;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  searchTerm = '';

  displayedColumns: string[] = ['name', 'category', 'price', 'stock', 'createdAt', 'actions'];

  totalItems = 0;
  currentPage = 0;
  pageSize = 10;

  filters: ProductFilters = {
    page: 1,
    limit: 10,
    sortBy: 'name',
    order: 'ASC'
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
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

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data.products;
          this.totalItems = response.data.pagination.total;
          this.currentPage = response.data.pagination.page - 1;
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar produtos', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.filters.name = term || undefined;
    this.filters.page = 1;
    this.loadProducts();
  }

  applyFilters(): void {
    this.filters.page = 1;
    this.loadProducts();
  }

  onSortChange(sort: Sort): void {
    this.filters.sortBy = sort.active;
    this.filters.order = sort.direction === 'asc' ? 'ASC' : sort.direction === 'desc' ? 'DESC' : undefined;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.loadProducts();
  }

  navigateToCreate(): void {
    this.router.navigate(['/products/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/products', id]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Produto excluído com sucesso', 'Fechar', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => {
          const message = error.error?.message || 'Erro ao excluir produto';
          this.snackBar.open(message, 'Fechar', { duration: 5000 });
        }
      });
    }
  }
}
