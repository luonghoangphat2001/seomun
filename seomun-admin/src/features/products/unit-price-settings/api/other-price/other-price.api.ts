import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { OtherUnitPriceCreateREQ, OtherUnitPriceListREQ, OtherUnitPriceUpdateREQ } from './other-price.request';
import type { OtherUnitPriceActionRESP, OtherUnitPriceDetailRESP, OtherUnitPriceItemsRESP, OtherUnitPriceListRESP } from './other-price.response';

export const getOtherUnitPricesAPI = (params: OtherUnitPriceListREQ): Promise<OtherUnitPriceListRESP> =>
  api.get(ENDPOINTS.UNIT_PRICES.LIST, { params });

export const getOtherUnitPriceDetailAPI = (id: number): Promise<OtherUnitPriceDetailRESP> => api.get(ENDPOINTS.UNIT_PRICES.DETAIL(id));

export const getOtherUnitPriceItemsAPI = (unitPriceId: number): Promise<OtherUnitPriceItemsRESP> => api.get(ENDPOINTS.UNIT_PRICES.ITEMS(unitPriceId));

export const createOtherUnitPriceAPI = (payload: OtherUnitPriceCreateREQ): Promise<OtherUnitPriceActionRESP> =>
  api.post(ENDPOINTS.UNIT_PRICES.CREATE, payload);

export const updateOtherUnitPriceAPI = (id: number, payload: OtherUnitPriceUpdateREQ): Promise<OtherUnitPriceActionRESP> =>
  api.put(ENDPOINTS.UNIT_PRICES.UPDATE(id), payload);

export const deleteOtherUnitPriceAPI = (id: number): Promise<void> => api.delete(ENDPOINTS.UNIT_PRICES.DELETE(id));

export const toggleOtherUnitPriceStatusAPI = (id: number): Promise<OtherUnitPriceActionRESP> => api.patch(ENDPOINTS.UNIT_PRICES.TOGGLE_STATUS(id));
