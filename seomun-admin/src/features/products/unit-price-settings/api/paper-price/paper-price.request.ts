import type { PaginationRequest, SortRequest } from '@/types/api';

import type { PaperPriceSortField } from '../../enums';

export interface PaperPriceListREQ extends PaginationRequest, SortRequest<PaperPriceSortField> {
  paper_id?: number;
  paper_size_division_code?: string;
  is_hot_deal?: boolean;
}

export interface PaperPriceCreateREQ {
  paper_id: number;
  paper_size_division_code: string;
  supply_price: number;
  cost: number;
  is_hot_deal?: boolean | null;
}

export type PaperPriceUpdateREQ = Partial<PaperPriceCreateREQ>;
