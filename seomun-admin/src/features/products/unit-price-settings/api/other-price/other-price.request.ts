export interface OtherUnitPriceListREQ {
  current_page?: number;
  per_page?: number;
  product_id?: number;
  category_id?: number;
  search_keyword?: string;
  is_active?: boolean;
}

export interface OtherUnitPriceItemREQ {
  id?: number;
  quantity_min: number;
  price_value: number;
  raw_cost: number;
  is_active?: boolean;
}

export interface OtherUnitPriceCreateREQ {
  erp_size_option_id: number | null;
  erp_paper_option_id: number | null;
  erp_subject_master_option_id: number | null;
  product_id: number;
  items: OtherUnitPriceItemREQ[];
}

export type OtherUnitPriceUpdateREQ = OtherUnitPriceCreateREQ;
