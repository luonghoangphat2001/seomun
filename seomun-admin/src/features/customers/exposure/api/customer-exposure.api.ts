import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { ExposureCustomerListREQ, PromotionalProductListREQ, UpdatePromotionalProductsREQ } from './customer-exposure.request';
import type { ExposureCustomerListRawRESP, PromotionalProductListRawRESP, UpdatePromotionalProductsRESP } from './customer-exposure.response';

export function getExposureCustomersAPI(request: ExposureCustomerListREQ): Promise<ExposureCustomerListRawRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.LIST, { params: request });
}

export function getPromotionalProductsAPI(request: PromotionalProductListREQ): Promise<PromotionalProductListRawRESP> {
  const { customer_id, ...params } = request;
  return api.get(ENDPOINTS.CUSTOMERS.PROMOTIONAL_PRODUCTS(customer_id), { params });
}

export function updatePromotionalProductsAPI(request: UpdatePromotionalProductsREQ): Promise<UpdatePromotionalProductsRESP> {
  const { customer_id, product_ids } = request;
  return api.put(ENDPOINTS.CUSTOMERS.PROMOTIONAL_PRODUCTS(customer_id), { product_ids });
}
