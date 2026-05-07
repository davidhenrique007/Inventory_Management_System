import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Movement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock?: number;
  currentStock?: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  product?: {
    id: string;
    name: string;
    code: string;
  };
  productName?: string;
  createdBy?: string;
  user?: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export interface ProductStock {
  id: string;
  name: string;
  code: string;
  stockQuantity: number;
  price?: number;
  minStock?: number;
  maxStock?: number;
}

export interface MovementListResponse {
  success: boolean;
  data: {
    movements?: Movement[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private readonly baseUrl = `${environment.apiUrl}/movements`;

  constructor(private http: HttpClient) {}

  createEntry(data: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    notes?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/entry`, data);
  }

  createExit(data: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    notes?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/exit`, data);
  }

  getMovements(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Observable<MovementListResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    
    return this.http.get<MovementListResponse>(`${this.baseUrl}/recent`, { params: httpParams });
  }

  getProductByCode(code: string): Observable<{ success: boolean; data: ProductStock }> {
    return this.http.get<{ success: boolean; data: ProductStock }>(`${environment.apiUrl}/products/code/${code}`);
  }
}