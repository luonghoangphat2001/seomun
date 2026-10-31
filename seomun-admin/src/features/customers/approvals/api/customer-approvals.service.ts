import { CustomerApprovalRequestType, CustomerApprovalStatus } from '../../enums';
import type { CustomerApprovalHistoryItem, CustomerApprovalRequest, LabelValue } from '../../types/customer.type';
import { decideCustomerApprovalsAPI, getCustomerApprovalHistoryAPI, getCustomerApprovalRequestsAPI } from './customer-approvals.api';
import type { CustomerApprovalDecisionREQ, CustomerApprovalListREQ } from './customer-approvals.request';
import type {
  CustomerApprovalDecisionRESP,
  CustomerApprovalHistoryRESP,
  CustomerApprovalRawItem,
  CustomerApprovalRequestListRESP,
} from './customer-approvals.response';

export async function getCustomerApprovalRequestsService(request: CustomerApprovalListREQ): Promise<CustomerApprovalRequestListRESP> {
  const response = await getCustomerApprovalRequestsAPI(request);
  return {
    success: response.success,
    message: response.message,
    data: {
      requests: response.data.customers.map(mapRawCustomerApprovalRequest),
      pagination: response.data.pagination,
    },
  };
}

export async function getCustomerApprovalHistoryService(request: CustomerApprovalListREQ): Promise<CustomerApprovalHistoryRESP> {
  const response = await getCustomerApprovalHistoryAPI(request);
  return {
    success: response.success,
    message: response.message,
    data: {
      histories: response.data.customers.map(mapRawCustomerApprovalHistory),
      pagination: response.data.pagination,
    },
  };
}

export async function decideCustomerApprovalsService(request: CustomerApprovalDecisionREQ): Promise<CustomerApprovalDecisionRESP> {
  return decideCustomerApprovalsAPI(request);
}

function mapRawCustomerApprovalRequest(item: CustomerApprovalRawItem): CustomerApprovalRequest {
  return {
    id: item.id,
    customerId: item.id,
    requestType: mapWireRequestType(item.request_type),
    requester: item.requester?.username ?? '-',
    requestedAt: item.created_at,
    reason: item.reason,
    companyName: item.company_name,
    businessRegistrationNumber: item.business_registration_number,
    contactName: item.contact_name,
    status: item.status,
    approvalStatus: {
      value: mapWireApprovalStatus(item.approval_status.value),
      label: item.approval_status.label,
    },
  };
}

function mapRawCustomerApprovalHistory(item: CustomerApprovalRawItem): CustomerApprovalHistoryItem {
  return {
    id: item.id,
    customerId: item.id,
    requestType: mapWireRequestType(item.request_type),
    requester: item.requester?.username ?? '-',
    approver: item.processed_by ?? '-',
    requestedAt: item.created_at,
    processedAt: item.processed_at ?? item.updated_at,
    reason: item.reason,
    result: {
      value: mapWireApprovalStatus(item.approval_status.value),
      label: item.approval_status.label,
    },
    companyName: item.company_name,
  };
}

function mapWireRequestType(requestType: CustomerApprovalRawItem['request_type']): LabelValue<CustomerApprovalRequestType> | null {
  if (!requestType?.value) return null;

  const value = normalizeWireRequestType(requestType.value);
  if (!value) return null;

  return {
    value,
    label: requestType.label,
  };
}

function normalizeWireRequestType(value: string) {
  const normalized = value.toLowerCase();
  if (normalized === 'new_signup' || normalized === CustomerApprovalRequestType.SIGN_UP.toLowerCase()) {
    return CustomerApprovalRequestType.SIGN_UP;
  }
  if (normalized === 'information_modification' || normalized === CustomerApprovalRequestType.INFORMATION_MODIFICATION.toLowerCase()) {
    return CustomerApprovalRequestType.INFORMATION_MODIFICATION;
  }
  if (normalized === 'permission_change' || normalized === CustomerApprovalRequestType.PERMISSION_CHANGE.toLowerCase()) {
    return CustomerApprovalRequestType.PERMISSION_CHANGE;
  }
  return null;
}

function mapWireApprovalStatus(value: string): CustomerApprovalStatus {
  const normalized = value.toLowerCase();
  if (normalized === 'accepted' || normalized === 'approved') return CustomerApprovalStatus.APPROVED;
  if (normalized === 'rejected') return CustomerApprovalStatus.REJECTED;
  return CustomerApprovalStatus.PENDING;
}
