import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { useState } from 'react';

import { formatKrw } from '@/utils/format-currency';

import { SettlementOrderDetailDialog } from './SettlementOrderDetailDialog';
import type { Report } from '../api';
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_STYLES } from '../../payment-list';
import type { PaymentStatus } from '../../payment-list';

type SettlementReportColumnsOptions = {
  t: TFunction<'page'>;
  pageIndex: number;
  pageSize: number;
};

function OrderNumberCell({ orderNumber }: { orderNumber: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type='button' className='text-primary cursor-pointer text-sm font-medium hover:underline' onClick={() => setOpen(true)}>
        {orderNumber}
      </button>
      <SettlementOrderDetailDialog orderNumber={open ? orderNumber : null} onClose={() => setOpen(false)} />
    </>
  );
}

function formatAmount(amount: number): string {
  return formatKrw(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
}

export function getSettlementReportColumns({ t, pageIndex, pageSize }: SettlementReportColumnsOptions): ColumnDef<Report>[] {
  return [
    {
      id: 'no',
      header: t('payments.settlement_report.columns.no', 'No'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{pageIndex * pageSize + row.index + 1}</span>,
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: t('payments.settlement_report.columns.created_at', 'Settlement Date'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{formatDate(row.original.created_at)}</span>,
    },
    {
      id: 'order_number',
      accessorKey: 'order_number',
      header: t('payments.settlement_report.columns.order_number', 'Order Number'),
      enableSorting: false,
      cell: ({ row }) => <OrderNumberCell orderNumber={row.original.order_number} />,
    },
    {
      id: 'customer_name',
      accessorKey: 'customer_name',
      header: t('payments.settlement_report.columns.customer_name', 'Customer'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm'>{row.original.customer_name}</span>,
    },
    {
      id: 'product_name',
      accessorKey: 'product_name',
      header: t('payments.settlement_report.columns.product_name', 'Product'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm'>{row.original.product_name}</span>,
    },
    {
      id: 'category_name',
      accessorKey: 'category_name',
      header: t('payments.settlement_report.columns.category_name', 'Category'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.category_name}</span>,
    },
    {
      id: 'payment_amount',
      accessorKey: 'payment_amount',
      header: t('payments.settlement_report.columns.payment_amount', 'Payment Amount'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{formatAmount(row.original.payment_amount)}</span>,
    },
    {
      id: 'supply_price',
      accessorKey: 'supply_price',
      header: t('payments.settlement_report.columns.supply_price', 'Supply Price'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm'>{formatAmount(row.original.supply_price)}</span>,
    },
    {
      id: 'vat',
      accessorKey: 'vat',
      header: t('payments.settlement_report.columns.vat', 'VAT'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm'>{formatAmount(row.original.vat)}</span>,
    },
    {
      id: 'commission',
      accessorKey: 'commission',
      header: t('payments.settlement_report.columns.commission', 'Commission'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{formatAmount(row.original.commission)}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('payments.settlement_report.columns.status', 'Status'),
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original.status as PaymentStatus;
        const label = PAYMENT_STATUS_LABEL[s]?.(t) ?? row.original.status;
        const style = PAYMENT_STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-800';
        return <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>{label}</span>;
      },
    },
  ];
}
