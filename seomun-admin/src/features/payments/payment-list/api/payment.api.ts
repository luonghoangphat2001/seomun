import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { BaseResponse } from '@/types/api';
import type { ExportProgressREQ, PaymentExportExcelREQ, PaymentListREQ, PaymentRefundREQ, PaymentStatisticREQ } from './payment.request';
import type {
  PaymentDetailResultRESP,
  PaymentExportProgressResultRESP,
  PaymentExportRESP,
  PaymentListRESP,
  PaymentReceiptRESP,
  PaymentRefundRESP,
  StatisticsRESP,
} from './payment.response';

export function getPaymentsAPI(params: PaymentListREQ): Promise<PaymentListRESP> {
  return api.get<PaymentListRESP>(ENDPOINTS.PAYMENTS.LIST, { params });
}

export function getPaymentDetailAPI(id: number): Promise<PaymentDetailResultRESP> {
  return api.get<PaymentDetailResultRESP>(ENDPOINTS.PAYMENTS.DETAIL(id));
}

export function exportPaymentsExcelAPI(params: PaymentExportExcelREQ): Promise<PaymentExportRESP> {
  return api.post<PaymentExportRESP>(ENDPOINTS.PAYMENTS.EXPORT_EXCEL, params);
}

export function checkExportProgressStatusAPI(historyId: number, params: ExportProgressREQ): Promise<PaymentExportProgressResultRESP> {
  return api.get<PaymentExportProgressResultRESP>(ENDPOINTS.PAYMENTS.CHECK_EXPORT_STATUS(historyId), { params });
}

export function getPaymentStatisticsAPI(params: PaymentStatisticREQ): Promise<BaseResponse<StatisticsRESP>> {
  return api.get<BaseResponse<StatisticsRESP>>(ENDPOINTS.PAYMENTS.STATISTICS, { params });
}

export function getPaymentReceiptAPI(id: number): Promise<BaseResponse<PaymentReceiptRESP>> {
  return api.get<BaseResponse<PaymentReceiptRESP>>(ENDPOINTS.PAYMENTS.RECEIPT(id));
}

export function refundPaymentAPI(transactionId: string, payload: PaymentRefundREQ): Promise<PaymentRefundRESP> {
  return api.post<PaymentRefundRESP>(ENDPOINTS.PAYMENTS.REFUND(transactionId), payload);
}
