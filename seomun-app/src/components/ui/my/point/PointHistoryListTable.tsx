'use client';

import { MyDataTable, MyPagination, TableCell, TableRow } from '@/components/common';
import { formatCurrency } from '@/lib/utils';
import { PointHistory } from '@/types/point';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import { PointSummaryRESP } from '@/apis/points/points.response';

type PointHistoryListTableProps = {
  data: PointHistory[];
  currentPage: number;
  totalPage: number;
  totalRecords: number;
  pageSize: number;
  isLoading?: boolean;
  summaryResp?: PointSummaryRESP;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const PointHistoryListTable = ({
  data,
  currentPage,
  totalPage,
  totalRecords,
  pageSize,
  isLoading,
  summaryResp,
  onPageChange,
  onPageSizeChange,
}: PointHistoryListTableProps) => {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const tCustomerService = useTranslations('customer_service');
  const tMy = useTranslations('my');

  const columns: ColumnDef<PointHistory>[] = [
    {
      header: tCustomerService('division'),
      accessorKey: 'type',
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tCommon('order_number'),
      accessorKey: 'earnOrderNo',
      cell: (info) => {
        const orderNumber = info.getValue() as string;

        return (
          <button
            type='button'
            className='cursor-pointer underline hover:opacity-80'
            onClick={() => {
              if (orderNumber !== '-') {
                router.push(ROUTES.MY_PAGE.ORDER_DETAIL(orderNumber));
              }
            }}>
            {orderNumber}
          </button>
        );
      },
      meta: { align: 'center', width: '180px' },
    },
    {
      header: tCommon('date'),
      accessorKey: 'date',
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tMy('expired_date'),
      accessorKey: 'expireDate',
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tMy('earn_point'),
      accessorKey: 'earned',
      cell: (info) => `${formatCurrency(info.getValue() as number, false)} P`,
      meta: { align: 'center', width: '100px' },
    },
    {
      header: tMy('use'),
      accessorKey: 'used',
      cell: (info) => `${formatCurrency(info.getValue() as number, false)} P`,
      meta: { align: 'center', width: '100px' },
    },
    {
      header: tMy('balance'),
      accessorKey: 'balance',
      cell: (info) => `${formatCurrency(info.getValue() as number, false)} P`,
      meta: { align: 'center', width: '100px' },
    },
    {
      header: tMy('extinction'),
      accessorKey: 'expired',
      cell: (info) => `${formatCurrency(info.getValue() as number, false)} P`,
      meta: { align: 'center', width: '100px' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  });

  const pageRows = table.getRowModel().rows;

  const pageTotal = useMemo(
    () => ({
      earned: pageRows.reduce((acc, row) => acc + row.original.earned, 0),
      used: pageRows.reduce((acc, row) => acc + row.original.used, 0),
      balance: pageRows.reduce((acc, row) => acc + row.original.balance, 0),
      expired: pageRows.reduce((acc, row) => acc + row.original.expired, 0),
    }),
    [pageRows],
  );

  const grandTotal = useMemo(
    () => ({
      earned: summaryResp?.total_earned ?? 0,
      used: summaryResp?.total_used ?? 0,
      balance: summaryResp?.balance ?? 0,
      expired: summaryResp?.total_expired ?? 0,
    }),
    [summaryResp],
  );

  const footerRows = (
    <>
      {/* Page total */}
      <TableRow className='bg-border-light body-16 border-b-border-soft h-18'>
        <TableCell className='text-center'>{tCommon('total')}</TableCell>
        <TableCell className='text-center'></TableCell>
        <TableCell className='text-center'></TableCell>
        <TableCell className='text-center'></TableCell>
        <TableCell className='text-center'>{`${formatCurrency(pageTotal.earned, false)} P`}</TableCell>
        <TableCell className='text-center'>{`${formatCurrency(pageTotal.used, false)} P`}</TableCell>
        <TableCell className='text-center'>{`${formatCurrency(pageTotal.balance, false)} P`}</TableCell>
        <TableCell className='text-center'>{`${formatCurrency(pageTotal.expired, false)} P`}</TableCell>
      </TableRow>

      {/* Grand total */}
      <TableRow className='body-16 h-18 bg-gray-100'>
        <TableCell className='text-center'>{tCommon('grand_total')}</TableCell>
        <TableCell className='text-center'></TableCell>
        <TableCell className='text-center'></TableCell>
        <TableCell className='text-center'></TableCell>
        <TableCell className='text-center'>{`${formatCurrency(grandTotal.earned, false)} P`}</TableCell>
        <TableCell className='text-center'>{`${formatCurrency(grandTotal.used, false)} P`}</TableCell>
        <TableCell className='text-center'>{`${formatCurrency(grandTotal.balance, false)} P`}</TableCell>
        <TableCell className='text-center'>{`${formatCurrency(grandTotal.expired, false)} P`}</TableCell>
      </TableRow>
    </>
  );

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <MyDataTable table={table} columns={columns} footerRows={isLoading ? undefined : footerRows} isLoading={isLoading} />
      <MyPagination
        currentPage={currentPage}
        totalPage={totalPage}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className='mt-3 px-6'
      />
    </div>
  );
};

export default PointHistoryListTable;
