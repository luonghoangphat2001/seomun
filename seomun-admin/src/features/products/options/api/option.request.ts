import type { PaginationRequest, SortRequest } from '@/types/api';

import type {
  ErpExportType,
  ErpOptionDisplayType,
  ErpOptionGroupSortField,
  ErpOptionGroupType,
  ErpOptionSortField,
  PaperCategory,
  PaperStatusValue,
} from '../enums';

export interface ErpOptionGroupListREQ extends PaginationRequest, SortRequest<ErpOptionGroupSortField> {
  current_page?: number;
  code?: string;
  label?: string;
  type?: ErpOptionGroupType;
  display_type?: ErpOptionDisplayType;
  is_required?: boolean;
  created_from?: string;
  created_to?: string;
}

export interface ErpOptionListREQ extends PaginationRequest, SortRequest<ErpOptionSortField> {
  current_page?: number;
  erp_option_group_id?: number;
  group_code?: string;
  option_code?: string;
  option_label?: string;
  created_from?: string;
  created_to?: string;
}

export interface ErpOptionGroupExportREQ {
  export_type: ErpExportType;
  current_page?: number;
  per_page?: number;
  selected_ids?: number[];
  filters: Omit<ErpOptionGroupListREQ, 'page' | 'per_page'>;
}

export interface ErpOptionExportREQ {
  export_type: ErpExportType;
  current_page?: number;
  per_page?: number;
  selected_ids?: number[];
  group_code?: string;
  filters: Omit<ErpOptionListREQ, 'page' | 'per_page' | 'group_code'> | Record<string, unknown>;
}

export interface SizeOptionListREQ extends PaginationRequest {
  search?: string;
}

export interface SizeOptionCreateREQ {
  name: string;
  cutting_width: number;
  cutting_height: number;
  working_width: number;
  working_height: number;
}

export type SizeOptionUpdateREQ = SizeOptionCreateREQ;

export interface PaperListREQ extends PaginationRequest {
  category?: PaperCategory;
  name?: string;
  is_active?: boolean;
}

export interface PaperSpecificationREQ {
  thickness_mm: number;
}

export interface PaperCreateREQ {
  category: PaperCategory;
  name: string;
  is_active: PaperStatusValue;
  specification: PaperSpecificationREQ;
  paper_type_option_value_id: number;
  paper_color_option_value_id: number;
  paper_weight_option_value_id: number;
}

export type PaperUpdateREQ = PaperCreateREQ;

export interface ErpOptionSpecificationREQ {
  image?: string;
  description?: string;
}

export interface ErpOptionCreateREQ {
  label: string;
  code: string;
  value?: string;
  attributes?: ErpOptionSpecificationREQ;
}

export type ErpOptionUpdateREQ = Partial<ErpOptionCreateREQ>;
