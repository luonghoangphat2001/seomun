import type { BaseResponse, NumberOptions, PaginationResponse } from '@/types/api';

import type { Shipment } from '../../types';

export type ShipmentRESP = Shipment;

export type ShipmentFilteredList = {
  shipping_manager_options: NumberOptions[];
};

export type ShipmentListFilteredRESP = PaginationResponse<{ filters: ShipmentFilteredList }>;

export type ShipmentListRESP = PaginationResponse<{ shipments: ShipmentRESP[] }>;

export interface ShipmentExportExcelRESP {
  id: number;
  user_id: number;
  module: string;
  file_name: string;
  file_path: string | null;
  status: string;
  filters: object | null;
  created_at: string;
  updated_at: string;
}

export type ShipmentExportRESP = BaseResponse<{ history: ShipmentExportExcelRESP }>;

export type ShipmentExportProgressResultRESP = BaseResponse<{ history: ShipmentExportExcelRESP }>;

export type ShipmentTrackingInfoRESP = {
  tracking_number: number;
  latestStatus: {
    code: number;
    name: string;
    timestamp: string;
  };
  history: {
    status_code: string;
    status_name: string;
    status_date: string;
    agency_name: string;
    agency_tel: string;
    worker_name: string;
    worker_tel: string;
    reason_code: string;
    reason_message: string;
    description: string;
  }[];
};
