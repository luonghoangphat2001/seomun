import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { PaperPriceCreateREQ, PaperPriceListREQ, PaperPriceUpdateREQ } from './paper-price.request';
import type { PaperPriceActionRESP, PaperPriceDetailRESP, PaperPriceListRESP, PaperPriceSearchFiltersRESP } from './paper-price.response';

export const getPaperPricesAPI = (params: PaperPriceListREQ): Promise<PaperPriceListRESP> => api.get(ENDPOINTS.PAPER_PRICES.LIST, { params });

export const getPaperPriceDetailAPI = (id: number): Promise<PaperPriceDetailRESP> => api.get(ENDPOINTS.PAPER_PRICES.DETAIL(id));

export const createPaperPriceAPI = (payload: PaperPriceCreateREQ): Promise<PaperPriceActionRESP> => api.post(ENDPOINTS.PAPER_PRICES.CREATE, payload);

export const updatePaperPriceAPI = (id: number, payload: PaperPriceUpdateREQ): Promise<PaperPriceActionRESP> =>
  api.put(ENDPOINTS.PAPER_PRICES.UPDATE(id), payload);

export const deletePaperPriceAPI = (id: number): Promise<void> => api.delete(ENDPOINTS.PAPER_PRICES.DELETE(id));

export const getPaperPriceSearchFiltersAPI = (): Promise<PaperPriceSearchFiltersRESP> => api.get(ENDPOINTS.PAPER_PRICES.SEARCH_FILTERS);
