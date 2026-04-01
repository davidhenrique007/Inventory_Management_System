import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryListResponse {
  success: boolean;
  data: {
    categories: Category[];
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

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(params?: { page?: number; limit?: number; name?: string }): Observable<CategoryListResponse> {
    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.name) httpParams = httpParams.set('name', params.name);

    return this.http.get<CategoryListResponse>(this.baseUrl, { params: httpParams });
  }

  getCategoryById(id: string): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.baseUrl}/${id}`);
  }

  createCategory(data: { name: string; description?: string }): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.baseUrl, data);
  }

  updateCategory(id: string, data: { name?: string; description?: string }): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
