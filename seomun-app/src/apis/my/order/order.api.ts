import { api } from '@/config';
import { BaseResponse, PaginationResponse } from '@/types';
import {
  OrderHistoryChangeAddressREQ,
  OrderHistoryDownloadREQ,
  OrderHistoryListREQ,
  OrderHistoryProofConfirmREQ,
  OrderHistoryResubmitFileREQ,
  OrderHistoryReviewREQ,
  OrderListREQ,
  OrderTrackingDeliveryREQ,
} from './order.request';
import {
  OrderChangeAddressHistoryRESP,
  OrderHistoryDetailRESP,
  OrderHistoryDownloadRESP,
  OrderHistoryListRESP,
  OrderListRESP,
  OrderTrackingDeliveryRESP,
} from './order.response';

const ENDPOINT = {
  LIST: '/orders',
  HISTORY_LIST: '/mypage-order-delivery-tracking/histories',
  QUOTATION_PDF: (orderNumber: string) => `/mypage-order-delivery-tracking/histories/${orderNumber}/quotation/pdf`,
  TRANSACTION_STATEMENT_PDF: (orderNumber: string) =>
    `/mypage-order-delivery-tracking/histories/${orderNumber}/transaction-statement/pdf`,
  CHANGE_ADDRESS: (orderNumber: string) => `/mypage-order-delivery-tracking/histories/${orderNumber}/shipping-address`,
  RESUBMIT_FILE: (orderNumber: string) => `/mypage-order-delivery-tracking/histories/${orderNumber}/proof/resubmit-file`,
  PROOF_CONFIRM: (orderNumber: string) => `/mypage-order-delivery-tracking/histories/${orderNumber}/proof/confirm`,
  ADDRESS_CHANGE_HISTORY: (orderNumber: string) =>
    `/mypage-order-delivery-tracking/histories/${orderNumber}/shipping-address-changes`,
  REVIEW: '/mypage/reviews',
  DOWNLOAD_EXCEL: '/mypage-order-delivery-tracking/histories/export-excel',
  TRACKING_DELIVERY: '/hanjin/tracking',
};

export const OrderApi = {
  list: (params?: OrderListREQ) => api.get<PaginationResponse<OrderListRESP>>(ENDPOINT.LIST, { params }),
  //---------
  getOrderHistoryList: (params?: OrderHistoryListREQ) =>
    api.get<PaginationResponse<OrderHistoryListRESP>>(ENDPOINT.HISTORY_LIST, {
      params: { ...params, sort_by: 'created_at', sort_order: 'desc' },
    }),

  downloadQuotationPDF: (orderNumber: string) =>
    api.get<Blob>(ENDPOINT.QUOTATION_PDF(orderNumber), {
      responseType: 'blob',
    }),

  downloadTransactionStatementPDF: (orderNumber: string) =>
    api.get<Blob>(ENDPOINT.TRANSACTION_STATEMENT_PDF(orderNumber), {
      responseType: 'blob',
    }),

  getOrderHistoryDetail: (orderNumber: string) =>
    api.get<BaseResponse<OrderHistoryDetailRESP>>(`${ENDPOINT.HISTORY_LIST}/${orderNumber}`),

  changeOrderHistoryAddress: (body: OrderHistoryChangeAddressREQ) => api.put(ENDPOINT.CHANGE_ADDRESS(body.orderNumber), body),
  resubmitFile: (body: OrderHistoryResubmitFileREQ) => {
    const formData = new FormData();
    formData.append('file', body.file);
    formData.append('note', body.note);
    formData.append('order_item_id', String(body.order_item_id));

    return api.post(ENDPOINT.RESUBMIT_FILE(body.orderNumber), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  proofconfirm: (body: OrderHistoryProofConfirmREQ) => api.post(ENDPOINT.PROOF_CONFIRM(body.orderNumber), body),
  getOrderAddressChangeHistory: (orderNumber: string) =>
    api.get<BaseResponse<OrderChangeAddressHistoryRESP>>(ENDPOINT.ADDRESS_CHANGE_HISTORY(orderNumber)),

  reviewOrderHistory: (body: OrderHistoryReviewREQ) => api.post(ENDPOINT.REVIEW, body),

  downloadExcel: (body: OrderHistoryDownloadREQ) =>
    api.post<BaseResponse<OrderHistoryDownloadRESP>>(ENDPOINT.DOWNLOAD_EXCEL, body),

  trackingDelivery: (params?: OrderTrackingDeliveryREQ) =>
    api.get<BaseResponse<OrderTrackingDeliveryRESP>>(ENDPOINT.TRACKING_DELIVERY, { params }),
};
