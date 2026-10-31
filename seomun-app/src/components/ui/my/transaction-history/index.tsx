'use client';

import { useTranslations } from 'next-intl';
import PageTitle from '../components/PageTitle';
import TransactionHistoryFilter from './TransactionHistoryFilter';
import { useMemo, useState } from 'react';
import { DepositStatusPeriod } from '@/enums/deposit-status';
import { DateRange } from 'react-day-picker';
import { DEPOSIT_STATUS_PERIOD_TABS } from '@/constants/deposit-status';
import TransactionHistoryTable from './TransactionHistoryTable';
import TransactionHistoryFilterModal from './TransactionHistoryFilterModal';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { DATE_FORMAT } from '@/constants/common';
import { formatDate } from '@/lib/utils';
import { useTransactionHistoryListQuery } from '@/apis/my/transaction-history/transaction-history.query';
import { TransactionHistory } from '@/types/transaction-history';
import { useDebounce } from '@/hooks';

const TRANSACTION_HISTORY_MONTHS_MAP: Record<string, 1 | 3 | 6> = {
  [DepositStatusPeriod.ONE_WEEK]: 1,
  [DepositStatusPeriod.ONE_MONTH]: 1,
  [DepositStatusPeriod.THREE_MONTHS]: 3,
  [DepositStatusPeriod.SIX_MONTHS]: 6,
};

const getSupplyAmount = (totalAmount: number) => Math.round(totalAmount / 1.1);

const toOptionalAmount = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '' || value === '-') return null;

  const amount = Number(typeof value === 'string' ? value.replaceAll(',', '') : value);

  return Number.isFinite(amount) ? amount : null;
};

const MyTransactionHistory = () => {
  const t = useTranslations();
  function getDateRangeByTab(value: string): DateRange | undefined {
    const today = new Date();

    switch (value) {
      case DepositStatusPeriod.ONE_WEEK:
        return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
      case DepositStatusPeriod.ONE_MONTH:
        return { from: startOfDay(subMonths(today, 1)), to: endOfDay(today) };
      case DepositStatusPeriod.THREE_MONTHS:
        return { from: startOfDay(subMonths(today, 3)), to: endOfDay(today) };
      case DepositStatusPeriod.SIX_MONTHS:
        return { from: startOfDay(subMonths(today, 6)), to: endOfDay(today) };
      default:
        return undefined;
    }
  }

  const [tab, setTab] = useState<string>(DepositStatusPeriod.SIX_MONTHS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getDateRangeByTab(DepositStatusPeriod.SIX_MONTHS));
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  const periodTabs = useMemo(() => DEPOSIT_STATUS_PERIOD_TABS.map((option) => ({ ...option, label: t(option.label) })), [t]);

  const handleTabChange = (value: string) => {
    setTab(value);
    setDateRange(getDateRangeByTab(value));
  };

  const handleDateRangeChange = (range?: DateRange) => {
    setDateRange(range);
  };

  const queryParams = {
    search: debouncedSearch.trim() || undefined,
    ...(dateRange?.from || dateRange?.to
      ? {
          start_date: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
          end_date: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
        }
      : {
          months: TRANSACTION_HISTORY_MONTHS_MAP[tab],
        }),
  };

  const { data: transactionHistoryResp, isFetching } = useTransactionHistoryListQuery(queryParams);

  const transactionHistoryData: TransactionHistory[] = useMemo(
    () =>
      (transactionHistoryResp?.items ?? []).map((month) => ({
        month: month.month,
        days: month.days.map((day) => {
          const orderAmount = toOptionalAmount(day.order_amount) ?? 0;
          const shippingFee = toOptionalAmount(day.shipping_fee);
          const discountAmount = toOptionalAmount(day.point_used);
          const totalAmount = orderAmount + (shippingFee ?? 0) - (discountAmount ?? 0);

          return {
            day: day.day,
            orderAmount,
            shippingFee,
            discountAmount,
            supplyAmount: getSupplyAmount(totalAmount),
            depositAmount: toOptionalAmount(day.billed_amount) ?? 0,
            depositSettlement: toOptionalAmount(day.paid_amount) ?? 0,
            balance: toOptionalAmount(day.prepaid),
            outStandingAmount: toOptionalAmount(day.unpaid_amount),
            refund: toOptionalAmount(day.refund_amount),
          };
        }),
      })),
    [transactionHistoryResp?.items],
  );

  return (
    <main className='space-y-6'>
      <PageTitle
        title={t('sidebar.items.transaction_history')}
        extra={
          <TransactionHistoryFilterModal
            periodTabs={periodTabs}
            tab={tab}
            setTab={handleTabChange}
            dateRange={dateRange}
            setDateRange={handleDateRangeChange}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
        }
      />
      <TransactionHistoryFilter
        periodTabs={periodTabs}
        tab={tab}
        setTab={handleTabChange}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <TransactionHistoryTable data={transactionHistoryData} isLoading={isFetching} />
    </main>
  );
};

export default MyTransactionHistory;
