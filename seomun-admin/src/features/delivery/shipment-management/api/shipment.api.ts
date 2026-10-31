import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type {
  ShipmentExportExcelREQ,
  ShipmentExportProgressREQ,
  ShipmentListREQ,
  ShipmentTrackingInfoREQ,
  ShipmentTrackingNumberREQ,
} from './shipment.request';
import type {
  ShipmentExportProgressResultRESP,
  ShipmentExportRESP,
  ShipmentListFilteredRESP,
  ShipmentListRESP,
  ShipmentTrackingInfoRESP,
} from './shipment.response';
import type { BaseResponse } from '@/types/api';

export function getShipmentsAPI(params: ShipmentListREQ): Promise<ShipmentListRESP> {
  return api.get(ENDPOINTS.DELIVERY.SHIPMENTS, { params });
}

export function getShipmentSearchFiltersAPI(params: ShipmentListREQ): Promise<ShipmentListFilteredRESP> {
  return api.get(ENDPOINTS.DELIVERY.SHIPMENTS_SEARCH_FILTERS, { params });
}

export function exportShipmentsExcelAPI(payload: ShipmentExportExcelREQ): Promise<ShipmentExportRESP> {
  return api.post(ENDPOINTS.DELIVERY.SHIPMENTS_EXPORT_EXCEL, payload);
}

export function checkShipmentExportProgressStatusAPI(
  historyId: number,
  params: ShipmentExportProgressREQ,
): Promise<ShipmentExportProgressResultRESP> {
  return api.get(ENDPOINTS.DELIVERY.SHIPMENTS_CHECK_EXPORT_STATUS(historyId), { params });
}

export function updateShipmentTrackingNumberAPI({ shipment, ...payload }: ShipmentTrackingNumberREQ): Promise<void> {
  return api.put(ENDPOINTS.DELIVERY.SHIPMENTS_TRACKING_NUMBER(shipment), payload);
}

export function getShipmentTrackingInfoAPI(params?: ShipmentTrackingInfoREQ): Promise<BaseResponse<ShipmentTrackingInfoRESP>> {
  return api.get(ENDPOINTS.DELIVERY.SHIPMENTS_TRACKING_INFO, { params });
}
