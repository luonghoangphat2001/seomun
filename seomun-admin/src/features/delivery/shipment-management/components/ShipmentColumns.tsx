import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { SHIPMENT_STATUS_BADGE_CLASSES, SHIPMENT_STATUS_TRANSLATION_KEYS, SHIPMENT_TYPE_TRANSLATION_KEYS } from '../../constants';
import { ShipmentSortField } from '../../enums';
import type { Shipment } from '../../types';

export function getShipmentColumns(
  t: TFunction,
  onEditTrackingNumber: (shipment: Shipment) => void,
  onViewTrackingInfo: (trackingNumber: string) => void,
): ColumnDef<Shipment>[] {
  return [
    // {
    //   id: ShipmentSortField.SHIPMENT_DATE,
    //   accessorKey: 'shipped_at',
    //   header: t('page.delivery.shipments.fields.shipping_date'),
    //   enableSorting: true,
    //   cell: ({ row }) =>
    //     row.original.shipped_at ? (
    //       <span className='whitespace-nowrap'>{row.original.shipped_at}</span>
    //     ) : (
    //       <span className='text-muted-foreground'>—</span>
    //     ),
    // },
    {
      id: ShipmentSortField.ORDER_NUMBER,
      accessorKey: 'order_number',
      header: t('page.delivery.shipments.fields.order_number'),
      enableSorting: true,
      cell: ({ row }) => (
        <Link
          to='/orders/$orderId'
          params={{ orderId: row.original.order_number }}
          target='_blank'
          rel='noreferrer'
          className='text-primary font-medium whitespace-nowrap hover:underline'
        >
          {row.original.order_number}
        </Link>
      ),
    },
    // {
    //   accessorKey: 'customer_name',
    //   header: t('page.delivery.shipments.fields.customer_name'),
    //   enableSorting: false,
    //   cell: ({ row }) => (row.original.customer_name ? row.original.customer_name : <span className='text-muted-foreground'>—</span>),
    // },
    {
      id: 'items',
      header: t('page.delivery.shipments.fields.product_name'),
      enableSorting: false,
      cell: ({ row }) => {
        const { items } = row.original;
        if (items.length === 0) return null;
        return (
          <div className='min-w-48 space-y-0.5'>
            {items.map((item) => (
              <div key={item.id} className='line-clamp-1 text-sm'>
                {item.product_name}
                <span className='text-muted-foreground ml-1'>×{item.quantity.toLocaleString()}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: t('page.delivery.shipments.fields.shipment_type'),
      enableSorting: false,
      cell: ({ row }) => <span className='whitespace-nowrap'>{t(SHIPMENT_TYPE_TRANSLATION_KEYS[row.original.type])}</span>,
    },
    {
      accessorKey: 'status',
      header: () => <span className='block text-center'>{t('page.delivery.shipments.fields.status')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Badge variant='outline' className={SHIPMENT_STATUS_BADGE_CLASSES[row.original.status]}>
            {t(SHIPMENT_STATUS_TRANSLATION_KEYS[row.original.status])}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'carrier_name',
      header: () => <span className='block text-center'>{t('page.delivery.shipments.fields.carrier')}</span>,
      enableSorting: false,
      cell: () => <span className='block text-center whitespace-nowrap'>Hanjin Express</span>,
    },
    {
      accessorKey: 'tracking_number',
      header: () => <span className='block text-center'>{t('page.delivery.shipments.fields.tracking_number')}</span>,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.tracking_number ? (
          <div className='flex flex-col items-center whitespace-nowrap'>
            <p className='font-mono text-sm'>{row.original.tracking_number}</p>
            <div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-7 gap-1 px-2 text-xs'
                onClick={() => onViewTrackingInfo(row.original.tracking_number)}
              >
                <Truck className='size-3.5 shrink-0' aria-hidden='true' />
                {t('page.delivery.shipments.tracking_info_dialog.view')}
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex justify-center'>
            <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={() => onEditTrackingNumber(row.original)}>
              <Pencil className='size-3.5 shrink-0' aria-hidden='true' />
              {t('page.delivery.shipments.tracking_dialog.register')}
            </Button>
          </div>
        ),
    },
    {
      accessorKey: 'shipping_name',
      header: () => <span className='block text-center'>{t('page.delivery.shipments.fields.shipping_name')}</span>,
      enableSorting: false,
      cell: ({ row }) => <span className='block text-center'>{row.original.shipping_name}</span>,
    },
  ];
}
