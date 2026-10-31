'use client';

import { useDirectShippingListQuery } from '@/apis/customer-service/direct-shipping/direct-shipping.query';
import { DirectShippingListREQ, DirectShippingSearchBy } from '@/apis/customer-service/direct-shipping/direct-shipping.request';
import { PAGINATION } from '@/constants/common';
import { useDebounce } from '@/hooks';
import { PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import PageTitle from '../components/PageTitle';
import { DirectDeliveryRequestFilter } from './DirectDeliveryRequestFilter';
import { DirectDeliveryRequestFilterModal } from './DirectDeliveryRequestFilterModal';
import { DirectDeliveryRequestInformation } from './DirectDeliveryRequestInformation';
import { DirectDeliveryRequestListCard } from './DirectDeliveryRequestListCard';
import { DirectDeliveryRequestListTable } from './DirectDeliveryRequestListTable';

export const DirectDeliveryRequestManagement = () => {
  const t = useTranslations();
  const [selectValue, setSelectValue] = useState<DirectShippingSearchBy | ''>('entire');
  const [searchValue, setSearchValue] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGINATION.DEFAULT_PAGE_INDEX,
    pageSize: 15,
  });

  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    // Keep the list on the first page whenever the filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPagination((prev) =>
      prev.pageIndex === PAGINATION.DEFAULT_PAGE_INDEX ? prev : { ...prev, pageIndex: PAGINATION.DEFAULT_PAGE_INDEX },
    );
  }, [debouncedSearch, selectValue]);

  const handleSelectChange = (value: string | number) => {
    setSelectValue(value as DirectShippingSearchBy | '');
    setSearchValue('');
  };

  const listParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: selectValue === 'status' ? undefined : debouncedSearch || undefined,
      search_by: selectValue || undefined,
      status: selectValue === 'status' ? (debouncedSearch as DirectShippingListREQ['status']) || undefined : undefined,
    }),
    [debouncedSearch, pagination.pageIndex, pagination.pageSize, selectValue],
  );

  const { data, isLoading } = useDirectShippingListQuery(listParams);
  const totalPage = Math.max(data?.pagination?.total_page ?? 1, 1);
  const list = data?.list ?? [];

  return (
    <main className='relative -mt-4 w-full space-y-4 md:mt-0 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.delivery_request')}
        extra={
          <DirectDeliveryRequestFilterModal
            selectValue={selectValue}
            searchValue={searchValue}
            onSelectChange={handleSelectChange}
            onSearchChange={setSearchValue}
          />
        }
      />
      <DirectDeliveryRequestFilter
        selectValue={selectValue}
        searchValue={searchValue}
        onSelectChange={handleSelectChange}
        onSearchChange={setSearchValue}
      />
      {/* <DirectDeliveryRequestInformation /> */}
      <DirectDeliveryRequestListTable
        data={list}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        totalPage={totalPage}
      />
      <DirectDeliveryRequestListCard data={list} />
    </main>
  );
};
