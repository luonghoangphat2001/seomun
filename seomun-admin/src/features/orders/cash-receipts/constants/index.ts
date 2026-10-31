import type { TFunction } from 'i18next';

import { type OrderStatus } from '../../enums';
import { ORDER_STATUS_LABELS } from '../../constants';
import { CashReceiptIssueStatus, PaymentMethod } from '../enums';

export const CASH_RECEIPT_STATUS_STYLES: Record<CashReceiptIssueStatus, string> = {
  [CashReceiptIssueStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [CashReceiptIssueStatus.ISSUED]: 'bg-green-100 text-green-800',
  [CashReceiptIssueStatus.DELETED]: 'bg-gray-100 text-gray-700',
};

export function getCashReceiptIssueStatusOptions(t: TFunction<'page'>) {
  return [
    { value: CashReceiptIssueStatus.PENDING, label: t('orders.cash_receipts.status.pending') },
    { value: CashReceiptIssueStatus.ISSUED, label: t('orders.cash_receipts.status.issued') },
    { value: CashReceiptIssueStatus.DELETED, label: t('orders.cash_receipts.status.deleted') },
  ];
}

export function getCashReceiptIssueStatusLabel(status: CashReceiptIssueStatus, t: TFunction<'page'>) {
  return t(`orders.cash_receipts.status.${status}`, status);
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, (t: TFunction<'page'>) => string> = {
  [PaymentMethod.CARD]: (t) => t('orders.payment_method.card'),
  [PaymentMethod.VIRTUAL_ACCOUNT]: (t) => t('orders.payment_method.virtual_account'),
  [PaymentMethod.BANK_TRANSFER]: (t) => t('orders.payment_method.bank_transfer'),
  [PaymentMethod.TOSS]: (t) => t('orders.payment_method.toss'),
  [PaymentMethod.SEOMUN_PAY]: (t) => t('orders.payment_method.seomun_pay'),
  [PaymentMethod.PAYLATER]: (t) => t('orders.payment_method.paylater'),
  [PaymentMethod.DEDICATED_ACCOUNT]: (t) => t('orders.payment_method.dedicated_account'),
  [PaymentMethod.TAX_INVOICE]: (t) => t('orders.payment_method.tax_invoice'),
};

export function getPaymentMethodLabel(value: string, t: TFunction<'page'>): string {
  return PAYMENT_METHOD_LABELS[value as PaymentMethod]?.(t) ?? value;
}

export function getOrderStatusLabel(value: string, t: TFunction<'page'>): string {
  return ORDER_STATUS_LABELS[value as OrderStatus]?.(t) ?? value;
}
