import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
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

export interface StockByCategory {
  category: string;
  quantity: number;
  value: number;
}

export interface MonthlyMovement {
  month: string;
  entries: number;
  exits: number;
}

export interface CriticalProduct {
  id: string;
  name: string;
  code: string;
  stockQuantity: number;
  minStock: number;
  categoryName: string;
  difference: number;
}

export interface RecentMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  typeLabel: string;
  quantity: number;
  productName: string;
  productCode: string;
  userName: string;
  createdAt: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<{ success: boolean; data: DashboardSummary }> {
    return this.http.get<{ success: boolean; data: DashboardSummary }>(
      `${this.apiUrl}/dashboard`
    );
  }

  getStockByCategory(): Observable<{ success: boolean; data: StockByCategory[] }> {
    return this.http.get<{ success: boolean; data: StockByCategory[] }>(
      `${this.apiUrl}/stock-by-category`
    );
  }

  getMonthlyMovements(): Observable<{ success: boolean; data: MonthlyMovement[] }> {
    return this.http.get<{ success: boolean; data: MonthlyMovement[] }>(
      `${this.apiUrl}/monthly-movements`
    );
  }

  getCriticalProducts(limit: number = 5): Observable<{ success: boolean; data: CriticalProduct[] }> {
    return this.http.get<{ success: boolean; data: CriticalProduct[] }>(
      `${this.apiUrl}/low-stock?limit=${limit}&all=false`
    );
  }

  getRecentMovements(limit: number = 10): Observable<{ success: boolean; data: RecentMovement[] }> {
    return this.http.get<{ success: boolean; data: RecentMovement[] }>(
      `${this.apiUrl}/recent-movements?limit=${limit}`
    );
  }
}