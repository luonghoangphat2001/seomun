import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';

import { Bank, OrderShippingMethod, OrderStatus, PaymentMethod } from '../enums';

export const ORDER_STATUS_LABELS: Record<OrderStatus, (t: TFunction<'page'>) => string> = {
  [OrderStatus.DRAFT]: (t) => t('orders.status.draft'),
  [OrderStatus.PENDING]: (t) => t('orders.status.pending'),
  [OrderStatus.AWAITING_PAYMENT]: (t) => t('orders.status.awaiting_payment'),
  [OrderStatus.CONFIRMED]: (t) => t('orders.status.confirmed'),
  [OrderStatus.PURCHASE_CONFIRMED]: (t) => t('orders.status.purchase_confirmed'),
  [OrderStatus.PENDING_RECEPTION]: (t) => t('orders.status.pending_reception'),
  [OrderStatus.FILE_ERROR]: (t) => t('orders.status.file_error'),
  [OrderStatus.PENDING_CORRECTION]: (t) => t('orders.status.pending_correction'),
  [OrderStatus.DESIGN_IN_PROGRESS]: (t) => t('orders.status.design_in_progress'),
  [OrderStatus.TYPESETTING]: (t) => t('orders.status.typesetting'),
  [OrderStatus.OUTPUT_OF_POWER]: (t) => t('orders.status.output_of_power'),
  [OrderStatus.PRINT]: (t) => t('orders.status.print'),
  [OrderStatus.POST_PROCESSING]: (t) => t('orders.status.post_processing'),
  [OrderStatus.PRODUCTION_DONE]: (t) => t('orders.status.production_done'),
  // [OrderStatus.DESIGN_IN_PROGRESS]: (t) => t('orders.status.design_in_progress'),
  [OrderStatus.READY_TO_SHIP]: (t) => t('orders.status.ready_to_ship'),
  [OrderStatus.SHIPPING]: (t) => t('orders.status.shipping'),
  [OrderStatus.SHIPPED]: (t) => t('orders.status.shipped'),
  [OrderStatus.DELIVERY_COMPLETED]: (t) => t('orders.status.delivery_completed'),
  [OrderStatus.COMPLETED]: (t) => t('orders.status.completed'),
  [OrderStatus.DESIGN_CONFIRMATION_REQUESTED]: (t) => t('orders.status.design_confirmation_requested'),
  [OrderStatus.DESIGN_CONFIRMED]: (t) => t('orders.status.design_confirmed'),
  [OrderStatus.DESIGN_REJECTED]: (t) => t('orders.status.design_rejected'),
  [OrderStatus.CANCELLED]: (t) => t('orders.status.cancelled'),
  [OrderStatus.REFUND_REQUESTED]: (t) => t('orders.status.refund_requested'),
  [OrderStatus.REFUND_COMPLETED]: (t) => t('orders.status.refund_completed'),
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'bg-gray-100 text-gray-600',
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.AWAITING_PAYMENT]: 'bg-amber-100 text-amber-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PURCHASE_CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PENDING_RECEPTION]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.FILE_ERROR]: 'bg-red-100 text-red-700',
  [OrderStatus.PENDING_CORRECTION]: 'bg-orange-100 text-orange-800',
  [OrderStatus.DESIGN_IN_PROGRESS]: 'bg-violet-100 text-violet-800',
  [OrderStatus.TYPESETTING]: 'bg-cyan-100 text-cyan-800',
  [OrderStatus.OUTPUT_OF_POWER]: 'bg-sky-100 text-sky-800',
  [OrderStatus.PRINT]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.POST_PROCESSING]: 'bg-teal-100 text-teal-800',
  [OrderStatus.PRODUCTION_DONE]: 'bg-emerald-100 text-emerald-800',
  // [OrderStatus.DESIGN_IN_PROGRESS]: 'bg-fuchsia-100 text-fuchsia-800',
  [OrderStatus.READY_TO_SHIP]: 'bg-emerald-100 text-emerald-800',
  [OrderStatus.SHIPPING]: 'bg-sky-100 text-sky-800',
  [OrderStatus.SHIPPED]: 'bg-green-100 text-green-800',
  [OrderStatus.DELIVERY_COMPLETED]: 'bg-green-100 text-green-800',
  [OrderStatus.COMPLETED]: 'bg-green-200 text-green-900',
  [OrderStatus.DESIGN_CONFIRMATION_REQUESTED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DESIGN_CONFIRMED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.DESIGN_REJECTED]: 'bg-orange-100 text-orange-800',
  [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  [OrderStatus.REFUND_REQUESTED]: 'bg-red-100 text-red-700',
  [OrderStatus.REFUND_COMPLETED]: 'bg-red-200 text-red-900',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, (t: TFunction<'page'>) => string> = {
  [PaymentMethod.CARD]: (t) => t('orders.payment_method.card'),
  [PaymentMethod.TOSS]: (t) => t('orders.payment_method.toss'),
  [PaymentMethod.SEOMUN_PAY]: (t) => t('orders.payment_method.seomun_pay'),
  [PaymentMethod.VIRTUAL_ACCOUNT]: (t) => t('orders.payment_method.virtual_account'),
  [PaymentMethod.BANK_TRANSFER]: (t) => t('orders.payment_method.bank_transfer'),
  [PaymentMethod.PAYLATER]: (t) => t('orders.payment_method.paylater'),
};

export const ORDER_SHIPPING_METHOD_LABELS: Record<OrderShippingMethod, (t: TFunction<'page'>) => string> = {
  [OrderShippingMethod.COURIER]: (t) => t('orders.detail.shipping_method.courier'),
  [OrderShippingMethod.QUICK]: (t) => t('orders.detail.shipping_method.quick'),
  [OrderShippingMethod.PICKUP]: (t) => t('orders.detail.shipping_method.pickup'),
  [OrderShippingMethod.DIRECT]: (t) => t('orders.detail.shipping_method.direct'),
};

/** Toss `virtual_account_bank` code → bank. Add new codes here as Toss adds banks. */
export const BANK_CODE_TO_BANK: Record<string, Bank> = {
  '03': Bank.IBK,
  '06': Bank.KOOKMIN,
  '11': Bank.NONGHYUP,
  '20': Bank.WOORI,
  '31': Bank.DAEGU,
  '32': Bank.BUSAN,
  '81': Bank.HANA,
  '88': Bank.SHINHAN,
};

export const BANK_LABELS: Record<Bank, (t: TFunction<'page'>) => string> = {
  [Bank.IBK]: (t) => t('orders.bank.ibk'),
  [Bank.KOOKMIN]: (t) => t('orders.bank.kookmin'),
  [Bank.NONGHYUP]: (t) => t('orders.bank.nonghyup'),
  [Bank.WOORI]: (t) => t('orders.bank.woori'),
  [Bank.DAEGU]: (t) => t('orders.bank.daegu'),
  [Bank.BUSAN]: (t) => t('orders.bank.busan'),
  [Bank.HANA]: (t) => t('orders.bank.hana'),
  [Bank.SHINHAN]: (t) => t('orders.bank.shinhan'),
};

export function getOrderStatusOptions(t: TFunction<'page'>): AppSelectOption<OrderStatus>[] {
  return Object.values(OrderStatus).map((value) => ({
    value,
    label: ORDER_STATUS_LABELS[value](t),
  }));
}

export function getPaymentMethodOptions(t: TFunction<'page'>): AppSelectOption<PaymentMethod>[] {
  return Object.values(PaymentMethod).map((value) => ({
    value,
    label: PAYMENT_METHOD_LABELS[value](t),
  }));
}
