'use client';

import { useQuoteInquiryListQuery } from '@/apis/my/quote-inquiry/quote-inquiry.query';
import { DATE_FORMAT } from '@/constants/common';
import { SelectOption, TabOption } from '@/components/common';
import { InquiryDateRangeFilterTab } from '@/enums/inquiry';
import { PAGINATION } from '@/constants/common';
import { formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import PageTitle from '../components/PageTitle';
import { ProductInquiryFilter } from './ProductInquiryFilter';
import { ProductInquiryFilterModal } from './ProductInquiryFilterModal';
import { ProductInquiryListCard } from './ProductInquiryListCard';
import { ProductInquiryListTable } from './ProductInquiryListTable';
import { PaginationState } from '@tanstack/react-table';

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

export const ProductInquiryManagement = () => {
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
  };

  const debouncedSearch = useDebounce(searchValue, 300);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPagination((prev) =>
      prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: PAGINATION.DEFAULT_PAGE_INDEX },
    );
  }, [debouncedSearch, selectValue, dateRange?.from, dateRange?.to]);

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      category: 'product',
      search: debouncedSearch || undefined,
      status: selectValue ? String(selectValue) : undefined,
      created_from: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
      created_to: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
    }),
    [debouncedSearch, dateRange, pagination.pageIndex, pagination.pageSize, selectValue],
  );

  const { data } = useQuoteInquiryListQuery(queryParams);
  const productInquiries = data?.list || [];
  const totalPage = Math.max(data?.pagination?.total_page ?? 1, 1);
  const totalRecords = data?.pagination?.total_item ?? productInquiries.length;

  return (
    <main className='relative w-full space-y-4 md:mt-0 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.product_inquiry')}
        extra={
          <ProductInquiryFilterModal
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
      <ProductInquiryFilter
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
      <ProductInquiryListTable
        data={productInquiries}
        pagination={pagination}
        setPagination={setPagination}
        totalPage={totalPage}
        totalRecords={totalRecords}
      />
      <ProductInquiryListCard data={productInquiries} />
    </main>
  );
};
