import { ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api/api-client';

import type { CustomerRegisterREQ } from './customer-register.request';
import type { CustomerRegisterRESP } from './customer-register.response';

type CustomerRegisterRawRESP = Omit<CustomerRegisterRESP, 'httpStatus'>;

export async function registerCustomerAPI(request: CustomerRegisterREQ): Promise<CustomerRegisterRESP> {
  const response = await apiClient.post<CustomerRegisterRawRESP>(ENDPOINTS.CUSTOMERS.CREATE, request);

  return {
    ...response.data,
    httpStatus: response.status,
  };
}
