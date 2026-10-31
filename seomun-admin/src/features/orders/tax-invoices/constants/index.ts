import type { TFunction } from 'i18next';

import { OrderStatus, PaymentMethod, TaxInvoiceIssueStatus } from '../enums';

export const TAX_INVOICE_STATUS_STYLES: Record<TaxInvoiceIssueStatus, string> = {
  [TaxInvoiceIssueStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [TaxInvoiceIssueStatus.ISSUED]: 'bg-green-100 text-green-800',
  [TaxInvoiceIssueStatus.DELETED]: 'bg-gray-100 text-gray-700',
};

export function getTaxInvoiceIssueStatusOptions(t: TFunction<'page'>) {
  return [
    { value: TaxInvoiceIssueStatus.PENDING, label: t('orders.tax_invoices.status.pending') },
    { value: TaxInvoiceIssueStatus.ISSUED, label: t('orders.tax_invoices.status.issued') },
    { value: TaxInvoiceIssueStatus.DELETED, label: t('orders.tax_invoices.status.deleted') },
  ];
}

export function getTaxInvoiceIssueStatusLabel(status: TaxInvoiceIssueStatus, t: TFunction<'page'>) {
  return t(`orders.tax_invoices.status.${status}`, status);
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

export const ORDER_STATUS_LABELS: Record<OrderStatus, (t: TFunction<'page'>) => string> = {
  [OrderStatus.DRAFT]: (t) => t('orders.status.draft'),
  [OrderStatus.PENDING]: (t) => t('orders.status.pending'),
  [OrderStatus.AWAITING_PAYMENT]: (t) => t('orders.status.awaiting_payment'),
  [OrderStatus.CONFIRMED]: (t) => t('orders.status.confirmed'),
  [OrderStatus.PURCHASE_CONFIRMED]: (t) => t('orders.status.purchase_confirmed'),
  [OrderStatus.PREPARING]: (t) => t('orders.status.preparing'),
  [OrderStatus.IN_PRODUCTION]: (t) => t('orders.status.in_production'),
  [OrderStatus.POST_PROCESSING]: (t) => t('orders.status.post_processing'),
  [OrderStatus.READY_TO_SHIP]: (t) => t('orders.status.ready_to_ship'),
  [OrderStatus.SHIPPING]: (t) => t('orders.status.shipping'),
  [OrderStatus.SHIPPED]: (t) => t('orders.status.shipped'),
  [OrderStatus.DELIVERY_COMPLETED]: (t) => t('orders.status.delivery_completed'),
  [OrderStatus.COMPLETED]: (t) => t('orders.status.completed'),
  [OrderStatus.DESIGN_IN_PROGRESS]: (t) => t('orders.status.design_in_progress'),
  [OrderStatus.DESIGN_CONFIRMATION_REQUESTED]: (t) => t('orders.status.design_confirmation_requested'),
  [OrderStatus.DESIGN_CONFIRMED]: (t) => t('orders.status.design_confirmed'),
  [OrderStatus.DESIGN_REJECTED]: (t) => t('orders.status.design_rejected'),
  [OrderStatus.CANCELLED]: (t) => t('orders.status.cancelled'),
  [OrderStatus.REFUND_REQUESTED]: (t) => t('orders.status.refund_requested'),
  [OrderStatus.REFUND_COMPLETED]: (t) => t('orders.status.refund_completed'),
};

export function getPaymentMethodLabel(value: string, t: TFunction<'page'>): string {
  return PAYMENT_METHOD_LABELS[value as PaymentMethod]?.(t) ?? value;
}

export function getOrderStatusLabel(value: string, t: TFunction<'page'>): string {
  return ORDER_STATUS_LABELS[value as OrderStatus]?.(t) ?? value;
}
