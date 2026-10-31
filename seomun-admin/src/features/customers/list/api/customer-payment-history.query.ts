import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getCustomerPaymentHistoryAPI } from './customer-payment-history.api';
import type { CustomerPaymentHistoryREQ } from './customer-payment-history.request';

export const customerPaymentHistoryKeys = {
  all: ['customers', 'payment-history'] as const,
  list: (request: CustomerPaymentHistoryREQ) => [...customerPaymentHistoryKeys.all, request] as const,
};

export function useCustomerPaymentHistoryQuery(request: CustomerPaymentHistoryREQ) {
  return useQuery({
    queryKey: customerPaymentHistoryKeys.list(request),
    queryFn: () => getCustomerPaymentHistoryAPI(request),
    enabled: request.customer_id > 0,
    placeholderData: keepPreviousData,
  });
}
