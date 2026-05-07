import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService, DashboardSummary, CriticalProduct, RecentMovement } from '../../core/services/dashboard.service';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { BarChartComponent } from '../../shared/components/charts/bar-chart.component';
import { LineChartComponent } from '../../shared/components/charts/line-chart.component';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    KpiCardComponent,
    BarChartComponent,
    LineChartComponent,
    DateFormatPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  summary: DashboardSummary | null = null;
  stockByCategoryData: { label: string; value: number; color?: string }[] = [];
  monthlyLabels: string[] = [];
  monthlyMovementsData: { label: string; data: number[]; borderColor: string; backgroundColor: string }[] = [];
  criticalProducts: CriticalProduct[] = [];
  recentMovements: RecentMovement[] = [];

  criticalColumns: string[] = ['name', 'category', 'stock', 'status'];
  recentColumns: string[] = ['type', 'product', 'quantity', 'user', 'date'];

  private refreshSubscription?: Subscription;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();

    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadDashboardData(false);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private loadDashboardData(showLoading: boolean = true): void {
    if (showLoading) this.loading = true;

    Promise.all([
      this.dashboardService.getSummary().toPromise(),
      this.dashboardService.getCriticalProducts(6).toPromise(),
      this.dashboardService.getRecentMovements(8).toPromise()
    ]).then(([summaryRes, criticalRes, recentRes]) => {
      if (summaryRes?.success) this.summary = summaryRes.data;
      if (criticalRes?.success) this.criticalProducts = criticalRes.data;
      if (recentRes?.success) this.recentMovements = recentRes.data;

      this.loadChartsData();
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

  private async loadChartsData(): Promise<void> {
    try {
      const [stockRes, monthlyRes] = await Promise.all([
        this.dashboardService.getStockByCategory().toPromise(),
        this.dashboardService.getMonthlyMovements().toPromise()
      ]);

      if (stockRes?.success) {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        this.stockByCategoryData = stockRes.data.map((item, idx) => ({
          label: item.category,
          value: item.quantity,
          color: colors[idx % colors.length]
        }));
      }

      if (monthlyRes?.success) {
        this.monthlyLabels = monthlyRes.data.map(item => item.month);
        this.monthlyMovementsData = [
          {
            label: 'Entradas',
            data: monthlyRes.data.map(item => item.entries),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          },
          {
            label: 'Saidas',
            data: monthlyRes.data.map(item => item.exits),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }
        ];
      }
    } catch (error) {
      console.error('Erro ao carregar graficos:', error);
    }
  }
}
