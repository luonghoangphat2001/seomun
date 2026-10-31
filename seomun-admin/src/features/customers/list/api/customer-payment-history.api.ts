import { ENDPOINTS } from '@/config/endpoints';
import type { PaymentListRESP } from '@/features/payments/payment-list';
import { api } from '@/lib/api/api-client';

import type { CustomerPaymentHistoryREQ } from './customer-payment-history.request';

export function getCustomerPaymentHistoryAPI({ customer_id, ...params }: CustomerPaymentHistoryREQ): Promise<PaymentListRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.PAYMENTS(customer_id), { params });
}
