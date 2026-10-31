import type { OrderListItemRESP } from '../api/order.response';

export function getOrderCompanyName(order: Pick<OrderListItemRESP, 'contact' | 'company_name'>) {
  return order.contact?.company_name?.trim() || order.company_name?.trim() || '';
}
