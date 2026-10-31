import type { BaseResponse } from '@/types/api';

export type PriceSimulationCategory = 'paper' | 'printing' | 'post_processing' | 'other';

export interface PriceSimulationBreakdownItemRESP {
  group_code: string;
  price: number;
}

export interface PriceSimulationPriceBlockRESP {
  sub_total: number;
  vat: number;
  total: number;
  quantity: number;
  case: number;
  paper_price: number;
  printing_price: number;
  foundation_fee: number;
  post_processing_price: number;
  component_price: number;
  breakdown: PriceSimulationBreakdownItemRESP[];
  estimated_production_days?: number;
}

export interface PriceSimulationSummaryRESP {
  quantity: number;
  total_raw_cost: number;
  total_selling_price: number;
  profit: number;
  profit_rate: number;
}

export interface PriceSimulationDataRESP {
  summary: PriceSimulationSummaryRESP;
  selling_price: PriceSimulationPriceBlockRESP;
  raw_cost: PriceSimulationPriceBlockRESP;
}

export type PriceSimulationResultRESP = BaseResponse<PriceSimulationDataRESP>;
