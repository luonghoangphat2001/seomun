import { useQuery } from '@tanstack/react-query';

import type { PriceSimulationREQ } from './price-simulation.request';
import type { PriceSimulationResultRESP } from './price-simulation.response';
import { simulateProductPrice } from './price-simulation.service';

export const priceSimulationKeys = {
  all: ['products', 'price-simulation'] as const,
  result: (request: PriceSimulationREQ) => [...priceSimulationKeys.all, 'result', request] as const,
};

export function usePriceSimulationResultQuery(request: PriceSimulationREQ, enabled = true) {
  return useQuery<PriceSimulationResultRESP>({
    queryKey: priceSimulationKeys.result(request),
    queryFn: () => simulateProductPrice(request),
    enabled,
  });
}
