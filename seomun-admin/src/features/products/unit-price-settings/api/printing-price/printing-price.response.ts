import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { PaperSizeDivisionCode } from '../../enums';

export interface PrintingPriceItem {
  id: number;
  quantity: number;
  supply_price: number;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface PrintingPrice {
  id: number;
  machine_type: string;
  book_printing_size_type: string;
  paper_size_division_code: PaperSizeDivisionCode;
  side_type: string;
  name: string;
  book_printing_type: string | null;
  is_hot_deal: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  printing_price_items?: PrintingPriceItem[];
}

export type PrintingPriceListRESP = PaginationResponse<{ printing_prices: PrintingPrice[] }>;
export type PrintingPriceDetailRESP = BaseResponse<PrintingPrice>;
export type PrintingPriceActionRESP = BaseResponse<PrintingPrice>;
export type PrintingPriceItemsRESP = BaseResponse<{ items: PrintingPriceItem[] }>;
