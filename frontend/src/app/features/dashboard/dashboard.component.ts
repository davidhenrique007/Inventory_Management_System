import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

interface DashboardData {
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  categories: {
    total: number;
  };
  stock: {
    totalQuantity: number;
    totalValue: string;
  };
  movements: {
    today: number;
    thisMonth: number;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Carregando dados...</p>
      </div>

      <div *ngIf="!loading && data">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>inventory_2</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ data.products.total }}</h3>
                <p>Total de Produtos</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card warning" *ngIf="data.products.lowStock > 0">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ data.products.lowStock }}</h3>
                <p>Produtos com Estoque Baixo</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card danger" *ngIf="data.products.outOfStock > 0">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>error</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ data.products.outOfStock }}</h3>
                <p>Produtos sem Estoque</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>category</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ data.categories.total }}</h3>
                <p>Categorias</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>store</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ data.stock.totalQuantity }}</h3>
                <p>Unidades em Estoque</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="stat-info">
                <h3>R$ {{ data.stock.totalValue }}</h3>
                <p>Valor Total do Estoque</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="movements-grid">
          <mat-card class="movement-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>today</mat-icon>
              <mat-card-title>Movimentações de Hoje</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <h2>{{ data.movements.today }}</h2>
              <p>movimentações registradas</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="movement-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>calendar_month</mat-icon>
              <mat-card-title>Movimentações do Mês</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <h2>{{ data.movements.thisMonth }}</h2>
              <p>movimentações registradas</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 24px;
      font-weight: 500;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .stat-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #e8eaf6;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #3f51b5;
    }
    .stat-info h3 {
      font-size: 28px;
      font-weight: 500;
      margin: 0;
    }
    .stat-info p {
      margin: 4px 0 0;
      color: #666;
      font-size: 14px;
    }
    .stat-card.warning .stat-icon {
      background: #fff3e0;
    }
    .stat-card.warning .stat-icon mat-icon {
      color: #ff9800;
    }
    .stat-card.danger .stat-icon {
      background: #ffebee;
    }
    .stat-card.danger .stat-icon mat-icon {
      color: #f44336;
    }
    .movements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .movement-card {
      text-align: center;
      padding: 16px;
    }
    .movement-card h2 {
      font-size: 36px;
      font-weight: 500;
      margin: 16px 0 8px;
      color: #3f51b5;
    }
  `]
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.http.get<{ success: boolean; data: DashboardData }>(
      `${environment.apiUrl}/reports/dashboard`
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.data = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dashboard:', error);
        this.loading = false;
      }
    });
  }
}
