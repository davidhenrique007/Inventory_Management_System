import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: string;
  name: string;
  code: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStock?: number;
  maxStock?: number;
  location?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  name?: string;
  code?: string;
  lowStock?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.category) params = params.set('category', filters.category);
    if (filters.name) params = params.set('name', filters.name);
    if (filters.code) params = params.set('code', filters.code);
    if (filters.lowStock !== undefined) params = params.set('lowStock', filters.lowStock.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.order) params = params.set('order', filters.order);

    return this.http.get<ProductListResponse>(this.baseUrl, { params });
  }

  getProductById(id: string): Observable<{ success: boolean; data: Product }> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}`);
  }

  getProductByCode(code: string): Observable<{ success: boolean; data: Product }> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.baseUrl}/code/${code}`);
  }

  createProduct(data: Partial<Product>): Observable<{ success: boolean; data: Product }> {
    return this.http.post<{ success: boolean; data: Product }>(this.baseUrl, data);
  }

  updateProduct(id: string, data: Partial<Product>): Observable<{ success: boolean; data: Product }> {
    return this.http.put<{ success: boolean; data: Product }>(`${this.baseUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  updateStock(id: string, data: { quantity: number; type: 'IN' | 'OUT'; notes?: string }) {
    return this.http.patch(`${this.baseUrl}/${id}/stock`, data);
  }
}
