import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { DirectShippingExportExcelREQ, DirectShippingListREQ, DirectShippingStatusREQ } from './direct-shipping.request';
import type { DirectShippingDetailRESP, DirectShippingExportRESP, DirectShippingListRESP } from './direct-shipping.response';

export function getDirectShippingsAPI(params: DirectShippingListREQ): Promise<DirectShippingListRESP> {
  return api.get(ENDPOINTS.DELIVERY.DIRECT_SHIPPING, { params });
}

export function getDirectShippingAPI(id: number): Promise<DirectShippingDetailRESP> {
  return api.get(ENDPOINTS.DELIVERY.DIRECT_SHIPPING_DETAIL(id));
}

export function updateDirectShippingStatusAPI({ id, status }: DirectShippingStatusREQ): Promise<DirectShippingDetailRESP> {
  return api.post(ENDPOINTS.DELIVERY.DIRECT_SHIPPING_STATUS(id), { status });
}

export function exportDirectShippingsExcelAPI(payload: DirectShippingExportExcelREQ): Promise<DirectShippingExportRESP> {
  return api.post(ENDPOINTS.DELIVERY.DIRECT_SHIPPING_EXPORT_EXCEL, payload);
}

export function checkDirectShippingExportProgressStatusAPI(historyId: number): Promise<DirectShippingExportRESP> {
  return api.get(ENDPOINTS.DELIVERY.DIRECT_SHIPPING_CHECK_EXPORT_STATUS(historyId));
}
