import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import { CustomerApprovalStatus } from '../../enums';
import type { CustomerApprovalDecisionREQ, CustomerApprovalListREQ } from './customer-approvals.request';
import type { CustomerApprovalDecisionRESP, CustomerApprovalRawListRESP } from './customer-approvals.response';

export function getCustomerApprovalRequestsAPI(request: CustomerApprovalListREQ): Promise<CustomerApprovalRawListRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.APPROVE_REQUESTS, { params: getApprovalListParams(request) });
}

export function getCustomerApprovalHistoryAPI(request: CustomerApprovalListREQ): Promise<CustomerApprovalRawListRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.APPROVAL_HISTORIES, { params: getApprovalListParams(request) });
}

export function decideCustomerApprovalsAPI(request: CustomerApprovalDecisionREQ): Promise<CustomerApprovalDecisionRESP> {
  return api.post(ENDPOINTS.CUSTOMERS.APPROVAL, buildApprovalDecisionFormData(request), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

function getApprovalListParams(request: CustomerApprovalListREQ) {
  return {
    page: request.page,
    per_page: request.per_page,
    ...(request.request_type ? { request_type: request.request_type } : {}),
    ...(request.approval_status ? { approval_status: request.approval_status } : {}),
  };
}

function buildApprovalDecisionFormData(request: CustomerApprovalDecisionREQ) {
  const formData = new FormData();

  for (const customerId of request.customer_ids) {
    formData.append('customer_ids[]', String(customerId));
  }
  formData.append('approval_status', request.approval_status === CustomerApprovalStatus.APPROVED ? 'accepted' : 'rejected');
  formData.append('reason', request.reason);

  return formData;
}
