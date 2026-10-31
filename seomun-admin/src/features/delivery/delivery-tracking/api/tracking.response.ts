import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { DeliveryTrackingStage } from '../../enums';
import type { DeliveryTracking } from '../../types';

export type DeliveryTrackingRESP = DeliveryTracking;
export interface TrackingInfo {
  carrier: string;
  location: string;
  estimated_delivery: string;
}

export interface DeliveryTrackingDetailRESP {
  invoice_number: string;
  delivery_stage: DeliveryTrackingStage;
  delivery_status: DeliveryTrackingStage;
  courier_service: string;
  tracking_info: TrackingInfo | null;
  real_time_location: string;
}

export interface DeliveryTrackingExportHistoryRESP {
  id: number;
  status: string;
  file_name: string;
  file_path: string | null;
}

export type DeliveryTrackingListRESP = PaginationResponse<{ delivery_trackings: DeliveryTrackingRESP[] }>;
export type DeliveryTrackingDetailWrapRESP = BaseResponse<{ delivery_tracking: DeliveryTrackingDetailRESP }>;
export type DeliveryTrackingExportRESP = BaseResponse<{ history: DeliveryTrackingExportHistoryRESP }>;
export type DeliveryTrackingExportStatusRESP = BaseResponse<{ history: DeliveryTrackingExportHistoryRESP }>;
