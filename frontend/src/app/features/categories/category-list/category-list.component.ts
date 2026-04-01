import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService, Category } from '../../../core/services/category.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">Categorias</h1>
          <p class="page-subtitle">Gestão de categorias de produtos do inventário</p>
        </div>
        <button class="btn-primary" (click)="navigateToCreate()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Categoria
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Total</div>
          <div class="stat-value">{{ totalItems }}</div>
          <div class="stat-delta">categorias activas</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Nesta página</div>
          <div class="stat-value">{{ filteredCategories.length }}</div>
          <div class="stat-delta">a mostrar</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Sem descrição</div>
          <div class="stat-value">{{ countWithoutDescription }}</div>
          <div class="stat-delta" [class.warn]="countWithoutDescription > 0">categorias incompletas</div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Pesquisar por nome ou descrição…"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
          />
          <button class="search-clear" *ngIf="searchTerm" (click)="clearSearch()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="select-wrap">
          <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
            <option [value]="5">5 por página</option>
            <option [value]="10">10 por página</option>
            <option [value]="25">25 por página</option>
            <option [value]="50">50 por página</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="36"></mat-spinner>
        <span>A carregar categorias…</span>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="!loading && filteredCategories.length === 0">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 6h16M4 10h16M4 14h8M4 18h5"/>
          </svg>
        </div>
        <p class="empty-title">Nenhuma categoria encontrada</p>
        <p class="empty-sub" *ngIf="searchTerm">Tente ajustar o termo de pesquisa.</p>
        <p class="empty-sub" *ngIf="!searchTerm">Comece por criar a primeira categoria.</p>
        <button class="btn-primary" (click)="navigateToCreate()" *ngIf="!searchTerm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Criar categoria
        </button>
      </div>

      <!-- Table -->
      <div class="table-card" *ngIf="!loading && filteredCategories.length > 0">
        <div class="table-head">
          <span class="th">Nome</span>
          <span class="th">Descrição</span>
          <span class="th">Criado em</span>
          <span class="th th-actions">Ações</span>
        </div>

        <div
          class="table-row"
          *ngFor="let category of filteredCategories; let i = index"
          [style.animation-delay]="i * 40 + 'ms'"
        >
          <!-- Name -->
          <div class="cat-name-cell">
            <div class="cat-dot" [style.background]="getDotColor(i)"></div>
            <div class="cat-name-info">
              <span class="cat-name-text">{{ category.name }}</span>
            </div>
          </div>

          <!-- Description -->
          <div class="cat-desc">
            <span *ngIf="category.description">{{ category.description }}</span>
            <span class="no-desc" *ngIf="!category.description">Sem descrição</span>
          </div>

          <!-- Date -->
          <div class="date-cell">
            <span *ngIf="category.createdAt">{{ category.createdAt | date:'dd/MM/yyyy' }}</span>
            <span class="no-desc" *ngIf="!category.createdAt">—</span>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button class="icon-btn" title="Editar" (click)="navigateToEdit(category.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-btn del" title="Excluir" (click)="deleteCategory(category.id, category.name)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Paginator -->
        <div class="paginator">
          <span class="pag-info">
            Mostrando {{ paginatorFrom }}–{{ paginatorTo }} de {{ totalItems }} resultados
          </span>
          <div class="pag-controls">
            <button class="pag-btn" [disabled]="currentPage === 0" (click)="goToPage(0)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>
              </svg>
            </button>
            <button class="pag-btn" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              class="pag-btn"
              *ngFor="let p of pageNumbers"
              [class.active]="p === currentPage"
              (click)="goToPage(p)"
            >{{ p + 1 }}</button>
            <button class="pag-btn" [disabled]="currentPage === lastPage" (click)="goToPage(currentPage + 1)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            <button class="pag-btn" [disabled]="currentPage === lastPage" (click)="goToPage(lastPage)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ─── Layout ─── */
    .page {
      padding: 2rem;
      background: #f5f5f5;
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    /* ─── Header ─── */
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 22px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px;
    }
    .page-subtitle {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }

    /* ─── Primary button ─── */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1d4ed8;
      color: #fff;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .btn-primary:hover { background: #1e40af; }
    .btn-primary:active { transform: scale(0.98); }
    .btn-primary svg { width: 15px; height: 15px; }

    /* ─── Stats ─── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1rem 1.25rem;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #111827;
      line-height: 1;
    }
    .stat-delta {
      font-size: 12px;
      color: #059669;
      margin-top: 6px;
    }
    .stat-delta.warn { color: #d97706; }

    /* ─── Toolbar ─── */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 360px;
    }
    .search-wrap > svg {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 15px;
      height: 15px;
      color: #9ca3af;
      pointer-events: none;
    }
    .search-wrap input {
      width: 100%;
      padding: 9px 34px 9px 34px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
      color: #111827;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .search-wrap input:focus {
      border-color: #1d4ed8;
      box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
    }
    .search-wrap input::placeholder { color: #9ca3af; }
    .search-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #9ca3af;
      padding: 2px;
    }
    .search-clear:hover { color: #374151; }
    .search-clear svg { width: 14px; height: 14px; }
    .select-wrap select {
      padding: 9px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
      color: #374151;
      font-size: 13px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .select-wrap select:focus { border-color: #1d4ed8; }

    /* ─── Loading ─── */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 64px;
      color: #6b7280;
      font-size: 14px;
    }

    /* ─── Empty state ─── */
    .empty-state {
      text-align: center;
      padding: 64px 32px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .empty-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
    }
    .empty-icon svg { width: 28px; height: 28px; color: #1d4ed8; }
    .empty-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }
    .empty-sub { font-size: 14px; color: #6b7280; margin: 0; }

    /* ─── Table ─── */
    .table-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    .table-head {
      display: grid;
      grid-template-columns: 2fr 3fr 1.4fr 90px;
      padding: 10px 20px;
      border-bottom: 1px solid #f3f4f6;
      background: #f9fafb;
    }
    .th {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .th-actions { text-align: right; }
    .table-row {
      display: grid;
      grid-template-columns: 2fr 3fr 1.4fr 90px;
      padding: 14px 20px;
      border-bottom: 1px solid #f3f4f6;
      align-items: center;
      transition: background 0.12s;
      animation: fadeInRow 0.25s ease both;
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: #f9fafb; }
    @keyframes fadeInRow {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Name cell */
    .cat-name-cell {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .cat-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .cat-name-text {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Desc & date */
    .cat-desc {
      font-size: 13px;
      color: #374151;
      padding-right: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .date-cell { font-size: 13px; color: #6b7280; }
    .no-desc { color: #d1d5db; font-style: italic; }

    /* Actions */
    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: flex-end;
    }
    .icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.15s;
    }
    .icon-btn svg { width: 14px; height: 14px; }
    .icon-btn:hover {
      background: #eff6ff;
      color: #1d4ed8;
      border-color: #bfdbfe;
    }
    .icon-btn.del:hover {
      background: #fef2f2;
      color: #dc2626;
      border-color: #fecaca;
    }

    /* ─── Paginator ─── */
    .paginator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-top: 1px solid #f3f4f6;
      flex-wrap: wrap;
      gap: 10px;
    }
    .pag-info { font-size: 13px; color: #6b7280; }
    .pag-controls { display: flex; gap: 4px; }
    .pag-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .pag-btn:hover:not([disabled]) { background: #f3f4f6; }
    .pag-btn.active {
      background: #1d4ed8;
      color: #fff;
      border-color: #1d4ed8;
      font-weight: 600;
    }
    .pag-btn[disabled] { opacity: 0.35; cursor: not-allowed; }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = true;
  searchTerm = '';

  totalItems = 0;
  currentPage = 0;
  pageSize = 10;

  private readonly DOT_COLORS = [
    '#1d4ed8', '#059669', '#d97706', '#dc2626',
    '#7c3aed', '#0891b2', '#be185d', '#b45309'
  ];

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // ─── Computed ───────────────────────────────────────────────────

  get countWithoutDescription(): number {
    return this.categories.filter(c => !c.description || c.description.trim() === '').length;
  }

  get lastPage(): number {
    return Math.max(0, Math.ceil(this.totalItems / this.pageSize) - 1);
  }

  get pageNumbers(): number[] {
    const total = Math.ceil(this.totalItems / this.pageSize);
    const range: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(total - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  get paginatorFrom(): number {
    return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get paginatorTo(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  getDotColor(index: number): string {
    return this.DOT_COLORS[index % this.DOT_COLORS.length];
  }

  // ─── Data ────────────────────────────────────────────────────────

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories({
      page: this.currentPage + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data.categories;
          this.filteredCategories = this.categories;
          this.totalItems = response.data.pagination.total;
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar categorias', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // ─── Search ──────────────────────────────────────────────────────

  onSearchChange(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCategories = this.categories;
      return;
    }
    this.filteredCategories = this.categories.filter(cat =>
      cat.name.toLowerCase().includes(term) ||
      (cat.description && cat.description.toLowerCase().includes(term))
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredCategories = this.categories;
  }

  // ─── Pagination ──────────────────────────────────────────────────

  goToPage(page: number): void {
    if (page < 0 || page > this.lastPage) return;
    this.currentPage = page;
    this.loadCategories();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadCategories();
  }

  // ─── Navigation ──────────────────────────────────────────────────

  navigateToCreate(): void {
    this.router.navigate(['/categories/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/categories', id]);
  }

  // ─── Delete ──────────────────────────────────────────────────────

  deleteCategory(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir categoria',
        message: `Tem certeza que deseja excluir a categoria "${name}"? Esta ação não poderá ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.deleteCategory(id).subscribe({
          next: () => {
            this.snackBar.open('Categoria excluída com sucesso', 'Fechar', { duration: 3000 });
            this.loadCategories();
          },
          error: (error) => {
            const message = error.error?.message || 'Erro ao excluir categoria';
            this.snackBar.open(message, 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }
}
