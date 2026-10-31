import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import type { OrderListItemRESP } from '../../api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, PAYMENT_METHOD_LABELS } from '../../constants';
import { type OrderStatus, type PaymentMethod } from '../../enums';
import { formatKrw } from '@/utils/format-currency';

type OriginalOrderColumnsOptions = {
  t: TFunction<'page'>;
};

// Original tab = real order list (GET /admin/orders). Pick rows here → order id → create receipt.
export function getOriginalOrderColumns({ t }: OriginalOrderColumnsOptions): ColumnDef<OrderListItemRESP>[] {
  return [
    {
      id: 'order_number',
      header: t('orders.cash_receipts.original.columns.order_number'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.order_number}</span>,
    },
    {
      id: 'orderer',
      header: t('orders.cash_receipts.original.columns.orderer'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-0.5'>
          <div className='text-sm font-medium'>{row.original.user.name}</div>
          <div className='text-muted-foreground text-xs'>{row.original.contact.company_name}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: t('orders.cash_receipts.original.columns.status'),
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.original.status;
        const label = ORDER_STATUS_LABELS[status as OrderStatus]?.(t) ?? status;
        const style = (ORDER_STATUS_STYLES as Record<string, string>)[status] ?? 'bg-gray-100 text-gray-800';
        return <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>{label}</span>;
      },
    },
    {
      id: 'order_date',
      header: t('orders.cash_receipts.original.columns.order_date'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.created_at.slice(0, 10)}</span>,
    },
    {
      id: 'payment_amount',
      header: t('orders.cash_receipts.original.columns.payment_amount'),
      enableSorting: false,
      cell: ({ row }) => (
        <span className='font-medium'>
          {/* {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Number(row.original.totals.total))} */}
          {formatKrw(Number(row.original.totals.total))}
        </span>
      ),
    },
    {
      id: 'payment_method',
      header: t('orders.cash_receipts.original.columns.payment_method'),
      enableSorting: false,
      cell: ({ row }) => {
        const method = row.original.payment_method;
        const label = PAYMENT_METHOD_LABELS[method as PaymentMethod]?.(t) ?? method;
        return <span className='rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700'>{label}</span>;
      },
    },
    {
      id: 'product_summary',
      header: t('orders.cash_receipts.original.columns.product_summary'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-0.5'>
          <div className='max-w-48 truncate text-sm' title={row.original.product.name}>
            {row.original.product.name}
          </div>
          {row.original.item_count > 1 && (
            <div className='text-muted-foreground text-xs'>{t('orders.list.more_items', { count: row.original.item_count - 1 })}</div>
          )}
        </div>
      ),
    },
    {
      id: 'delivery_address',
      header: t('orders.cash_receipts.original.columns.delivery_address'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='max-w-55 truncate text-sm' title={row.original.shipping.address}>
          {row.original.shipping.address}
        </div>
      ),
    },
  ];
}
