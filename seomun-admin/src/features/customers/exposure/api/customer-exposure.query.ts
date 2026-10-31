import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customerListKeys } from '../../list';
import { getExposureCustomersService, getPromotionalProductsService, updatePromotionalProductsService } from './customer-exposure.service';
import type { ExposureCustomerListREQ, PromotionalProductListREQ, UpdatePromotionalProductsREQ } from './customer-exposure.request';

export const customerExposureKeys = {
  all: ['customers', 'exposure'] as const,
  customers: (request: ExposureCustomerListREQ) => [...customerExposureKeys.all, 'customers', request] as const,
  products: (request: PromotionalProductListREQ) => [...customerExposureKeys.all, 'products', request] as const,
};

export function useExposureCustomersQuery(request: ExposureCustomerListREQ) {
  return useQuery({
    queryKey: customerExposureKeys.customers(request),
    queryFn: () => getExposureCustomersService(request),
    placeholderData: keepPreviousData,
  });
}

export function usePromotionalProductsQuery(request: PromotionalProductListREQ) {
  return useQuery({
    queryKey: customerExposureKeys.products(request),
    queryFn: () => getPromotionalProductsService(request),
    enabled: request.customer_id > 0,
    placeholderData: keepPreviousData,
  });
}

export function usePromotionalProductsUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdatePromotionalProductsREQ) => updatePromotionalProductsService(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerExposureKeys.all }),
        queryClient.invalidateQueries({ queryKey: customerListKeys.all }),
      ]);
    },
  });
}
