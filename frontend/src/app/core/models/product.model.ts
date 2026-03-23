export interface Product {
  id: string;
  name: string;
  code: string;
  barcode?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStock?: number;
  maxStock?: number;
  location?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  code?: string;
  name?: string;
  lowStock?: boolean;
  sortBy?: 'name' | 'code' | 'price' | 'stockQuantity' | 'createdAt';
  order?: 'ASC' | 'DESC';
}

export interface ProductPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: ProductPagination;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface StockUpdateRequest {
  quantity: number;
  type: 'IN' | 'OUT';
  notes?: string;
}

export interface StockUpdateResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    productName: string;
    previousStock: number;
    newStock: number;
    quantity: number;
    type: string;
  };
}