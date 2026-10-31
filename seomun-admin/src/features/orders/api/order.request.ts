import type { PaginationRequest, SortRequest } from '@/types/api';

import type { AssignedDesignStatus, OrderShippingMethod, OrderSortField, OrderStatus, OrderStatusGroup } from '../enums';

export interface OrderListREQ extends PaginationRequest, SortRequest<OrderSortField> {
  search_term?: string;
  order_number?: string;
  customer_name?: string;
  orderer_name?: string;
  status?: OrderStatus;
  status_group?: OrderStatusGroup;
  shipping_method?: OrderShippingMethod;
  order_date_from?: string;
  order_date_to?: string;
  tax_invoice_status_is_null?: number;
  cash_receipt_status_is_null?: number;
}

export type OrderStatusChangeHistoryREQ = PaginationRequest;

export interface BatchPrintWorkInstructionsREQ {
  order_ids: number[];
}

export interface UpdateOrderStatusREQ {
  orderNumber: string;
  status: OrderStatus;
}

export interface BulkOrderStatusChangeREQ {
  order_numbers: string[];
  status: OrderStatus;
  reason: string;
}

export type OrderResubmitFileREQ = {
  orderNumber: string;
  file_name: string;
  file_url: string;
  note?: string;
  order_item_id: number;
};

export type OrderAssignDesignerREQ = {
  orderNumber: string;
  designer_user_id: number;
  order_item_ids?: number[];
};

export type AssignedDesignListREQ = PaginationRequest & {
  status?: AssignedDesignStatus;
};

export type UploadDraftDesignFileREQ = {
  orderNumber: string;
  orderItemId: number;
  file: File;
  note: string;
};

export type sendDesignReviewREQ = {
  orderNumber: string;
  version_ids: number[];
};
