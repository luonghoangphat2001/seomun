import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import type { OrderListItemRESP } from '../api/order.response';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../constants';
import { formatKrw } from '@/utils/format-currency';

import { getOrderCompanyName } from '../utils/order-company-name';
import { OrderSortField, type OrderStatus } from '../enums';
import dayjs from 'dayjs';

// === Type definitions ===

type OrderColumnsOptions = {
  t: TFunction<'page'>;
};

export function getOrderColumns({ t }: OrderColumnsOptions): ColumnDef<OrderListItemRESP>[] {
  return [
    {
      id: OrderSortField.ORDERER_NUMBER,
      accessorKey: 'order_number',
      header: t('orders.list.columns.order_number'),
      meta: { headerClassName: 'w-[150px]' },
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-0.5'>
          <div className='text-xs font-medium break-all'>{row.original.order_number}</div>
          <div className='text-muted-foreground text-xs'>({dayjs(row.original.created_at).format('YYYY-MM-DD HH:mm')})</div>
          {row.original.order_external_number && <div className='text-muted-foreground truncate text-xs'>{row.original.order_external_number}</div>}
        </div>
      ),
    },
    {
      accessorKey: 'user',
      header: t('orders.list.columns.orderer'),
      meta: { headerClassName: 'w-[96px]' },
      enableSorting: false,
      cell: ({ row }) => {
        const companyName = getOrderCompanyName(row.original);

        return (
          <div className='space-y-0.5'>
            <div className='truncate text-xs font-medium' title={row.original.user.name}>
              {row.original.user.name}
            </div>
            {companyName && (
              <div className='text-muted-foreground truncate text-xs' title={companyName}>
                ({companyName})
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'product',
      header: t('orders.list.columns.product'),
      meta: { headerClassName: 'w-[92px]' },
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-0.5'>
          <div className='truncate text-xs' title={row.original.product.name}>
            {row.original.product.name}
          </div>
          {row.original.item_count > 1 && (
            <div className='text-muted-foreground truncate text-xs'>{t('orders.list.more_items', { count: row.original.item_count - 1 })}</div>
          )}
        </div>
      ),
    },
    {
      id: OrderSortField.PAYMENT_AMOUNT,
      accessorKey: 'totals',
      header: t('orders.list.columns.payment_amount'),
      meta: { headerClassName: 'w-[92px] text-right' },
      enableSorting: false,
      cell: ({ row }) => <div className='truncate text-right text-xs font-medium'>{formatKrw(row.original.totals.total)}</div>,
    },
    {
      id: OrderSortField.STATUS,
      accessorKey: 'status',
      header: t('orders.list.columns.status'),
      meta: { headerClassName: 'w-[92px] text-center' },
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.original.status;
        const label = ORDER_STATUS_LABELS[status as OrderStatus]?.(t) ?? status;
        const style = (ORDER_STATUS_STYLES as Record<string, string>)[status] ?? 'bg-gray-100 text-gray-800';
        return (
          <div className='flex justify-center'>
            <span className={`rounded px-1.5 py-0.5 text-center text-xs font-medium ${style}`}>{label}</span>
          </div>
        );
      },
    },
  ];
}
