import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { BaseResponse } from '@/types/api';
import type { DashboardOperationsREQ } from './dashboard.request';
import type {
  CustomerStaticRESP,
  DashboardOperationsBaseRESP,
  DashboardStatisticsExportRawRESP,
  InquiryStaticRESP,
  MembersStaticRESP,
  OrderStaticRESP,
  PaymentStaticRESP,
  ProductsStaticRESP,
} from './dashboard.response';

export function getDashboardOperationsAPI(params: DashboardOperationsREQ): Promise<DashboardOperationsBaseRESP> {
  return api.get(ENDPOINTS.DASHBOARD.OPERATIONS, { params });
}

export function getMembersStaticAPI(params: { start_date: string; end_date: string; customer_ids?: number[] }) {
  return api.get<BaseResponse<MembersStaticRESP>>(ENDPOINTS.DASHBOARD.STATISTICS_MEMBERS, { params });
}

export function getProductsStaticAPI(params: { start_date: string; end_date: string; customer_ids?: number[]; limit?: number }) {
  return api.get<BaseResponse<ProductsStaticRESP>>(ENDPOINTS.DASHBOARD.STATISTICS_PRODUCTS, { params });
}

export function getOrderStaticAPI(params: { period: string; customer_ids?: number[] }) {
  return api.get<BaseResponse<OrderStaticRESP>>(ENDPOINTS.DASHBOARD.STATISTICS_ORDERS, { params });
}

export function exportStaticAPI(url: string, params: Record<string, unknown>) {
  return api.get<BaseResponse<DashboardStatisticsExportRawRESP>>(url, { params: { ...params, export: true } });
}

export function getCustomerStaticAPI(params: { customer_ids?: number[]; sales_representative?: string }) {
  return api.get<BaseResponse<CustomerStaticRESP>>(ENDPOINTS.DASHBOARD.STATISTICS_CUSTOMERS, { params });
}

export function getInquiryStaticAPI(params: { period: string; customer_ids?: number[] }) {
  return api.get<BaseResponse<InquiryStaticRESP>>(ENDPOINTS.DASHBOARD.STATISTICS_INQUIRIES, { params });
}

export function getPaymentStaticAPI(params: {
  period?: 'monthly' | 'quarterly' | 'yearly';
  date_from?: string;
  date_to?: string;
  customer_ids?: number[];
}) {
  return api.get<BaseResponse<PaymentStaticRESP>>(ENDPOINTS.DASHBOARD.STATISTICS_PAYMENTS, { params });
}

/** Shared progress record for any generated export file. */
export function getExportHistoryAPI(historyId: number) {
  return api.get<BaseResponse<DashboardStatisticsExportRawRESP>>(ENDPOINTS.EXPORT_HISTORY(historyId));
}
