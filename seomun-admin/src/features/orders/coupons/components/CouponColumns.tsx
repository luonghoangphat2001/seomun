import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil, Send, Trash2 } from 'lucide-react';

import { AppSwitch } from '@/components/shared/app-switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import type { Coupon } from '../api/coupon.response';
import { COUPON_DISCOUNT_TYPE_LABELS, COUPON_VALIDITY_BADGE_CLASSES, COUPON_VALIDITY_STATUS_LABELS } from '../constants';
import { CouponSortField } from '../enums';
import {
  formatCouponDate,
  formatCouponDateTime,
  formatCouponDiscount,
  formatCouponNumber,
  formatCouponRemaining,
  getCouponValidity,
} from '../utils/coupon-display';

// ============================================================================
// Type definitions
// ============================================================================

type CouponColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  togglingCouponId?: number;
  onEdit: (coupon: Coupon) => void;
  onIssue: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
};

export function getCouponColumns({
  t,
  tCommon,
  togglingCouponId,
  onEdit,
  onIssue,
  onDelete,
  onToggleStatus,
}: CouponColumnsOptions): ColumnDef<Coupon>[] {
  return [
    {
      id: CouponSortField.CREATED_AT,
      accessorKey: 'created_at',
      header: t('orders.coupons.columns.created_at'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-muted-foreground text-sm whitespace-nowrap'>{formatCouponDateTime(row.original.created_at)}</span>,
    },
    {
      id: CouponSortField.STARTS_AT,
      accessorKey: 'starts_at',
      header: t('orders.coupons.columns.period'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='text-sm whitespace-nowrap'>
          <p>{formatCouponDate(row.original.starts_at)}</p>
          <p className='text-muted-foreground'>{formatCouponDate(row.original.expires_at)}</p>
        </div>
      ),
    },
    {
      id: CouponSortField.NAME,
      accessorKey: 'name',
      header: t('orders.coupons.columns.name'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='min-w-0'>
          <p className='truncate font-medium'>{row.original.name}</p>
          <p className='text-muted-foreground truncate font-mono text-xs'>{row.original.code}</p>
        </div>
      ),
    },
    {
      id: 'discount',
      header: t('orders.coupons.columns.discount'),
      enableSorting: false,
      cell: ({ row }) => {
        const coupon = row.original;

        return (
          <div className='min-w-0'>
            <p className='font-medium'>{formatCouponDiscount(coupon, t)}</p>
            <p className='text-muted-foreground text-xs'>
              {COUPON_DISCOUNT_TYPE_LABELS[coupon.discount_type](t)}
              {coupon.min_order_amount !== null
                ? ` · ${t('orders.coupons.columns.min_order_amount_short', { value: formatCouponNumber(coupon.min_order_amount) })}`
                : ''}
            </p>
          </div>
        );
      },
    },
    {
      id: 'issued_count',
      accessorKey: 'issued_count',
      header: t('orders.coupons.columns.issued_count'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm tabular-nums'>{formatCouponNumber(row.original.issued_count)}</span>,
    },
    {
      id: 'usage',
      accessorKey: 'usage_count',
      header: t('orders.coupons.columns.usage'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm tabular-nums'>{formatCouponNumber(row.original.usage_count)}</span>,
    },
    {
      id: 'remaining',
      header: t('orders.coupons.columns.remaining'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm tabular-nums'>{formatCouponRemaining(row.original)}</span>,
    },
    {
      id: 'status',
      header: t('orders.coupons.columns.status'),
      enableSorting: false,
      cell: ({ row }) => {
        const coupon = row.original;
        const validity = getCouponValidity(coupon);

        return (
          <div className='flex flex-col items-start gap-1.5'>
            <div className='flex items-center gap-2' onClick={(event) => event.stopPropagation()}>
              <AppSwitch
                size='sm'
                checked={coupon.is_active}
                disabled={togglingCouponId === coupon.id}
                onValueChange={() => onToggleStatus(coupon)}
                aria-label={t('orders.coupons.actions.toggle_status')}
              />
              <span className='text-sm'>{coupon.is_active ? tCommon('status.active') : tCommon('status.inactive')}</span>
            </div>

            <Badge variant='outline' className={COUPON_VALIDITY_BADGE_CLASSES[validity]}>
              {COUPON_VALIDITY_STATUS_LABELS[validity](t)}
            </Badge>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: t('orders.coupons.columns.actions'),
      enableSorting: false,
      meta: { headerClassName: 'w-32 text-right' },
      cell: ({ row }) => {
        const coupon = row.original;
        const actions = [
          { label: t('orders.coupons.actions.edit'), icon: Pencil, onClick: () => onEdit(coupon), className: undefined },
          { label: t('orders.coupons.actions.issue'), icon: Send, onClick: () => onIssue(coupon), className: undefined },
          {
            label: t('orders.coupons.actions.delete'),
            icon: Trash2,
            onClick: () => onDelete(coupon),
            className: 'text-destructive hover:text-destructive',
          },
        ];

        return (
          <div className='flex justify-end gap-1' onClick={(event) => event.stopPropagation()}>
            {actions.map(({ label, icon: Icon, onClick, className }) => (
              <Button
                key={label}
                type='button'
                variant='ghost'
                size='sm'
                className={cn('size-8 p-0', className)}
                title={label}
                aria-label={label}
                onClick={onClick}
              >
                <Icon className='size-4' />
              </Button>
            ))}
          </div>
        );
      },
    },
  ];
}
