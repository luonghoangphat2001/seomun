import type { TFunction } from 'i18next';

import { PaymentMethod, PaymentStatus } from '../enums';

export function getPaymentMethodOptions(t: TFunction<'page'>) {
  return [
    { value: PaymentMethod.CARD, label: t('payments.list.payment_method.card', 'Card') },
    { value: PaymentMethod.TOSS, label: t('payments.list.payment_method.toss', 'Toss') },
    { value: PaymentMethod.VIRTUAL_ACCOUNT, label: t('payments.list.payment_method.virtual_account', 'Virtual Account') },
    { value: PaymentMethod.BANK_TRANSFER, label: t('payments.list.payment_method.bank_transfer', 'Virtual Account') },
    { value: PaymentMethod.PAYLATER, label: t('payments.list.payment_method.paylater', 'Pay Later') },
  ];
}

export function getPaymentStatusOptions(t: TFunction<'page'>) {
  return [
    { value: PaymentStatus.PENDING, label: t('payments.list.payment_status.pending', 'Pending') },
    { value: PaymentStatus.PAID, label: t('payments.list.payment_status.paid', 'Paid') },
    { value: PaymentStatus.CANCELLED, label: t('payments.list.payment_status.cancelled', 'Cancelled') },
    { value: PaymentStatus.FAILED, label: t('payments.list.payment_status.failed', 'Failed') },
    { value: PaymentStatus.REFUNDED, label: t('payments.list.payment_status.refunded', 'Refunded') },
    { value: PaymentStatus.PARTIALLY_REFUNDED, label: t('payments.list.payment_status.partially_refunded', 'Partially Refunded') },
  ];
}

export const PAYMENT_STATUS_LABEL: Partial<Record<PaymentStatus, (t: TFunction<'page'>) => string>> = {
  [PaymentStatus.PENDING]: (t) => t('payments.list.payment_status.pending'),
  [PaymentStatus.PAID]: (t) => t('payments.list.payment_status.paid'),
  [PaymentStatus.CANCELLED]: (t) => t('payments.list.payment_status.cancelled'),
  [PaymentStatus.FAILED]: (t) => t('payments.list.payment_status.failed'),
  [PaymentStatus.REFUNDED]: (t) => t('payments.list.payment_status.refunded'),
  [PaymentStatus.PARTIALLY_REFUNDED]: (t) => t('payments.list.payment_status.partially_refunded'),
};

export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
  partially_refunded: 'bg-yellow-100 text-yellow-800',
};

export const PAYMENT_METHOD_STYLES: Record<string, string> = {
  card: 'bg-blue-100 text-blue-800',
  toss: 'bg-sky-100 text-sky-800',
  virtual_account: 'bg-teal-100 text-teal-800',
  bank_transfer: 'bg-indigo-100 text-indigo-800',
  paylater: 'bg-purple-100 text-purple-800',
};
