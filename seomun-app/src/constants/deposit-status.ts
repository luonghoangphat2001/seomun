import { DepositStatusPeriod } from '@/enums/deposit-status';
import { DepositStatus } from '@/types/deposit-status';

export const DEPOSIT_STATUS_MOCKS: DepositStatus[] = [
  { id: 1, method: '대구', date: '2025.09.24', amount: 0, depositor: '하나김진석', order_number: 'MOCK-1' },
  { id: 2, method: '대구', date: '2025.09.24', amount: 0, depositor: '하나김진석', order_number: 'MOCK-2' },
  { id: 3, method: '대구', date: '2025.09.24', amount: 0, depositor: '하나김진석', order_number: 'MOCK-3' },
  { id: 4, method: '대구', date: '2025.09.24', amount: 0, depositor: '하나김진석', order_number: 'MOCK-4' },
  { id: 5, method: '대구', date: '2025.09.24', amount: 0, depositor: '하나김진석', order_number: 'MOCK-5' },
  { id: 6, method: '대구', date: '2025.09.24', amount: 0, depositor: '하나김진석', order_number: 'MOCK-6' },
  { id: 7, method: '대구', date: '2025.09.24', amount: 0, depositor: '하나김진석', order_number: 'MOCK-7' },
];

export const DEPOSIT_STATUS_PERIOD_TABS = [
  { label: 'filter.ONE_WEEK', value: DepositStatusPeriod.ONE_WEEK },
  { label: 'filter.ONE_MONTH', value: DepositStatusPeriod.ONE_MONTH },
  { label: 'filter.THREE_MONTHS', value: DepositStatusPeriod.THREE_MONTHS },
  { label: 'filter.SIX_MONTHS', value: DepositStatusPeriod.SIX_MONTHS },
];

export const SAVED_OPTION_PERIOD_TABS = [
  ...DEPOSIT_STATUS_PERIOD_TABS,
  { label: 'filter.ONE_YEAR', value: DepositStatusPeriod.ONE_YEAR },
];
