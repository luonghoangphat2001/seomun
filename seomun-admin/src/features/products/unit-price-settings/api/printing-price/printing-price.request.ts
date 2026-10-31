import type { PaperSizeDivisionCode } from '../../enums';

export interface PrintingPriceListREQ {
  current_page?: number;
  per_page?: number;
}

export interface PrintingPriceItemCreateREQ {
  quantity: number;
  supply_price: number;
  cost: number;
}

export interface PrintingPriceItemUpdateREQ {
  id?: number;
  quantity: number;
  supply_price: number;
  cost: number;
}

export interface PrintingPriceCreateREQ {
  machine_type: string;
  book_printing_size_type: string;
  paper_size_division_code: PaperSizeDivisionCode;
  side_type: string | null;
  name: string;
  book_printing_type: string | null;
  is_hot_deal?: boolean;
  items: PrintingPriceItemCreateREQ[];
}

export interface PrintingPriceUpdateREQ {
  machine_type: string;
  book_printing_size_type: string;
  paper_size_division_code: PaperSizeDivisionCode;
  side_type: string | null;
  name: string;
  book_printing_type: string | null;
  is_hot_deal?: boolean;
  items: PrintingPriceItemUpdateREQ[];
}
