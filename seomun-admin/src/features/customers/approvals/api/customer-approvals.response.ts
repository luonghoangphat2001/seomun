import type { BaseResponse, PaginationMeta } from '@/types/api';

import type { CustomerApprovalRequestType } from '../../enums';
import type { CustomerApprovalHistoryItem, CustomerApprovalRequest, LabelValue } from '../../types/customer.type';

export type CustomerApprovalRequestListRESP = BaseResponse<{
  requests: CustomerApprovalRequest[];
  pagination: PaginationMeta;
}>;

export type CustomerApprovalHistoryRESP = BaseResponse<{
  histories: CustomerApprovalHistoryItem[];
  pagination: PaginationMeta;
}>;

export type CustomerApprovalDecisionRESP = BaseResponse<{
  processed_count: number;
}>;

export type CustomerApprovalWireStatus = 'accepted' | 'pending' | 'rejected';
export type CustomerApprovalWireRequestType = 'new_signup' | 'information_modification' | 'permission_change';

export interface CustomerApprovalRawItem {
  id: number;
  company_name: string;
  business_registration_number: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  status: LabelValue;
  approval_status: LabelValue<CustomerApprovalWireStatus | string>;
  request_type: LabelValue<CustomerApprovalWireRequestType | CustomerApprovalRequestType | string> | null;
  requester: {
    id: number;
    name: string;
    username: string;
  } | null;
  processed_at: string | null;
  processed_by: string | null;
  reason: string | null;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export type CustomerApprovalRawListRESP = BaseResponse<{
  customers: CustomerApprovalRawItem[];
  pagination: PaginationMeta;
}>;
