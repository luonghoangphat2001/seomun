import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { EquipmentLogCostType, EquipmentMachineType, EquipmentStatus, EquipmentWorkProcess } from '../enums';

export type EquipmentRESP = {
  id: number;
  company_name: string;
  name: string;
  machine_type: EquipmentMachineType | null;
  maintenance_company: string | null;
  manager_name: string | null;
  manager_phone: string | null;
  introduced_at: string | null;
  image: string | null;
  work_process: EquipmentWorkProcess;
  status: EquipmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EquipmentLogRESP = {
  id: number;
  equipment_id: number;
  log_date: string;
  maintenance_details: string;
  special_notes: string | null;
  cost_type: EquipmentLogCostType;
  manager: string;
  created_at: string;
};

export type EquipmentListRESP = PaginationResponse<{ equipments: EquipmentRESP[] }>;
export type EquipmentDetailRESP = BaseResponse<{ equipment: EquipmentRESP }>;
export type EquipmentLogsRESP = BaseResponse<{ logs: EquipmentLogRESP[] }>;
export type EquipmentLogCreateRESP = BaseResponse<{ log: EquipmentLogRESP }>;

export type EquipmentLogExportHistory = {
  id: number;
  status: string;
  file_name: string;
  file_path: string | null;
};

export type EquipmentLogExportRESP = BaseResponse<{ history: EquipmentLogExportHistory }>;
export type EquipmentCreateRESP = BaseResponse<{ equipment: EquipmentRESP }>;
export type EquipmentUpdateRESP = BaseResponse<{ equipment: EquipmentRESP }>;
