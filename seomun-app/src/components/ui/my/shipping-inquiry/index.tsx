'use client';

import { QuoteInquiryApi } from '@/apis/my/quote-inquiry/quote-inquiry.api';
import { normalizeQuoteInquiryListREQ } from '@/apis/my/quote-inquiry/quote-inquiry.service';
import { QuoteInquiryRESP } from '@/apis/my/quote-inquiry/quote-inquiry.response';
import { DATE_FORMAT } from '@/constants/common';
import { SelectOption, TabOption } from '@/components/common';
import { InquiryDateRangeFilterTab } from '@/enums/inquiry';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import PageTitle from '../components/PageTitle';
import { ShippingInquiryFilter } from './ShippingInquiryFilter';
import { ShippingInquiryFilterModal } from './ShippingInquiryFilterModal';
import { ShippingInquiryListCard } from './ShippingInquiryListCard';
import { ShippingInquiryListTable } from './ShippingInquiryListTable';
import { PAGINATION } from '@/constants/common';
import { ShippingInquiry } from '@/types/inquiry';
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

const transformShippingInquiryRESPToListItem = (resp: QuoteInquiryRESP): ShippingInquiry => {
  const hasReply = resp.comments.length > 0;
  const firstAttachment = resp.attachments[0];

  return {
    id: resp.id,
    createdAt: formatDate(resp.created_at, DATE_FORMAT.DEFAULT),
    order: resp.order_number ?? resp.category_label,
    title: resp.title,
    isReply: hasReply,
    manager: resp.manager_name || '-',
    phone: resp.contact,
    attachment: resp.attachments.length > 0,
    attachmentUrl: firstAttachment?.file_url || firstAttachment?.file_path,
  };
};

export const ShippingInquiryManagement = () => {
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
    () =>
      normalizeQuoteInquiryListREQ({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        category: 'shipping',
        search: debouncedSearch || undefined,
        status: selectValue ? String(selectValue) : undefined,
        created_from: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
        created_to: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
      }),
    [debouncedSearch, dateRange, pagination.pageIndex, pagination.pageSize, selectValue],
  );

  const { data } = useQuery({
    queryKey: ['SHIPPING_INQUIRY_LIST', queryParams],
    queryFn: () => QuoteInquiryApi.list(queryParams),
    select: (resp) => ({
      list: resp.data.inquiries.map(transformShippingInquiryRESPToListItem),
      pagination: resp.pagination,
    }),
  });

  const shippingInquiries = data?.list || [];
  const totalPage = Math.max(data?.pagination?.total_page ?? 1, 1);
  const totalRecords = data?.pagination?.total_item ?? shippingInquiries.length;

  return (
    <main className='relative w-full space-y-4 md:mt-0 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.shipping_inquiry')}
        extra={
          <ShippingInquiryFilterModal
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
      <ShippingInquiryFilter
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
      <ShippingInquiryListTable
        data={shippingInquiries}
        pagination={pagination}
        setPagination={setPagination}
        totalPage={totalPage}
        totalRecords={totalRecords}
      />
      <ShippingInquiryListCard data={shippingInquiries} />
    </main>
  );
};
