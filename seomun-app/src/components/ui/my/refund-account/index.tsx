'use client';

import { useMyAccountHistoriesQuery, useMyAccountQuery } from '@/apis/my/account/account.query';
import { BANK_CODE_TO_BANK, BANK_OPTIONS } from '@/constants/dedicated-account';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { BANK } from '@/enums/dedicated-account';
import { RefundAccountFilterTabs } from '@/enums/refund-account';
import { useAuthStore } from '@/hooks';
import Loading from '@/components/common/loading';
import { Button, ModalHandle } from '@/components/common';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import PageTitle from '../components/PageTitle';
import { useMemo, useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';
import RefundAccountListTable from './RefundAccountListTable';
import RefundAccountFilter from './RefundAccountFilter';
import RefundAccountListCard from './RefundAccountListCard';
import RefundAccountFilterModal from './RefundAccountFilterModal';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { PaginationState } from '@tanstack/react-table';
import { RefundAccount } from '@/types/refund-account';
import { ChangeRefundAccountModal } from './ChangeRefundAccountModal';
import CurrentAccountTable from './CurrentAccountTable';

const getDateRangeByTab = (value: string): DateRange | undefined => {
  const today = new Date();

  switch (value) {
    case RefundAccountFilterTabs.ONE_WEEK:
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case RefundAccountFilterTabs.ONE_MONTH:
      return { from: startOfDay(subMonths(today, 1)), to: endOfDay(today) };
    case RefundAccountFilterTabs.THREE_MONTHS:
      return { from: startOfDay(subMonths(today, 3)), to: endOfDay(today) };
    default:
      return { from: startOfDay(today), to: endOfDay(today) };
  }
};

const resolveBankKey = (bankCode?: string) => {
  if (!bankCode) return undefined;

  if (Object.values(BANK).includes(bankCode as BANK)) {
    return bankCode as BANK;
  }

  return BANK_CODE_TO_BANK[bankCode as keyof typeof BANK_CODE_TO_BANK];
};

const MyRefundAccount = () => {
  const t = useTranslations();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [periodTab, setPeriodTab] = useState<string>(RefundAccountFilterTabs.TODAY);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getDateRangeByTab(RefundAccountFilterTabs.TODAY));
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGINATION.DEFAULT_PAGE_INDEX,
    pageSize: 15,
  });

  const periodTabs = useMemo(() => {
    return Object.values(RefundAccountFilterTabs).map((value) => ({
      label: t(`filter.${value}`),
      value,
    }));
  }, [t]);

  const { data: account, isLoading: isLoadingAccount } = useMyAccountQuery({
    enabled: isHydrated && isAuthenticated,
  });
  const changeRefundAccountModalRef = useRef<ModalHandle>(null);

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      start_date: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
      end_date: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
    }),
    [dateRange, pagination.pageIndex, pagination.pageSize],
  );

  const { data: historiesData, isLoading: isLoadingHistories } = useMyAccountHistoriesQuery(queryParams, {
    enabled: isHydrated && isAuthenticated,
  });

  const refundAccounts = useMemo<RefundAccount[]>(
    () =>
      historiesData?.histories.map((item) => {
        const bank = resolveBankKey(item.bank_code) ?? BANK.IBK;

        return {
          id: item.id,
          settlementDate: formatDate(item.settlement_date, DATE_FORMAT.DATE_WITH_DOT),
          refundAmount: item.refund_amount,
          accountHolder: item.account_holder,
          bankCode: item.bank_code,
          bankName: t(`bank.${bank}`),
          accountNumber: item.account_number,
          depositDate: formatDate(item.deposit_date, DATE_FORMAT.DATE_WITH_DOT),
          status: item.status,
        };
      }) ?? [],
    [historiesData?.histories, t],
  );

  const totalPage = Math.max(historiesData?.pagination?.total_page ?? 1, 1);
  const totalRecords = historiesData?.pagination?.total_item ?? refundAccounts.length;

  const notes = [
    t('my.refund_guide_1'),
    t('my.refund_guide_2'),
    t('my.refund_guide_3'),
    t('my.refund_guide_4'),
    t('my.refund_guide_5'),
    t('my.refund_guide_6'),
    t('my.refund_guide_7'),
  ];

  const currentBank = resolveBankKey(account?.bank_code);
  const currentBankImage = BANK_OPTIONS.find((bank) => bank.value === currentBank)?.image ?? BANK_OPTIONS[0].image;

  const openChangeRefundAccountModal = () => {
    changeRefundAccountModalRef.current?.open();
  };

  const handlePeriodTabChange = (value: string) => {
    setPeriodTab(value);
    setDateRange(getDateRangeByTab(value));
    setPagination((prev) => (prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: 0 }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPagination((prev) => (prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: 0 }));
  };

  if (!isHydrated || !isAuthenticated) return null;

  if (isLoadingAccount && !account) {
    return <Loading />;
  }

  return (
    <main className='space-y-4'>
      <PageTitle title={t('sidebar.items.refund_account_management')} />
      <div className='mobile-seperator'></div>
      <section className='border-border-soft space-y-3 rounded-2xl md:mt-6 md:space-y-5 md:border md:p-5'>
        <div className='flex items-center justify-between gap-3'>
          <p className='title-18'>{t('my.refund_account_currently_use')}</p>
          <Button variant='outline-primary' size='sm' onClick={openChangeRefundAccountModal}>
            {t('common.change')}
          </Button>
        </div>
        <div className='bg-border-soft hidden h-px md:block'></div>
        {account ? (
          <CurrentAccountTable account={account} bank={currentBank} bankImage={currentBankImage} />
        ) : (
          <p className='body-16 text-text-secondary py-8 text-center'>{t('common.no_data')}</p>
        )}
      </section>
      <ChangeRefundAccountModal ref={changeRefundAccountModalRef} account={account} />
      <div className='mobile-seperator'></div>
      <section className='border-border-soft space-y-5 rounded-2xl md:mt-8 md:border md:p-5'>
        <PageTitle
          title={
            <div className='flex flex-col gap-1 md:flex-row md:items-center md:gap-2'>
              <p className='title-18'>환불내역</p>
              <p className='body-14 text-text-secondary'>(환불금액은 정산일 기준입니다)</p>
            </div>
          }
          extra={
            <RefundAccountFilterModal
              periodTabs={periodTabs}
              periodTab={periodTab}
              setPeriodTab={handlePeriodTabChange}
              dateRange={dateRange}
              setDateRange={handleDateRangeChange}
            />
          }
        />
        <div className='bg-border-soft hidden h-px md:block'></div>
        <div className='space-y-4'>
          <RefundAccountFilter
            periodTabs={periodTabs}
            periodTab={periodTab}
            setPeriodTab={handlePeriodTabChange}
            dateRange={dateRange}
            setDateRange={handleDateRangeChange}
          />
          <RefundAccountListTable
            data={refundAccounts}
            pagination={pagination}
            setPagination={setPagination}
            totalPage={totalPage}
            totalRecords={totalRecords}
            isLoading={isLoadingHistories}
          />
          <RefundAccountListCard data={refundAccounts} />
        </div>
      </section>
      <div className='mobile-seperator'></div>
      <div className='md:bg-border-light rounded-lg md:mt-6 md:p-5'>
        <p className='title-16 md:title-18 md:text-text-secondary'>{t('product.user_guide')}</p>
        <ul className='md:text-text-secondary mt-2 list-disc space-y-2 pl-5 marker:text-[8px] md:mt-3 md:pl-6'>
          {notes.map((item, index) => (
            <li className='body-14 md:body-16' key={index}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default MyRefundAccount;
