'use client';

import { MyDataTable, MyPagination } from '@/components/common';
import { formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { CashReceipt } from '@/types/cash-receipt';
import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

type TaxInvoiceListTableProps = {
  data: CashReceipt[];
  currentPage: number;
  totalPage: number;
  totalRecords?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
};

const TaxInvoiceListTable = ({
  data,
  currentPage,
  totalPage,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: TaxInvoiceListTableProps) => {
  const t = useTranslations();

  const columns: ColumnDef<CashReceipt>[] = [
    {
      header: t('my.issue_date'),
      accessorKey: 'issueDate',
      cell: (info) => <p className=''>{info.getValue() as string}</p>,
      meta: { align: 'center', width: '130px' },
    },
    {
      header: t('my.approval_number'),
      accessorKey: 'approvalNumber',
      cell: (info) => {
        const approvalNumber = info.getValue() as string;

        return (
          <button
            type='button'
            className='text-text-brand cursor-pointer whitespace-nowrap'
            onClick={() => window.open(ROUTES.MY_PAGE.ORDER_DETAIL(approvalNumber), '_blank', 'noopener,noreferrer')}>
            {approvalNumber}
          </button>
        );
      },
      meta: { align: 'center', width: '240px' },
    },
    {
      header: t('my.order_cost'),
      accessorKey: 'orderAmount',
      cell: (info) => <p>{formatCurrency(info.getValue() as number, false)}</p>,
      meta: { align: 'center' },
    },
    {
      header: t('common.shipping_fee'),
      accessorKey: 'shippingFee',
      cell: (info) => <p>{formatCurrency(info.getValue() as number, false)}</p>,
      meta: { align: 'center' },
    },
    {
      header: t('order.discount_amount'),
      accessorKey: 'discountAmount',
      cell: (info) => <p>{formatCurrency(info.getValue() as number, false)}</p>,
      meta: { align: 'center' },
    },
    {
      header: t('my.total_amount'),
      accessorKey: 'totalAmount',
      cell: (info) => <p>{formatCurrency(info.getValue() as number, false)}</p>,
      meta: { align: 'center' },
    },
    {
      header: t('my.supply_price'),
      accessorKey: 'supplyPrice',
      cell: (info) => <p>{formatCurrency(info.getValue() as number, false)}</p>,
      meta: { align: 'center' },
    },
    {
      header: t('product.vat'),
      accessorKey: 'vat',
      cell: (info) => <p>{formatCurrency(info.getValue() as number, false)}</p>,
      meta: { align: 'center' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPage,
  });

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <MyDataTable table={table} columns={columns} isLoading={isLoading} />
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

export default TaxInvoiceListTable;
