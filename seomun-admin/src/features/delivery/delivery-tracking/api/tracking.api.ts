import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { DeliveryTrackingExportREQ, DeliveryTrackingListREQ } from './tracking.request';
import type {
  DeliveryTrackingDetailWrapRESP,
  DeliveryTrackingExportRESP,
  DeliveryTrackingExportStatusRESP,
  DeliveryTrackingListRESP,
} from './tracking.response';

export function getDeliveryTrackingsAPI(params: DeliveryTrackingListREQ): Promise<DeliveryTrackingListRESP> {
  return api.get(ENDPOINTS.DELIVERY.TRACKING, { params });
}

export function getDeliveryTrackingDetailAPI(invoiceNumber: string): Promise<DeliveryTrackingDetailWrapRESP> {
  return api.get(ENDPOINTS.DELIVERY.TRACKING_DETAIL(invoiceNumber));
}

export function exportDeliveryTrackingAPI(payload: DeliveryTrackingExportREQ): Promise<DeliveryTrackingExportRESP> {
  return api.post(ENDPOINTS.DELIVERY.TRACKING_EXPORT, payload);
}

export function checkDeliveryTrackingExportStatusAPI(historyId: number): Promise<DeliveryTrackingExportStatusRESP> {
  return api.get(ENDPOINTS.DELIVERY.TRACKING_EXPORT_STATUS(historyId));
}
