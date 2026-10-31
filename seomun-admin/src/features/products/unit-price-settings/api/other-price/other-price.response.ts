import type { ErpOption } from '@/features/products/management';
import type { BaseResponse, PaginationResponse } from '@/types/api';

export interface OtherUnitPrice {
  id: number;
  erp_size_option_id: number | null;
  erp_paper_option_id: number | null;
  erp_subject_master_option_id: number | null;
  product_id: number;
  product: OtherUnitPriceProduct;
  product_type: string | null;
  combination_options: unknown[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items: unknown[];
  erp_paper_option: ErpOption;
  erp_size_option: ErpOption;
  erp_subject_master_option: ErpOption;
}

export interface OtherUnitPriceProduct {
  id: number;
  name: string;
  category: OtherUnitPriceProductCategory;
}

export interface OtherUnitPriceProductCategory {
  id: number;
  name: string;
}

export type OtherUnitPriceListRESP = PaginationResponse<{ unit_prices: OtherUnitPrice[] }>;
export type OtherUnitPriceActionRESP = BaseResponse<{ unit_price: OtherUnitPrice }>;
export type OtherUnitPriceDetailRESP = BaseResponse<{ unit_price: OtherUnitPrice }>;

export interface OtherUnitPriceItem {
  id: number;
  unit_price_id: number;
  price_value: string | number;
  raw_cost: string | number;
  quantity_min: number;
  is_active: boolean;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export type OtherUnitPriceItemsRESP = BaseResponse<{ items: OtherUnitPriceItem[] }>;
