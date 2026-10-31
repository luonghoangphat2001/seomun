import type { PaginationRequest } from '@/types/api';

export interface ExposureCustomerListREQ extends PaginationRequest {
  search_term?: string;
}

export interface PromotionalProductListREQ extends PaginationRequest {
  customer_id: number;
  search?: string;
  category_id?: number;
}

export interface UpdatePromotionalProductsREQ {
  customer_id: number;
  product_ids: number[];
}
