import { DUMMY_ORDERS } from '@/components/ui/my/mock/order';
import { MEMBERSHIP_LEVELS } from '@/constants/my';
import { OrderHistoryStatus, OrderStatus } from '@/enums/order';
import { DailyTransaction } from '@/types/transaction-history';
import { FieldErrors, FieldValues } from 'react-hook-form';

export function getCurrentMembershipLevel(money: number) {
  const index = MEMBERSHIP_LEVELS.findIndex((tier, i) => {
    const next = MEMBERSHIP_LEVELS[i + 1];
    return !next || money < next.min;
  });

  return {
    currentIndex: index,
    currentLevel: MEMBERSHIP_LEVELS[index],
    nextLevel: MEMBERSHIP_LEVELS[index + 1],
    isMaxLevel: index === MEMBERSHIP_LEVELS.length - 1,
  };
}

export const getFormErrorMessage = <T extends FieldValues>(errors: FieldErrors<T>, path: string): string | undefined => {
  const field = path.split('.').reduce<unknown>((o, key) => {
    if (typeof o === 'object' && o !== null && key in o) {
      return (o as Record<string, unknown>)[key];
    }
    return undefined;
  }, errors);

  if (
    typeof field === 'object' &&
    field !== null &&
    'message' in field &&
    typeof (field as { message?: unknown }).message === 'string'
  ) {
    return (field as { message: string }).message;
  }

  return undefined;
};

export const sumValueInTransaction = (arr: DailyTransaction[], key: keyof DailyTransaction) => {
  return arr.reduce((acc, cur) => {
    const value = cur[key];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
};

export const getTransactionTotalAmount = (transaction: DailyTransaction) =>
  transaction.orderAmount + (transaction.shippingFee ?? 0) - (transaction.discountAmount ?? 0);

export const getTransactionVat = (transaction: DailyTransaction) => Math.round(transaction.supplyAmount * 0.1);

export const getMonthTotalInTransaction = (days: DailyTransaction[]) => ({
  orderAmount: sumValueInTransaction(days, 'orderAmount'),
  shippingFee: sumValueInTransaction(days, 'shippingFee'),
  discountAmount: sumValueInTransaction(days, 'discountAmount'),
  totalAmount: days.reduce((total, transaction) => total + getTransactionTotalAmount(transaction), 0),
  supplyAmount: sumValueInTransaction(days, 'supplyAmount'),
  vat: days.reduce((total, transaction) => total + getTransactionVat(transaction), 0),
  depositAmount: sumValueInTransaction(days, 'depositAmount'),
  depositSettlement: sumValueInTransaction(days, 'depositSettlement'),
  balance: sumValueInTransaction(days, 'balance'),
  outStandingAmount: sumValueInTransaction(days, 'outStandingAmount'),
  refund: sumValueInTransaction(days, 'refund'),
});

export const getDummyOrderStatus = (orderNumber: string) => {
  const order = DUMMY_ORDERS.find((item) => item.orderNumber === orderNumber);
  const status = order?.orderStatus;

  switch (status) {
    case OrderStatus.RECEIPT_PENDING:
      return OrderHistoryStatus.PENDING_RECEPTION;
    case OrderStatus.FILE_ERROR:
    case OrderStatus.PROOFREADING_PENDING:
      return OrderHistoryStatus.PENDING_CORRECTION;
    case OrderStatus.REPRESS:
      return OrderHistoryStatus.TYPESETTING;
    case OrderStatus.PUBLICATION:
      return OrderHistoryStatus.OUTPUT_OF_POWER;
    case OrderStatus.PRINTING:
      return OrderHistoryStatus.PRINT;
    case OrderStatus.FINISHING:
      return OrderHistoryStatus.POST_PROCESSING;
    case OrderStatus.PRODUCTION_COMPLETE:
      return OrderHistoryStatus.PRODUCTION_DONE;
    default:
      return OrderHistoryStatus.AWAITING_PAYMENT;
  }
};

export const getRowNumberInTable = (totalItems: number, pageIndex: number, pageSize: number, rowIndex: number) => {
  return totalItems - pageIndex * pageSize - rowIndex;
};

export const fillNumber = (value: number, length = 4) => {
  return value.toString().padStart(length, '0');
};

export const copyCurrentUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);

    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);

    return false;
  }
};

export function formatDeliveryDate(
  dayNumber: number,
  format: 'long' | 'short' = 'long',
  baseDate: string | Date = new Date(),
): string {
  const date = new Date(baseDate);

  // Nếu dayNumber = 1 => hôm nay
  date.setDate(date.getDate() + dayNumber - 1);

  const month = date.getMonth() + 1;
  const day = date.getDate();

  const weekdays =
    format === 'short'
      ? ['일', '월', '화', '수', '목', '금', '토']
      : ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  const weekday = weekdays[date.getDay()];

  if (format === 'short') {
    return `${month}/${day}(${weekday})`;
  }

  return `${month}월 ${day}일 ${weekday}`;
}
