import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { DELIVERY_STAGE_BADGE_CLASSES, DELIVERY_STAGE_TRANSLATION_KEYS } from '../../constants';
import { DeliveryTrackingSortField } from '../../enums';
import type { DeliveryTracking } from '../../types';

export function getTrackingColumns(t: TFunction, onOpenDetail: (tracking: DeliveryTracking) => void): ColumnDef<DeliveryTracking>[] {
  return [
    {
      accessorKey: 'order_number',
      header: t('page.delivery.tracking.fields.order_number'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-primary font-medium whitespace-nowrap'>{row.original.order_number}</span>,
    },
    {
      accessorKey: 'customer_name',
      header: t('page.delivery.tracking.fields.customer_name'),
      enableSorting: false,
      cell: ({ row }) => (row.original.customer_name ? row.original.customer_name : <span className='text-muted-foreground'>—</span>),
    },
    {
      accessorKey: 'product_name',
      header: t('page.delivery.tracking.fields.product_name'),
      enableSorting: false,
      cell: ({ row }) => <span className='line-clamp-1 min-w-48'>{row.original.product_name}</span>,
    },
    {
      accessorKey: 'quantity',
      header: t('page.delivery.tracking.fields.quantity'),
      enableSorting: false,
      cell: ({ row }) => <span className='block text-right tabular-nums'>{row.original.quantity.toLocaleString()}</span>,
    },
    {
      id: DeliveryTrackingSortField.INVOICE_NUMBER,
      accessorKey: 'invoice_number',
      header: t('page.delivery.tracking.fields.invoice_number'),
      enableSorting: true,
      cell: ({ row }) => <span className='whitespace-nowrap'>{row.original.invoice_number}</span>,
    },
    {
      accessorKey: 'courier_name',
      header: t('page.delivery.tracking.fields.courier_name'),
      enableSorting: false,
    },
    {
      id: DeliveryTrackingSortField.WAYBILL_REGISTERED_AT,
      accessorKey: 'waybill_registered_at',
      header: t('page.delivery.tracking.fields.waybill_registered_at'),
      enableSorting: true,
      cell: ({ row }) =>
        row.original.waybill_registered_at ? (
          <span className='whitespace-nowrap'>{row.original.waybill_registered_at}</span>
        ) : (
          <span className='text-muted-foreground'>—</span>
        ),
    },
    {
      id: DeliveryTrackingSortField.DELIVERY_STATUS,
      accessorKey: 'delivery_status',
      header: t('page.delivery.tracking.fields.delivery_stage'),
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant='outline' className={DELIVERY_STAGE_BADGE_CLASSES[row.original.delivery_status]}>
          {t(DELIVERY_STAGE_TRANSLATION_KEYS[row.original.delivery_status])}
        </Badge>
      ),
    },
    {
      id: 'detail',
      header: t('common.action.view'),
      enableSorting: false,
      cell: ({ row }) => (
        <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={() => onOpenDetail(row.original)}>
          <Eye className='size-3.5' />
          {t('common.action.view')}
        </Button>
      ),
    },
  ];
}
