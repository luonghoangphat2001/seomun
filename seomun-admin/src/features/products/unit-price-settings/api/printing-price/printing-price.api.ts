import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { PrintingPriceCreateREQ, PrintingPriceListREQ, PrintingPriceUpdateREQ } from './printing-price.request';
import type { PrintingPriceActionRESP, PrintingPriceDetailRESP, PrintingPriceItemsRESP, PrintingPriceListRESP } from './printing-price.response';

export const getPrintingPricesAPI = (params: PrintingPriceListREQ): Promise<PrintingPriceListRESP> =>
  api.get(ENDPOINTS.PRINTING_PRICES.LIST, { params });

export const getPrintingPriceDetailAPI = (id: number): Promise<PrintingPriceDetailRESP> => api.get(ENDPOINTS.PRINTING_PRICES.DETAIL(id));

export const getPrintingPriceItemsAPI = (id: number): Promise<PrintingPriceItemsRESP> => api.get(ENDPOINTS.PRINTING_PRICES.ITEMS(id));

export const createPrintingPriceAPI = (payload: PrintingPriceCreateREQ): Promise<PrintingPriceActionRESP> =>
  api.post(ENDPOINTS.PRINTING_PRICES.CREATE, payload);

export const updatePrintingPriceAPI = (id: number, payload: PrintingPriceUpdateREQ): Promise<PrintingPriceActionRESP> =>
  api.put(ENDPOINTS.PRINTING_PRICES.UPDATE(id), payload);

export const deletePrintingPriceAPI = (id: number): Promise<void> => api.delete(ENDPOINTS.PRINTING_PRICES.DELETE(id));
