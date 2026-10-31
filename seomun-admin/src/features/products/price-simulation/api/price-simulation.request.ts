export interface PriceSimulationSelectedOptionREQ {
  group_id: number;
  option_id: number;
}

export interface PriceSimulationQuantitySetREQ {
  quantity: number;
  multiplier: number;
}

export interface PriceSimulationBookPageCountsREQ {
  cover_page_count: number;
  inner_page_count: number;
  additional_page_count: number;
  colored_page_count_1: number;
  colored_page_count_2: number;
  flyleaf_count: number;
}

export interface PriceSimulationInputOptionsREQ extends Partial<PriceSimulationBookPageCountsREQ> {
  width: number;
  height: number;
}

export interface PriceSimulationREQ {
  product_id: number;
  quantity_sets: PriceSimulationQuantitySetREQ;
  selected_options: PriceSimulationSelectedOptionREQ[];
  input_options: PriceSimulationInputOptionsREQ;
}
