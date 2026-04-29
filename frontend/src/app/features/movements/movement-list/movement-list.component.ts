import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovementService, Movement } from '../../../core/services/movement.service';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="movement-list-container">
      <div class="page-header">
        <h1>Movimentações de Estoque</h1>
        <div class="actions">
          <button mat-raised-button color="primary" routerLink="/movements/in">
            <mat-icon>add</mat-icon>
            Entrada
          </button>
          <button mat-raised-button color="warn" routerLink="/movements/out">
            <mat-icon>remove</mat-icon>
            Saída
          </button>
        </div>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select [(ngModel)]="filters.type" (selectionChange)="loadMovements()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="IN">Entrada</mat-option>
            <mat-option value="OUT">Saída</mat-option>
            <mat-option value="ADJUSTMENT">Ajuste</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-button (click)="clearFilters()" *ngIf="hasFilters()">
          <mat-icon>clear</mat-icon>
          Limpar filtros
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading">
        <div class="empty-state" *ngIf="movements.length === 0">
          <mat-icon>history</mat-icon>
          <p>Nenhuma movimentação encontrada</p>
        </div>

        <div *ngIf="movements.length > 0">
          <div class="table-container">
            <table mat-table [dataSource]="movements" class="mat-elevation-z1">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef> Tipo </th>
                <td mat-cell *matCellDef="let m">
                  <span class="badge" [ngClass]="m.type === 'IN' ? 'badge-in' : 'badge-out'">
                    {{ m.type === 'IN' ? 'ENTRADA' : 'SAÍDA' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef> Produto </th>
                <td mat-cell *matCellDef="let m"> {{ m.product?.name || m.productName || '—' }}  </td>
              </ng-container>

              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef> Quantidade </th>
                <td mat-cell *matCellDef="let m"> {{ m.quantity }}  </td>
              </ng-container>

              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef> Estoque </th>
                <td mat-cell *matCellDef="let m"> {{ m.previousStock || '?' }} → {{ m.currentStock || '?' }}  </td>
              </ng-container>

              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef> Operador </th>
                <td mat-cell *matCellDef="let m"> {{ m.user?.name || m.createdBy || '—' }}  </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef> Data </th>
                <td mat-cell *matCellDef="let m"> {{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}  </td>
              </ng-container>

              <ng-container matColumnDef="notes">
                <th mat-header-cell *matHeaderCellDef> Observação </th>
                <td mat-cell *matCellDef="let m"> {{ m.notes || '—' }}  </td>
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
    .movement-list-container {
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
    .actions {
      display: flex;
      gap: 12px;
    }
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      align-items: center;
    }
    .filters mat-form-field {
      width: 180px;
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
    .table-container {
      overflow-x: auto;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    .badge-in {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge-out {
      background: #ffebee;
      color: #c62828;
    }
  `]
})
export class MovementListComponent implements OnInit {
  movements: Movement[] = [];
  loading = true;
  
  displayedColumns: string[] = ['type', 'product', 'quantity', 'stock', 'user', 'createdAt', 'notes'];
  
  totalItems = 0;
  currentPage = 0;
  pageSize = 10;
  
  filters = {
    type: ''
  };

  constructor(
    private movementService: MovementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.loading = true;
    this.movementService.getMovements({
      page: this.currentPage + 1,
      limit: this.pageSize,
      type: this.filters.type || undefined
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Verificar se a resposta tem pagination ou é direta
          if (response.data.pagination) {
            this.movements = response.data.movements || [];
            this.totalItems = response.data.pagination.total || 0;
          } else if (Array.isArray(response.data)) {
            this.movements = response.data;
            this.totalItems = response.data.length;
          } else {
            this.movements = [];
            this.totalItems = 0;
          }
        } else {
          this.movements = [];
          this.totalItems = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar movimentações:', error);
        this.snackBar.open('Erro ao carregar movimentações', 'Fechar', { duration: 3000 });
        this.movements = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMovements();
  }

  clearFilters(): void {
    this.filters = { type: '' };
    this.currentPage = 0;
    this.loadMovements();
  }

  hasFilters(): boolean {
    return !!(this.filters.type);
  }
}