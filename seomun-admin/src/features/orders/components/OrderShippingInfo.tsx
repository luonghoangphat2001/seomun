import { useTranslation } from 'react-i18next';

import type { OrderListItemRESP } from '../api/order.response';
import { formatLocalDate } from '@/utils/format-date';

import { ORDER_SHIPPING_METHOD_LABELS } from '../constants';
import { type OrderShippingMethod } from '../enums';
import { OrderInfoCard, OrderInfoRow } from './OrderInfoCard';

interface OrderShippingInfoProps {
  order: OrderListItemRESP;
}

export function OrderShippingInfo({ order }: OrderShippingInfoProps) {
  const { t } = useTranslation('page');
  const shipping = order.shipping;
  const contactNumber = shipping.cellphone_number || shipping.phone || shipping.phone2 || '-';
  const address = [shipping.postcode ? `[${shipping.postcode}]` : null, shipping.address, shipping.address_detail].filter(Boolean).join(' ');
  const shippingStatus = shipping.shipping_status_label_ko ?? shipping.shipping_status_label_en ?? shipping.shipping_status ?? '-';
  const shippingDate = shipping.shipped_date ?? order.waybill.registered_at;
  const deliveryMessage = shipping.message_preset;
  const shippingMethod = shipping.method || order.shipping_method;
  const shippingMethodLabel = shippingMethod ? (ORDER_SHIPPING_METHOD_LABELS[shippingMethod as OrderShippingMethod]?.(t) ?? shippingMethod) : '-';

  return (
    <OrderInfoCard title={t('orders.detail.shipping_info.title')}>
      <OrderInfoRow label={t('orders.detail.shipping_info.recipient')}>{shipping.name || '-'}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.shipping_info.contact')}>{contactNumber}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.shipping_info.address')}>{address || '-'}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.shipping_info.method')}>{shippingMethodLabel}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.shipping_info.sent_at')}>{formatLocalDate(shippingDate)}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.shipping_info.status')}>{shippingStatus}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.shipping_info.message')}>{deliveryMessage || '-'}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.shipping_info.memo')}>{shipping.message_custom || shipping.shipping_memo || '-'}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.shipping_info.invoice_number')}>{shipping.invoice_number || '-'}</OrderInfoRow>
    </OrderInfoCard>
  );
}
