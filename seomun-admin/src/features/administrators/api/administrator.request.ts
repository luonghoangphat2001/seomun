import type { PaginationRequest, SortRequest } from '@/types/api';

import type { AdministratorExportExcelType, AdministratorRole, AdministratorSortField, AdministratorStatus } from '../enums';

export type AdministratorListREQ = PaginationRequest &
  SortRequest<AdministratorSortField> & {
    search_term?: string;
  };

export type AdministratorCreateREQ = {
  username: string;
  name: string;
  password: string;
  password_confirmation: string;
  email: string;
  mobile: string;
  admin_permission_ids: number[];
  hire_date?: string;
  resignation_date?: string;
  department?: string;
  position?: string;
  phone?: string;
  bank_name?: string;
  account_number?: string;
  note?: string;
};

export type AdministratorUpdateREQ = {
  status: AdministratorStatus;
  role: AdministratorRole;
  name: string;
  mobile: string;
  admin_permission_ids: number[];
  hire_date?: string;
  resignation_date?: string;
  department?: string;
  position?: string;
  phone?: string;
  bank_name?: string;
  account_number?: string;
  note?: string;
};

export type AdministratorExportFilters = Pick<AdministratorListREQ, 'search_term' | 'sort_by' | 'sort_order'>;

export type AdministratorExportREQ = AdministratorExportFilters & {
  export_type: AdministratorExportExcelType;
  current_page?: number;
  per_page?: number;
  selected_ids?: number[];
};

export type AdministratorBulkStatusREQ = {
  user_ids: number[];
  status: AdministratorStatus;
};

export type AdministratorBulkPermissionsREQ = {
  user_ids: number[];
  admin_permission_ids: number[];
};

export type AdministratorBulkDeleteREQ = {
  user_ids: number[];
};

export type AdministratorUpdatePasswordREQ = {
  password: string;
  password_confirmation: string;
};
