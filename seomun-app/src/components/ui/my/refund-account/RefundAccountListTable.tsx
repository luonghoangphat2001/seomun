'use client';

import { MyDataTable, MyPagination } from '@/components/common';
import { RefundHistoryStatus } from '@/enums/refund-account';
import { formatCurrency } from '@/lib/utils';
import { RefundAccount } from '@/types/refund-account';
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';

type RefundAccountListTableProps = {
  data: RefundAccount[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  totalPage: number;
  totalRecords: number;
  isLoading?: boolean;
};

const RefundAccountListTable = ({
  data,
  pagination,
  setPagination,
  totalPage,
  totalRecords,
  isLoading,
}: RefundAccountListTableProps) => {
  const t = useTranslations();
  const refundHistoryStatusLabels: Record<RefundHistoryStatus, string> = {
    [RefundHistoryStatus.PENDING]: t('my.refund_history_status.pending'),
    [RefundHistoryStatus.COMPLETED]: t('my.refund_history_status.completed'),
    [RefundHistoryStatus.FAILED]: t('my.refund_history_status.failed'),
  };

  const columns: ColumnDef<RefundAccount>[] = [
    {
      header: t('my.settlement_date'),
      accessorKey: 'settlementDate',
      meta: { width: '140px', align: 'center' },
    },
    {
      header: t('my.refund_amount'),
      accessorKey: 'refundAmount',
      cell: ({ row }) => <p>{formatCurrency(row.original.refundAmount)}</p>,
      meta: { width: '150px', align: 'center' },
    },
    {
      header: t('my.account_holder'),
      accessorKey: 'accountHolder',
      meta: { width: '150px', align: 'center' },
    },
    {
      header: t('my.bank'),
      accessorKey: 'bankName',
      meta: { width: '150px', align: 'center' },
    },
    {
      header: t('my.account_number'),
      accessorKey: 'accountNumber',
      meta: { width: '200px', align: 'center' },
    },
    {
      header: t('my.deposit_date'),
      accessorKey: 'depositDate',
      meta: { width: '200px', align: 'center' },
    },
    {
      header: t('my.processing_status'),
      accessorKey: 'status',
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <p className='caption-12 w-fit rounded-lg bg-[#6BB77A] px-2.5 py-1 font-bold text-white'>
            {refundHistoryStatusLabels[row.original.status]}
          </p>
        </div>
      ),
      meta: { width: '150px', align: 'center' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPage,
  });

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <MyDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyText={t('my.no_refund_history')}
        emptyTextClassName='title-14'
      />
      <MyPagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPage={totalPage}
        onPageChange={(page: number) => table.setPageIndex(page - 1)}
        onPageSizeChange={(size: number) => setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize: size }))}
        totalRecords={totalRecords}
        pageSize={table.getState().pagination.pageSize}
        className='mt-3 hidden px-6 md:flex'
      />
    </div>
  );
};

export default RefundAccountListTable;
