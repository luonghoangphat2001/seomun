import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type {
  AssignedDesignListREQ,
  BatchPrintWorkInstructionsREQ,
  BulkOrderStatusChangeREQ,
  OrderAssignDesignerREQ,
  OrderListREQ,
  OrderResubmitFileREQ,
  OrderStatusChangeHistoryREQ,
  sendDesignReviewREQ,
  UpdateOrderStatusREQ,
  UploadDraftDesignFileREQ,
} from './order.request';
import type {
  AssignedDesignDetail,
  AssignedDesignListRESP,
  BatchPrintWorkInstructionsRESP,
  BulkOrderStatusChangeRESP,
  OrderActionRESP,
  OrderDesignFilesRESP,
  OrderDetailRESP,
  OrderListRESP,
  OrderStatusChangeHistoryRESP,
  sendDesignReviewRESP,
  WorkInstructionPrintRESP,
} from './order.response';
import type { BaseResponse, PaginationResponse } from '@/types/api';

export function getOrdersAPI(params: OrderListREQ): Promise<OrderListRESP> {
  return api.get(ENDPOINTS.ORDERS.LIST, { params });
}

export function getOrderDetailAPI(orderId: string): Promise<OrderDetailRESP> {
  return api.get(ENDPOINTS.ORDERS.DETAIL(orderId));
}

export function getOrderDesignFilesAPI(orderNumber: string): Promise<OrderDesignFilesRESP> {
  return api.get(ENDPOINTS.ORDERS.DESIGN_FILES(orderNumber));
}

export function resubmitOrderDesignFileAPI(body: OrderResubmitFileREQ) {
  return api.post(ENDPOINTS.ORDERS.DESIGN_FILES_UPLOAD(body.orderNumber), body);
}

export function getOrderStatusChangeHistoryAPI(orderNumber: string, params: OrderStatusChangeHistoryREQ): Promise<OrderStatusChangeHistoryRESP> {
  return api.get(ENDPOINTS.ORDERS.STATUS_CHANGE_HISTORY(orderNumber), { params });
}

export function printWorkInstructionAPI(orderId: string): Promise<WorkInstructionPrintRESP> {
  return api.get(ENDPOINTS.ORDERS.WORK_INSTRUCTIONS.PRINT(orderId));
}

export function batchPrintWorkInstructionsAPI(payload: BatchPrintWorkInstructionsREQ): Promise<BatchPrintWorkInstructionsRESP> {
  return api.post(ENDPOINTS.ORDERS.WORK_INSTRUCTIONS.BATCH_PRINT, payload);
}

export function updateOrderStatusAPI({ orderNumber, ...payload }: UpdateOrderStatusREQ): Promise<OrderActionRESP> {
  return api.put(ENDPOINTS.ORDERS.UPDATE_STATUS(orderNumber), payload);
}

export function bulkOrderStatusChangeAPI(payload: BulkOrderStatusChangeREQ): Promise<BulkOrderStatusChangeRESP> {
  return api.put(ENDPOINTS.ORDERS.BULK_STATUS_CHANGE, payload);
}

export function assignOrderToDesigner(body: OrderAssignDesignerREQ): Promise<BaseResponse<any>> {
  return api.post(ENDPOINTS.ORDERS.DESIGN_WORKFlOW.ASSIGN(body.orderNumber), body);
}

export function getAssignedDessignListAPI(params?: AssignedDesignListREQ): Promise<PaginationResponse<AssignedDesignListRESP>> {
  return api.get(ENDPOINTS.ORDERS.DESIGN_WORKFlOW.ASSIGNED_LIST, { params });
}

export function getAssignedDessignDetailAPI(orderNumber: string): Promise<BaseResponse<AssignedDesignDetail>> {
  return api.get(ENDPOINTS.ORDERS.DESIGN_WORKFlOW.ASSIGNED_DETAIL(orderNumber));
}

export function uploadDratfDesignFileAPI(body: UploadDraftDesignFileREQ): Promise<BaseResponse<any>> {
  const formData = new FormData();
  formData.append('file', body.file);
  formData.append('note', body.note);

  return api.post(ENDPOINTS.ORDERS.DESIGN_WORKFlOW.UPLOAD_DRAFT_FILE(body.orderNumber, body.orderItemId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function sendDesignReviewAPI(body: sendDesignReviewREQ): Promise<BaseResponse<sendDesignReviewRESP>> {
  return api.post(ENDPOINTS.ORDERS.DESIGN_WORKFlOW.SEND_DESIGN_REVIEW(body.orderNumber), body);
}

export function approveDesignWorkFlowAPI(orderNumber: string): Promise<BaseResponse<any>> {
  return api.post(ENDPOINTS.ORDERS.DESIGN_WORKFlOW.ADMIN_APPROVE(orderNumber));
}
