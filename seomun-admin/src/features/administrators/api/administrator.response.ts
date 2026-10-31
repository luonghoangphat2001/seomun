import type { BaseResponse, PaginationResponse, StringOptions } from '@/types/api';

import type { AdministratorRole, AdministratorStatus } from '../enums';

export type AdministratorRESP = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  postcode: string;
  address: string;
  detailed_address: string;
  authority: AdministratorRole;
  role: AdministratorRole;
  is_admin: boolean;
  is_super_admin: boolean;
  is_store_admin: boolean;
  is_normal_user: boolean;
  headquarters: string;
  business_office: string;
  agree_privacy: boolean;
  agree_terms: boolean;
  team: string;
  position: string;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  status?: AdministratorStatus;
  admin_permissions: AdminePermission[];
  permission_groups?: { id: number; name: string; status: string }[];
  department: string | null;
  hire_date: string | null;
  resignation_date: string | null;
  bank_name: string | null;
  account_number: string | null;
  note?: string | null;
};

export type AdminePermission = {
  id: number;
  admin_permission_id: number;
  status: StringOptions;
  grant_date: string;
  created_at: string;
  updated_at: string;
};

export type AdministratorListRESP = PaginationResponse<{
  users: AdministratorRESP[];
}>;

export type AdministratorDetailRESP = BaseResponse<{
  user: AdministratorRESP;
}>;

export type AdministratorDeleteRESP = Pick<BaseResponse<never>, 'success' | 'message'>;

export type AdministratorUpdatePasswordRESP = Pick<BaseResponse<never>, 'success' | 'message'>;

export type AdministratorBulkRESP = Pick<BaseResponse<never>, 'success' | 'message'>;

export type AdministratorExportRESP = BaseResponse<{
  history: { id: number; status: string; file_path: string | null };
}>;
