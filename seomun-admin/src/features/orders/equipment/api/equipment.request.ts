import type { EquipmentLogCostType, EquipmentMachineType, EquipmentSearchType, EquipmentStatus, EquipmentWorkProcess } from '../enums';

export type EquipmentListREQ = {
  page: number;
  per_page: number;
  search_type?: EquipmentSearchType;
  keyword?: string;
  work_process?: EquipmentWorkProcess;
  machine_type?: EquipmentMachineType;
  status?: EquipmentStatus;
};

export type EquipmentUpdateREQ = {
  company_name: string;
  name: string;
  image: string | null;
  machine_type: EquipmentMachineType | null;
  maintenance_company: string | null;
  manager_name: string | null;
  manager_phone: string | null;
  introduced_at: string | null;
  work_process: EquipmentWorkProcess;
  status: EquipmentStatus;
  notes?: string | null;
};

export type EquipmentCreateREQ = EquipmentUpdateREQ;

export type EquipmentLogCreateREQ = {
  log_date: string;
  maintenance_details: string;
  special_notes?: string | null;
  cost_type: EquipmentLogCostType;
  manager: string;
};
