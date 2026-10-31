import { OrderTrackingDeliveryRESP } from './order.response';
import { ExportType } from '@/enums/common';
import { OrderFilterLabel } from '@/enums/order';
import { PaginationREQ } from '@/types';

export type OrderListREQ = PaginationREQ;

export type OrderHistoryListREQ = PaginationREQ & {
  filter_label?: OrderFilterLabel;
  date_from?: string;
  date_to?: string;
  order_number_keyword?: string;
  product_name_keyword?: string;
};

export type OrderHistoryChangeAddressREQ = {
  orderNumber: string;
  address_book_id: number;
};

export type OrderHistoryResubmitFileREQ = {
  orderNumber: string;
  file: File;
  note: string;
  order_item_id: number;
};

export type OrderHistoryProofConfirmREQ = {
  orderNumber: string;
  confirm: boolean;
  order_item_id: number;
};

export type OrderHistoryReviewREQ = {
  product_id: number;
  order_id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  content: string;
  images?: string[];
};

export type OrderHistoryDownloadREQ = OrderHistoryListREQ & {
  export_type?: ExportType;
};

export type OrderTrackingDeliveryREQ = {
  invoice_number: string;
};
