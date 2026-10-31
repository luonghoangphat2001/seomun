import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { Badge } from '@/components/ui/badge';

import type { CouponIssuance } from '../api/coupon.response';
import { COUPON_ISSUANCE_STATUS_BADGE_CLASSES, COUPON_ISSUANCE_STATUS_LABELS } from '../constants';
import { formatCouponDateTime, formatCouponNumber } from '../utils/coupon-display';

// ============================================================================
// Type definitions
// ============================================================================

type CouponIssuanceColumnsOptions = {
  t: TFunction<'page'>;
  pageOffset: number;
};

export function getCouponIssuanceColumns({ t, pageOffset }: CouponIssuanceColumnsOptions): ColumnDef<CouponIssuance>[] {
  return [
    {
      id: 'no',
      header: t('orders.coupons.columns.no'),
      meta: { headerClassName: 'w-16' },
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{pageOffset + row.index + 1}</span>,
    },
    {
      id: 'member',
      header: t('orders.coupons.issuances.columns.member'),
      cell: ({ row }) => {
        const { user } = row.original;
        if (!user) return <span className='text-muted-foreground text-sm'>-</span>;

        return (
          <div className='min-w-0'>
            <p className='truncate font-medium'>{user.name}</p>
            <p className='text-muted-foreground truncate text-xs'>{user.username}</p>
          </div>
        );
      },
    },
    {
      id: 'company',
      header: t('orders.coupons.issuances.columns.company'),
      cell: ({ row }) => <span className='text-sm'>{row.original.user?.customer?.company_name || '-'}</span>,
    },
    {
      id: 'contact',
      header: t('orders.coupons.issuances.columns.contact'),
      cell: ({ row }) => (
        <div className='min-w-0 text-sm'>
          <p className='truncate'>{row.original.user?.mobile || '-'}</p>
          <p className='text-muted-foreground truncate text-xs'>{row.original.user?.email || '-'}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: t('orders.coupons.columns.status'),
      cell: ({ row }) => (
        <Badge variant='outline' className={COUPON_ISSUANCE_STATUS_BADGE_CLASSES[row.original.status]}>
          {COUPON_ISSUANCE_STATUS_LABELS[row.original.status](t)}
        </Badge>
      ),
    },
    {
      id: 'received_at',
      header: t('orders.coupons.issuances.columns.received_at'),
      cell: ({ row }) => <span className='text-sm whitespace-nowrap'>{formatCouponDateTime(row.original.received_at)}</span>,
    },
    {
      id: 'used_at',
      header: t('orders.coupons.issuances.columns.used_at'),
      cell: ({ row }) => <span className='text-sm whitespace-nowrap'>{formatCouponDateTime(row.original.used_at)}</span>,
    },
    {
      id: 'order',
      header: t('orders.coupons.issuances.columns.order'),
      cell: ({ row }) => {
        const { order } = row.original;
        if (!order) return <span className='text-muted-foreground text-sm'>-</span>;

        return (
          <div className='min-w-0'>
            <Link
              to='/orders/$orderId'
              params={{ orderId: order.order_number }}
              target='_blank'
              rel='noreferrer'
              className='text-primary font-medium whitespace-nowrap hover:underline'
            >
              {order.order_number}
            </Link>
            <p className='text-muted-foreground text-xs whitespace-nowrap'>
              {t('orders.coupons.issuances.discount_amount', { value: formatCouponNumber(order.discount_amount) })}
            </p>
          </div>
        );
      },
    },
  ];
}
