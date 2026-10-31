import type { BaseResponse, PaginationResponse, StringOptions } from '@/types/api';

export interface PaperPrice {
  id: number;
  paper_id: number;
  paper_size_division_code: string;
  supply_price: number;
  cost: number;
  is_hot_deal: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaperPriceSearchFilters {
  paper_size_division_code_options: StringOptions[];
}

export type PaperPriceListRESP = PaginationResponse<{ paper_prices: PaperPrice[] }>;
export type PaperPriceDetailRESP = BaseResponse<{ paper_price: PaperPrice }>;
export type PaperPriceActionRESP = BaseResponse<{ paper_price: PaperPrice }>;
export type PaperPriceSearchFiltersRESP = BaseResponse<{ filters: PaperPriceSearchFilters }>;
