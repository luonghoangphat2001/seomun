'use client';

import { QuoteInquiryApi } from '@/apis/my/quote-inquiry/quote-inquiry.api';
import {
  normalizeQuoteInquiryListREQ,
  transformQuoteInquiryRESPToPaymentInquiryItem,
} from '@/apis/my/quote-inquiry/quote-inquiry.service';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { InquiryDateRangeFilterTab } from '@/enums/inquiry';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { SelectOption, TabOption } from '@/components/common';
import PageTitle from '../components/PageTitle';
import { PaymentInquiryFilter } from './PaymentInquiryFilter';
import { PaymentInquiryFilterModal } from './PaymentInquiryFilterModal';
import { PaymentInquiryListCard } from './PaymentInquiryListCard';
import { PaymentInquiryListTable } from './PaymentInquiryListTable';

const getDateRangeByTab = (value: string): DateRange | undefined => {
  const today = new Date();

  switch (value) {
    case InquiryDateRangeFilterTab.ONE_WEEK:
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case InquiryDateRangeFilterTab.ONE_MONTH:
      return { from: startOfDay(subMonths(today, 1)), to: endOfDay(today) };
    case InquiryDateRangeFilterTab.THREE_MONTHS:
      return { from: startOfDay(subMonths(today, 3)), to: endOfDay(today) };
    case InquiryDateRangeFilterTab.SIX_MONTHS:
      return { from: startOfDay(subMonths(today, 6)), to: endOfDay(today) };
    default:
      return undefined;
  }
};

export const PaymentInquiryManagement = () => {
  const t = useTranslations();
  const [selectValue, setSelectValue] = useState<string | number>('');
  const [tab, setTab] = useState<string>(InquiryDateRangeFilterTab.SIX_MONTHS);
  const [searchValue, setSearchValue] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    getDateRangeByTab(InquiryDateRangeFilterTab.SIX_MONTHS),
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGINATION.DEFAULT_PAGE_INDEX,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  const tabOptions = useMemo(
    () =>
      Object.values(InquiryDateRangeFilterTab).map((item) => ({
        value: item,
        label: t(`filter.${item}`),
      })),
    [t],
  );

  const statusOptions = useMemo<SelectOption[]>(
    () => [
      { value: '', label: t('common.entire') },
      { value: 'pending', label: t('inquiry.checking') },
      { value: 'responded', label: t('inquiry.answered') },
    ],
    [t],
  );

  const handleTabChange = (value: string) => {
    setTab(value);
    setDateRange(getDateRangeByTab(value));
  };

  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPagination((prev) =>
      prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: PAGINATION.DEFAULT_PAGE_INDEX },
    );
  }, [debouncedSearch, selectValue, dateRange?.from, dateRange?.to]);

  const queryParams = useMemo(
    () =>
      normalizeQuoteInquiryListREQ({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        category: 'payment',
        search: debouncedSearch || undefined,
        status: selectValue ? String(selectValue) : undefined,
        created_from: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
        created_to: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
      }),
    [debouncedSearch, dateRange, pagination.pageIndex, pagination.pageSize, selectValue],
  );

  const { data } = useQuery({
    queryKey: ['PAYMENT_INQUIRY_LIST', queryParams],
    queryFn: () => QuoteInquiryApi.list(queryParams),
    select: (resp) => ({
      list: resp.data.inquiries.map(transformQuoteInquiryRESPToPaymentInquiryItem),
      pagination: resp.pagination,
    }),
  });

  const paymentInquiries = data?.list || [];
  const totalPage = Math.max(data?.pagination?.total_page ?? 1, 1);
  const totalRecords = data?.pagination?.total_item ?? paymentInquiries.length;

  return (
    <main className='relative w-full space-y-4 md:mt-0 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.payment_inquiry')}
        extra={
          <PaymentInquiryFilterModal
            statusOptions={statusOptions}
            tabOptions={tabOptions}
            tab={tab}
            setTab={handleTabChange}
            selectValue={selectValue as string}
            searchValue={searchValue}
            onSelectChange={setSelectValue}
            onSearchChange={setSearchValue}
            dateRange={dateRange}
            onDateRange={setDateRange}
          />
        }
      />
      <PaymentInquiryFilter
        statusOptions={statusOptions}
        tabOptions={tabOptions}
        tab={tab}
        setTab={handleTabChange}
        selectValue={selectValue as string}
        searchValue={searchValue}
        onSelectChange={setSelectValue}
        onSearchChange={setSearchValue}
        dateRange={dateRange}
        onDateRange={setDateRange}
      />
      <PaymentInquiryListTable
        data={paymentInquiries}
        pagination={pagination}
        setPagination={setPagination}
        totalPage={totalPage}
        totalRecords={totalRecords}
      />
      <PaymentInquiryListCard data={paymentInquiries} />
    </main>
  );
};
