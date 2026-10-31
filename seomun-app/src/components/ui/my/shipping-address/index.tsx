'use client';

import { useTranslations } from 'next-intl';
import PageTitle from '../components/PageTitle';
import ShippingAddressFilter from './ShippingAddressFilter';
import ShippingAddressListTable from './ShippingAddressListTable';
import ShippingAddressListCard from './ShippingAddressListCard';
import { useState } from 'react';
import { RowSelectionState } from '@tanstack/react-table';
// import { SHIPPING_ADDRESS_FILTER_OPTIONS } from '@/constants/shipping-address';
import { useShippingAddressListQuery } from '@/apis/my/shipping-address/shipping-address.query';
import { ShippingAddressListREQ } from '@/apis/my/shipping-address/shipping-address.request';
import { getInitFilterShippingAddress } from '@/apis/my/shipping-address/shipping-address.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import ShippingAddressFilterModal from './ShippingAddressFilterModal';
// import { ShippingAddressFilterOptions } from '@/enums/shipping-address';
import { PAGINATION } from '@/constants/common';

const MyShippingAddress = () => {
  const t = useTranslations();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Search type dropdown removed: search without search_type so BE searches all fields.
  // const filterOptions = useMemo(
  //   () => SHIPPING_ADDRESS_FILTER_OPTIONS.map((option) => ({ ...option, label: t(option.label) })),
  //   [t],
  // );

  //desktop table filter
  const { filter, debouncedFilter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<ShippingAddressListREQ>(
    {
      getInitialFilter: getInitFilterShippingAddress,
    },
  );

  //mobile filter
  const [mobileFilter, setMobileFilter] = useState<ShippingAddressListREQ>({
    search: '',
    // search_type: ShippingAddressFilterOptions.SHIPPING_ADDRESS,
    page: PAGINATION.DEFAULT_PAGE,
    per_page: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  //api list
  const { data: dataShippingAddress, isLoading } = useShippingAddressListQuery(debouncedFilter);

  const resetRowSelection = () => {
    setRowSelection({});
  };

  return (
    <main className='product-order-form-mobile relative w-full space-y-4 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.shipping_address_management')}
        extra={<ShippingAddressFilterModal filter={mobileFilter} setMobileFilter={setMobileFilter} />}
      />
      <ShippingAddressFilter
        filter={filter}
        handleFilterChange={handleFilterChange}
        rowSelection={rowSelection}
        resetRowSelection={resetRowSelection}
      />
      <ShippingAddressListTable
        data={dataShippingAddress?.list || []}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
        totalPage={dataShippingAddress?.pagination.total_page || 1}
        totalRecords={dataShippingAddress?.pagination.total_item || 0}
      />
      <ShippingAddressListCard rowSelection={rowSelection} setRowSelection={setRowSelection} filter={mobileFilter} />
    </main>
  );
};

export default MyShippingAddress;
