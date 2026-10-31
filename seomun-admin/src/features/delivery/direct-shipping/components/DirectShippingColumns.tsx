import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateOnly, parseDate } from '@/utils/format-date';
import { formatPhoneNumber } from '@/utils/format-phone';

import { DIRECT_SHIPPING_NAME_TRANSLATION_KEYS, DIRECT_SHIPPING_STATUS_BADGE_CLASSES, DIRECT_SHIPPING_STATUS_TRANSLATION_KEYS } from '../constants';
import type { DirectShipping } from '../types';

export function getDirectShippingColumns(t: TFunction, onView: (row: DirectShipping) => void): ColumnDef<DirectShipping>[] {
  return [
    {
      accessorKey: 'created_at',
      header: t('page.delivery.direct_shipping.fields.created_at'),
      enableSorting: false,
      cell: ({ row }) => <span className='whitespace-nowrap'>{formatDateOnly(parseDate(row.original.created_at)) ?? '-'}</span>,
    },
    {
      accessorKey: 'user',
      header: t('page.delivery.direct_shipping.fields.requester'),
      enableSorting: false,
      cell: ({ row }) => {
        const { user } = row.original;
        if (!user) return <span>-</span>;

        return (
          <div className='space-y-0.5'>
            <div className='font-medium whitespace-nowrap'>{user.name}</div>
            {user.customer?.company_name && (
              <div className='text-muted-foreground text-xs whitespace-nowrap'>({user.customer.company_name})</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'shipping_name',
      header: t('page.delivery.direct_shipping.fields.shipping_name'),
      enableSorting: false,
      cell: ({ row }) => <span className='whitespace-nowrap'>{t(DIRECT_SHIPPING_NAME_TRANSLATION_KEYS[row.original.shipping_name])}</span>,
    },
    {
      accessorKey: 'recipient_name',
      header: t('page.delivery.direct_shipping.fields.recipient_name'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.recipient_name || '-'}</span>,
    },
    {
      accessorKey: 'phone',
      header: t('page.delivery.direct_shipping.fields.phone'),
      enableSorting: false,
      cell: ({ row }) => <span className='whitespace-nowrap'>{formatPhoneNumber(row.original.phone)}</span>,
    },
    {
      accessorKey: 'address',
      header: t('page.delivery.direct_shipping.fields.address'),
      enableSorting: false,
      cell: ({ row }) => {
        const { postcode, address, detailed_address } = row.original;
        const full = [postcode ? `[${postcode}]` : '', address, detailed_address].filter(Boolean).join(' ');
        return (
          <div className='max-w-lg truncate' title={full || undefined}>
            {full || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: () => <span className='block text-center'>{t('page.delivery.direct_shipping.fields.status')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Badge variant='outline' className={DIRECT_SHIPPING_STATUS_BADGE_CLASSES[row.original.status]}>
            {t(DIRECT_SHIPPING_STATUS_TRANSLATION_KEYS[row.original.status])}
          </Badge>
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={() => onView(row.original)}>
            <Eye className='size-3.5 shrink-0' aria-hidden='true' />
            {t('page.delivery.direct_shipping.actions.view')}
          </Button>
        </div>
      ),
    },
  ];
}
