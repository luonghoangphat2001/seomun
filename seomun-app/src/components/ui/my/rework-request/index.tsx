'use client';

import { QuoteInquiryApi } from '@/apis/my/quote-inquiry/quote-inquiry.api';
import {
  normalizeQuoteInquiryListREQ,
  transformQuoteInquiryRESPToReworkRequestItem,
} from '@/apis/my/quote-inquiry/quote-inquiry.service';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { InquiryDateRangeFilterTab } from '@/enums/inquiry';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import PageTitle from '../components/PageTitle';
import { ReworkRequestFilter } from './ReworkRequestFilter';
import { ReworkRequestFilterModal } from './ReworkRequestFilterModal';
import { ReworkRequestListCard } from './ReworkRequestListCard';
import { ReworkRequestListTable } from './ReworkRequestListTable';
import { SelectOption, TabOption } from '@/components/common';

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

export const ReworkRequestManagement = () => {
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

  const tabOptions = useMemo<TabOption[]>(
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
    setPagination((prev) => (prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: 0 }));
  };

  const debouncedSearch = useDebounce(searchValue, 300);

  const handleSelectChange = (value: string | number) => {
    setSelectValue(value);
    setPagination((prev) => (prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: 0 }));
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPagination((prev) => (prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: 0 }));
  };

  const handleDateRangeChange = (value: DateRange | undefined) => {
    setDateRange(value);
    setPagination((prev) => (prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: 0 }));
  };

  const queryParams = useMemo(
    () =>
      normalizeQuoteInquiryListREQ({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        category: 'rework',
        search: debouncedSearch || undefined,
        status: selectValue ? String(selectValue) : undefined,
        created_from: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
        created_to: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
      }),
    [debouncedSearch, dateRange, pagination.pageIndex, pagination.pageSize, selectValue],
  );

  const { data } = useQuery({
    queryKey: ['REWORK_REQUEST_LIST', queryParams],
    queryFn: () => QuoteInquiryApi.list(queryParams),
    select: (resp) => ({
      list: resp.data.inquiries.map(transformQuoteInquiryRESPToReworkRequestItem),
      pagination: resp.pagination,
    }),
  });

  const reworkRequests = data?.list || [];
  const totalPage = Math.max(data?.pagination?.total_page ?? 1, 1);
  const totalRecords = data?.pagination?.total_item ?? reworkRequests.length;

  return (
    <main className='relative w-full space-y-4 md:mt-0 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.rework_request')}
        extra={
          <ReworkRequestFilterModal
            statusOptions={statusOptions}
            tabOptions={tabOptions}
            tab={tab}
            setTab={handleTabChange}
            selectValue={selectValue as string}
            searchValue={searchValue}
            onSelectChange={handleSelectChange}
            onSearchChange={handleSearchChange}
            dateRange={dateRange}
            onDateRange={handleDateRangeChange}
          />
        }
      />
      <ReworkRequestFilter
        statusOptions={statusOptions}
        tabOptions={tabOptions}
        tab={tab}
        setTab={handleTabChange}
        selectValue={selectValue as string}
        searchValue={searchValue}
        onSelectChange={handleSelectChange}
        onSearchChange={handleSearchChange}
        dateRange={dateRange}
        onDateRange={handleDateRangeChange}
      />
      <ReworkRequestListTable
        data={reworkRequests}
        pagination={pagination}
        setPagination={setPagination}
        totalPage={totalPage}
        totalRecords={totalRecords}
      />
      <ReworkRequestListCard data={reworkRequests} />
    </main>
  );
};
