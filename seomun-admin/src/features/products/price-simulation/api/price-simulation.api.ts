import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { PriceSimulationREQ } from './price-simulation.request';
import type { PriceSimulationResultRESP } from './price-simulation.response';

export function simulateProductPriceAPI(payload: PriceSimulationREQ): Promise<PriceSimulationResultRESP> {
  return api.post(ENDPOINTS.PRODUCTS.PRICE_SIMULATION, payload);
}
