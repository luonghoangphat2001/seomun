export interface PostProcessingPriceListREQ {
  current_page?: number;
  per_page?: number;
}

export interface PostProcessingPriceItemCreateREQ {
  quantity: number;
  supply_price: number;
  cost: number;
}

export interface PostProcessingPriceItemUpdateREQ {
  id?: number;
  quantity: number;
  supply_price: number;
  cost: number;
}

export interface PostProcessingPriceCreateREQ {
  code: string;
  erp_option_id: number;
  post_processing_size_type: string;
  is_active?: boolean;
  items: PostProcessingPriceItemCreateREQ[];
}

export interface PostProcessingPriceUpdateREQ {
  code: string;
  erp_option_id: number;
  post_processing_size_type: string;
  is_active?: boolean;
  items: PostProcessingPriceItemUpdateREQ[];
}
