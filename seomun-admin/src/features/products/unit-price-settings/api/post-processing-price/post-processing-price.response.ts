import type { BaseResponse, PaginationResponse } from '@/types/api';

export interface PostProcessingPriceItem {
  id: number;
  quantity: number;
  supply_price: number;
  cost: number;
}

export interface PostProcessingPriceErpOption {
  id: number;
  erp_option_group_id: number;
  code: string;
  label: string;
  value: string;
}

export interface PostProcessingPrice {
  id: number;
  code: string;
  erp_option_id: number;
  post_processing_size_type: string;
  // ponytail: `attributes` is a free-form object the admin form ignores; kept as unknown so list rows still type-check.
  attributes?: unknown;
  is_active: boolean;
  erp_option?: PostProcessingPriceErpOption | null;
  // List rows embed items under this key; the /items sub-endpoint returns them under `items` instead.
  post_processing_price_items?: PostProcessingPriceItem[];
}

export type PostProcessingPriceListRESP = PaginationResponse<{ post_processing_prices: PostProcessingPrice[] }>;
export type PostProcessingPriceDetailRESP = BaseResponse<{ post_processing_price: PostProcessingPrice }>;
export type PostProcessingPriceActionRESP = BaseResponse<{ post_processing_price: PostProcessingPrice }>;
