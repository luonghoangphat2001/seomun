import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { ErpOptionDisplayType, ErpOptionGroupType, PaperCategory } from '../enums';

export interface ErpOptionGroupRESP {
  id: number;
  code: string;
  label: string;
  type: ErpOptionGroupType;
  display_type: ErpOptionDisplayType;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ErpOptionGroupDetail = ErpOptionGroupRESP & { options_count: number };

export interface ErpOptionGroupSummaryRESP {
  id: number;
  code: string;
  label: string;
  display_type: ErpOptionDisplayType;
  is_required: boolean;
  sort_order: number;
}

export interface ErpOptionSpecificationRESP {
  image?: string | null;
  description?: string | null;
}

export interface ErpOptionRESP {
  id: number;
  code: string;
  label: string;
  value: string;
  sort_order: number;
  is_active: boolean;
  status: string;
  status_label: string;
  attributes?: ErpOptionSpecificationRESP | null;
  erp_option_group: ErpOptionGroupSummaryRESP;
  conditions_count: number;
  trigger_dependencies_count: number;
  created_at: string;
  updated_at: string;
}

export type ErpOptionGroupListRESP = PaginationResponse<{
  erp_option_groups: ErpOptionGroupRESP[];
}>;

export type ErpOptionListRESP = PaginationResponse<{
  erp_options: ErpOptionRESP[];
}>;

export type ErpOptionGroupDetailRESP = BaseResponse<{
  erp_option_group: ErpOptionGroupDetail;
}>;

export type ErpOptionGroupActionRESP = BaseResponse<{
  erp_option_group: ErpOptionGroupRESP;
}>;

export type ErpOptionDetailRESP = BaseResponse<{
  erp_option: ErpOptionRESP;
}>;

export type ErpOptionActionRESP = BaseResponse<{
  erp_option: ErpOptionRESP;
}>;

export interface ErpExportHistory {
  id: number;
  status: string;
  file_path: string | null;
}

export type ErpExportRESP = BaseResponse<{ history: ErpExportHistory }>;

/*====== Size Options ======*/

export interface SizeOption {
  id: number;
  name: string;
  cutting_width: number;
  cutting_height: number;
  working_width: number;
  working_height: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  creator: string | null;
}

export type SizeOptionListRESP = PaginationResponse<{ size_options: SizeOption[] }>;
export type SizeOptionDetailRESP = BaseResponse<{ size_option: SizeOption }>;

/*====== Papers ======*/

export interface Paper {
  id: number;
  category: PaperCategory;
  name: string;
  specification: Record<string, unknown> | null;
  paper_type_option_value_id: number | null;
  paper_color_option_value_id: number | null;
  paper_weight_option_value_id: number | null;
  grammage_data: unknown[] | null;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  creator: unknown | null;
}

export type PaperListRESP = PaginationResponse<{ papers: Paper[] }>;
export type PaperDetailRESP = BaseResponse<{ paper: Paper }>;
