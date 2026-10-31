import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import dayjs from 'dayjs';
import { Eye, FileIcon, Loader2, Printer } from 'lucide-react';

import { formatKrw } from '@/utils/format-currency';
import { Button } from '@/components/ui/button';

import type { OrderListItemRESP } from '../api/order.response';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, PAYMENT_METHOD_LABELS } from '../constants';
import { OrderSortField, type OrderStatus, type PaymentMethod } from '../enums';

function getItemOptions(item: OrderListItemRESP['items'][number], t: TFunction<'page'>) {
  if (item.options.length) {
    return item.options
      .map(
        ({ group, option }) =>
          `${group.name.toLowerCase() === 'paper' ? t('orders.detail.product_info.option_group.paper') : group.name}: ${option.label}`,
      )
      .join('\n');
  }

  return [item.configuration.size, item.configuration.paper, item.configuration.sheets].filter(Boolean).join(' / ');
}

type ProductionOrderColumnsOptions = {
  t: TFunction<'page'>;
  onPrint: (orderId: string) => void;
  busyId: string | null;
};

export function getProductionOrderColumns({ t, onPrint, busyId }: ProductionOrderColumnsOptions): ColumnDef<OrderListItemRESP>[] {
  return [
    {
      id: OrderSortField.ORDERER_NUMBER,
      accessorKey: 'order_number',
      header: t('orders.list.columns.order_number'),
      enableSorting: true,
      cell: ({ row }) => (
        <Link to='/orders/production/$orderId' params={{ orderId: row.original.order_number }} search={{}} className='font-medium hover:underline'>
          {row.original.order_number}
        </Link>
      ),
    },
    {
      accessorKey: 'user',
      header: t('orders.list.columns.orderer'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='w-20 space-y-1'>
          <div className='font-medium'>{row.original.user.name}</div>
          <div className='text-muted-foreground text-xs'>{row.original.contact.company_name}</div>
        </div>
      ),
    },
    // {
    //   accessorKey: 'product',
    //   header: t('orders.list.columns.product'),
    //   enableSorting: false,
    //   cell: ({ row }) => (
    //     <div className='space-y-1'>
    //       <div className='max-w-40 truncate' title={row.original.product.name}>
    //         {row.original.product.name}
    //       </div>
    //       {row.original.item_count > 1 ? (
    //         <div className='text-muted-foreground text-xs'>{t('orders.list.more_items', { count: row.original.item_count - 1 })}</div>
    //       ) : null}
    //     </div>
    //   ),
    // },
    {
      id: 'production-information',
      header: t('orders.detail.product_info.title'),
      enableSorting: false,
      cell: ({ row }) => {
        const order = row.original;
        const item = order.items[0];

        if (!item) {
          return <span className='text-muted-foreground text-sm'>-</span>;
        }

        const isUploadFile = Boolean(item.design.file);
        const thumbnail = isUploadFile
          ? (item.product_snapshot.first_image ?? order.product.images)
          : (item.design.front?.preview_image_path ?? item.design.back?.preview_image_path ?? null);
        return (
          <div className='flex gap-3'>
            <div className='bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md'>
              {thumbnail ? (
                <img src={thumbnail} alt={item.title} className='size-full object-cover' />
              ) : (
                <FileIcon className='text-muted-foreground size-5' />
              )}
            </div>

            <div className='min-w-0 space-y-1.5'>
              <p className='font-semibold'>{item.title}</p>
              <p className='text-muted-foreground text-sm wrap-break-word whitespace-pre-line'>{getItemOptions(item, t) || '-'}</p>
              <div className='flex flex-wrap items-center gap-2 text-sm'>
                <span>{`${item.quantity}매 x ${item.multiplier}건`}</span>
                {/* {proofStatus ? (
                  <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700'>
                    {t('orders.detail.product_info.proof_status')}: {t(`orders.detail.product_info.proof_status_value.${proofStatus}`)}
                  </span>
                ) : null} */}
              </div>
              {/* {designFile?.url ? (
                <a
                  href={designFile.url}
                  download={designFile.name}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex max-w-full items-center gap-1 text-sm text-amber-500 hover:underline'
                  title={designFile.name}
                >
                  <FileIcon className='size-4 shrink-0' />
                  <span className='truncate'>{designFile.name}</span>
                  <Download className='size-4 shrink-0' />
                </a>
              ) : null} */}
            </div>
          </div>
        );
      },
    },
    {
      id: OrderSortField.PAYMENT_AMOUNT,
      accessorKey: 'totals',
      header: t('orders.list.columns.payment_info'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='font-medium'>{formatKrw(row.original.totals.total)}</div>
          <div className='text-muted-foreground text-xs'>
            {PAYMENT_METHOD_LABELS[row.original.payment_method as PaymentMethod]?.(t) ?? row.original.payment_method}
          </div>
        </div>
      ),
    },
    {
      id: OrderSortField.STATUS,
      accessorKey: 'status',
      header: t('orders.list.columns.status'),
      meta: { headerClassName: 'text-center' },
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.original.status;
        const label = ORDER_STATUS_LABELS[status as OrderStatus]?.(t) ?? status;
        const style = (ORDER_STATUS_STYLES as Record<string, string>)[status] ?? 'bg-gray-100 text-gray-800';

        return (
          <div className='flex justify-center'>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>{label}</span>
          </div>
        );
      },
    },
    {
      id: OrderSortField.PLACED_AT,
      accessorKey: 'created_at',
      header: t('orders.list.columns.order_date'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-sm'>{dayjs(row.original.created_at).format('YYYY-MM-DD HH:mm')}</span>,
    },
    {
      id: 'actions',
      header: t('orders.list.columns.actions'),
      enableSorting: false,
      cell: ({ row }) => {
        const id = String(row.original.id);
        const isBusy = busyId === id;

        return (
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link to='/orders/production/$orderId' params={{ orderId: row.original.order_number }} search={{}}>
                <Eye className='mr-1 size-4' />
                {t('orders.list.actions.detail')}
              </Link>
            </Button>
            <Button variant='secondary' size='sm' disabled={isBusy} onClick={() => onPrint(id)}>
              {isBusy ? <Loader2 className='mr-1 size-4 animate-spin' /> : <Printer className='mr-1 size-4' />}
              {t('orders.list.actions.print')}
            </Button>
          </div>
        );
      },
    },
  ];
}
