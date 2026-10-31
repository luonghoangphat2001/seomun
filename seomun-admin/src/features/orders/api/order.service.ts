import type { OrderListREQ } from './order.request';
import type { OrderArtworkDesign, OrderListItemRESP, OrderListRESP } from './order.response';
import { getOrderDesignFilesAPI, getOrderDetailAPI, getOrdersAPI } from './order.api';

export function getOrderList(params: OrderListREQ): Promise<OrderListRESP> {
  return getOrdersAPI(params);
}

export async function getOrderDetail(orderId: string): Promise<OrderListItemRESP | null> {
  const resp = await getOrderDetailAPI(orderId);
  return resp?.data?.order ?? null;
}

export async function getOrderDesignFiles(orderNumber: string): Promise<OrderArtworkDesign[]> {
  const resp = await getOrderDesignFilesAPI(orderNumber);
  return resp?.data?.artworks ?? [];
}
