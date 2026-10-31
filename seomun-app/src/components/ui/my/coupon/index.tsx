'use client';

import { CouponListREQ } from '@/apis/my/coupon/coupon.request';
import { useCouponListQuery } from '@/apis/my/coupon/coupon.query';
import { PAGINATION } from '@/constants/common';
import { CouponStatus } from '@/enums/common';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import PageTitle from '../components/PageTitle';
import CouponFilter from './CouponFilter';
import CouponFilterModal from './CouponFilterModal';
import CouponListCard from './CouponListCard';
import CouponListTable from './CouponListTable';

const MyCoupon = () => {
  const t = useTranslations();
  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<CouponListREQ>({
    getInitialFilter: (params) => ({
      page: Number(params.get('page')) || PAGINATION.DEFAULT_PAGE,
      per_page: Number(params.get('per_page')) || PAGINATION.DEFAULT_PAGE_SIZE,
      status: (params.get('status') as CouponStatus) || undefined,
    }),
  });
  const [mobileFilter, setMobileFilter] = useState<CouponListREQ>({
    page: PAGINATION.DEFAULT_PAGE,
    per_page: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  const { data: couponData, isLoading } = useCouponListQuery(filter);

  return (
    <main className='space-y-4 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.coupon')}
        extra={<CouponFilterModal filter={mobileFilter} setMobileFilter={setMobileFilter} />}
      />
      <CouponFilter filter={filter} handleFilterChange={handleFilterChange} />
      <CouponListTable
        data={couponData?.list ?? []}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
        totalPage={couponData?.pagination.total_page || 1}
        totalRecords={couponData?.pagination.total_item || 0}
      />
      <CouponListCard filter={mobileFilter} />
    </main>
  );
};

export default MyCoupon;
