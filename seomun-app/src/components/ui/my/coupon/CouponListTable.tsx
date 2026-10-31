'use client';

import { Coupon } from '@/apis/my/coupon/coupon.response';
import { MyDataTable, MyPagination } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { CouponStatus, CouponType } from '@/enums/common';
import { formatDate, formatNumber } from '@/lib/utils';
import { ColumnDef, getCoreRowModel, OnChangeFn, PaginationState, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import CouponDetailModal from './CouponDetailModal';

type CouponListTableProps = {
  data: Coupon[];
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  isLoading: boolean;
  totalPage: number;
  totalRecords: number;
};

export const getCouponDiscount = (coupon: Coupon['coupon']) =>
  coupon.discount_type === CouponType.PERCENTAGE
    ? `${formatNumber(coupon.discount_value)}%`
    : `${formatNumber(coupon.discount_value)}원`;

export const getCouponStatusClass = (status: CouponStatus) => {
  switch (status) {
    case CouponStatus.UPCOMING:
      return 'bg-yellow-50 text-yellow-700 font-medium';
    case CouponStatus.AVAILABLE:
      return 'bg-green-50 text-green-700 font-medium';
    case CouponStatus.USED:
      return 'bg-blue-50 text-blue-700 font-medium';
    case CouponStatus.EXPIRED:
      return 'bg-red-50 text-red-600 font-medium';
  }
};

export const getCouponStatusLabel = (t: ReturnType<typeof useTranslations>, status: CouponStatus) =>
  t(`my.coupon_status.${status}`);

const CouponListTable = ({ data, pagination, onPaginationChange, isLoading, totalPage, totalRecords }: CouponListTableProps) => {
  const t = useTranslations();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const columns: ColumnDef<Coupon>[] = [
    {
      header: t('my.coupon_number'),
      cell: ({ row }) => totalRecords - (pagination.pageIndex * pagination.pageSize + row.index),
      meta: { align: 'center', width: '80px' },
    },
    {
      header: t('my.coupon_name'),
      accessorKey: 'coupon.name',
      cell: ({ row }) => (
        <div className='space-y-0.5 truncate'>
          <p className='truncate'>{row.original.coupon.name}</p>
          <p className='caption-12 text-text-secondary truncate'>{row.original.coupon.code}</p>
        </div>
      ),
      meta: { width: '260px' },
    },
    {
      header: t('my.coupon_discount'),
      cell: ({ row }) => getCouponDiscount(row.original.coupon),
      meta: { align: 'right', width: '130px' },
    },
    {
      header: t('my.coupon_valid_from'),
      cell: ({ row }) => formatDate(row.original.coupon.starts_at, DATE_FORMAT.DEFAULT),
      meta: { align: 'center', width: '130px' },
    },
    {
      header: t('my.coupon_valid_until'),
      cell: ({ row }) => formatDate(row.original.coupon.expires_at, DATE_FORMAT.DEFAULT),
      meta: { align: 'center', width: '130px' },
    },
    {
      header: t('my.coupon_status_label'),
      cell: ({ row }) => (
        <span className={`caption-12 inline-flex rounded-full px-2 py-1 ${getCouponStatusClass(row.original.status)}`}>
          {getCouponStatusLabel(t, row.original.status)}
        </span>
      ),
      meta: { align: 'center', width: '110px' },
    },
    {
      header: t('my.coupon_received_at'),
      cell: ({ row }) => formatDate(row.original.received_at, DATE_FORMAT.DATE_TIME),
      meta: { align: 'center', width: '170px' },
    },
    {
      header: t('my.coupon_used_at'),
      cell: ({ row }) => (row.original.used_at ? formatDate(row.original.used_at, DATE_FORMAT.DATE_TIME) : '-'),
      meta: { align: 'center', width: '170px' },
    },
  ];
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <MyDataTable table={table} columns={columns} isLoading={isLoading} scrollable onRowClick={setSelectedCoupon} />
      <MyPagination
        currentPage={pagination.pageIndex + 1}
        totalPage={totalPage}
        totalRecords={totalRecords}
        pageSize={pagination.pageSize}
        onPageChange={(page) => onPaginationChange({ ...pagination, pageIndex: page - 1 })}
        className='mt-3 px-6'
      />
      {selectedCoupon && <CouponDetailModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} />}
    </div>
  );
};

export default CouponListTable;
