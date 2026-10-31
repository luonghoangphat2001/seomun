import type { PaginationRequest } from '@/types/api';

import type { CustomerApprovalRequestType, CustomerApprovalStatus } from '../../enums';

export type CustomerApprovalStatusFilter = 'accepted' | 'rejected';

export interface CustomerApprovalListREQ extends PaginationRequest {
  request_type?: CustomerApprovalRequestType;
  approval_status?: CustomerApprovalStatusFilter;
}

export type CustomerApprovalDecisionWireStatus = 'accepted' | 'rejected';

export interface CustomerApprovalDecisionREQ {
  customer_ids: number[];
  approval_status: CustomerApprovalStatus.APPROVED | CustomerApprovalStatus.REJECTED;
  reason: string;
}
