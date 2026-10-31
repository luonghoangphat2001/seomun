import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { BaseResponse } from '@/types/api';

import type { CustomerBasicInfoUpdateREQ, CustomerChangePasswordREQ, CustomerListREQ, ExportCustomerListREQ } from './customer-list.request';
import type {
  CustomerDetailRawRESP,
  CustomerExportRESP,
  CustomerListRawRESP,
  CustomerSearchFiltersRESP,
  ProxyLoginRESP,
} from './customer-list.response';

export function getCustomerListAPI(request: CustomerListREQ): Promise<CustomerListRawRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.LIST, { params: request });
}

export function getCustomerSearchFiltersAPI(): Promise<CustomerSearchFiltersRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.SEARCH_FILTERS);
}

export function getCustomerDetailAPI(memberId: number): Promise<CustomerDetailRawRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.DETAIL(memberId));
}

// ponytail: the update response is not consumed — the detail query refetches after the mutation
export function updateCustomerBasicInfoAPI(request: CustomerBasicInfoUpdateREQ): Promise<BaseResponse<unknown>> {
  const { member_id, ...payload } = request;
  return api.put(ENDPOINTS.CUSTOMERS.UPDATE(member_id), payload);
}

export function changeCustomerPasswordAPI(request: CustomerChangePasswordREQ): Promise<BaseResponse<unknown>> {
  const { member_id, ...payload } = request;
  return api.post(ENDPOINTS.CUSTOMERS.CHANGE_PASSWORD(member_id), payload);
}

export function exportCustomerListAPI(request: ExportCustomerListREQ): Promise<CustomerExportRESP> {
  return api.post(ENDPOINTS.CUSTOMERS.EXPORT_EXCEL, request);
}

export function getCustomerExportStatusAPI(historyId: number): Promise<CustomerExportRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.EXPORT_STATUS(historyId));
}

export function getProxyLoginAPI(memberId: number): Promise<BaseResponse<ProxyLoginRESP>> {
  return api.post(ENDPOINTS.CUSTOMERS.PROXY_LOGIN(memberId), {}, { withCredentials: true });
}
