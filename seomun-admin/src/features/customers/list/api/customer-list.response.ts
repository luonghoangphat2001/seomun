import type { BaseResponse, PaginationMeta } from '@/types/api';

import type {
  CustomerAuditLog,
  CustomerMember,
  LabelValue,
  MemberDetail,
  MemberEditableField,
  MemberPermissionInfo,
} from '../../types/customer.type';

export type CustomerListRESP = BaseResponse<{
  members: CustomerMember[];
  pagination: PaginationMeta;
}>;

export type CustomerListRawRESP = BaseResponse<{
  members: CustomerMemberRawItem[];
  pagination?: PaginationMeta;
}> & {
  pagination?: PaginationMeta;
};

export type CustomerSearchFiltersRESP = BaseResponse<{
  authority_options: LabelValue[];
  approval_status_options: LabelValue[];
  status_options: LabelValue[];
  sort_options: LabelValue[];
}>;

export type CustomerDetailRESP = BaseResponse<{
  member: MemberDetail;
  permission: MemberPermissionInfo;
  auditLogs: CustomerAuditLog[];
}>;

export type CustomerDetailRawRESP = BaseResponse<{
  member: CustomerDetailRawItem;
  permission_information?: MemberPermissionInfoRawItem;
  activity_log?: {
    recent_logins?: unknown[];
    recent_orders?: unknown[];
    information_modifications?: {
      logs: MemberModificationLogRawItem[];
      pagination?: PaginationMeta;
    };
  };
}>;

export type CustomerExportRESP = BaseResponse<{
  history: {
    id: number;
    user_id?: number;
    module?: string;
    file_name: string;
    file_path: string;
    status: string;
    filters?: Record<string, unknown>;
    created_at: string;
    updated_at?: string;
  };
}>;

export interface CustomerDetailRawItem extends CustomerMemberRawItem {
  postcode: string | null;
  address: string | null;
  detailed_address: string | null;
  full_address: string | null;
  customer: MemberCompanyRawItem | null;
  agreed_at: string | null;
  approved_at: string | null;
  approved_by: { id: number; name: string; username: string } | null;
  membership_tier: { id: number; name: string } | null;
  agree_privacy?: boolean;
  agree_terms?: boolean;
  editable_fields?: Partial<Record<MemberEditableField, boolean>>;
  refund_bank?: string | null;
  refund_account_number?: string | null;
  refund_account_name?: string | null;
  virtual_account?: MemberVirtualAccountRawItem | null;
}

export interface MemberVirtualAccountRawItem {
  provider: string;
  account_number: string;
  bank_code: string;
  customer_name: string;
  status: string;
}

export interface MemberCompanyRawItem {
  company_name: string | null;
  business_registration_number: string | null;
  representative_name: string | null;
  industry_type: string | null;
  business_type: string | null;
  postcode: string | null;
  address: string | null;
  detailed_address: string | null;
  tax_invoice_email: string | null;
  business_registration_file: string | null;
}

export interface MemberPermissionInfoRawItem {
  membership_level: LabelValue;
  availability: { value: boolean; label: string };
  approval_status: LabelValue;
  authority: { value: string | null; label: string };
  status: LabelValue;
  can_approve: boolean;
  can_restore: boolean;
}

export interface MemberModificationLogRawItem {
  id: number;
  modified_at: string;
  modified_by: { id: number; username: string; name: string; email: string } | null;
  fields: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changes?: Record<string, unknown>;
  };
  description: string;
}

export interface CustomerMemberRawItem {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  member_type?: string | null;
  company_name?: string | null;
  note?: string | null;
  status: LabelValue;
  approval_status: LabelValue;
  authority: { value: string | null; label: string };
  date_of_joining: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ProxyLoginRESP = {
  proxy_login: {
    session_id: number;
    target_user_id: number;
    target_username: string;
    expires_at: string;
  };
  redirect_url: string;
};
