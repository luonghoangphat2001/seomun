import type { PriceSimulationBookPageCountsREQ } from '../api/price-simulation.request';
import type { PriceSimulationOptionSelections } from '../utils';

export interface PriceSimulationFormValues {
  product_id: string;
  option_selections: PriceSimulationOptionSelections;
  quantity: number;
  multiplier: number;
  book_page_counts: PriceSimulationBookPageCountsREQ;
}
