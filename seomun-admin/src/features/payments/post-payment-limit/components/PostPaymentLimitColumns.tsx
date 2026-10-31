import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { Edit, Eye, History, MoreHorizontal, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { USER_LIMIT_STATUS_LABELS, USER_LIMIT_STATUS_STYLES } from '../constants';
import type { UserLimitStatus } from '../enums';
import type { UserLimitRESP } from '../api';
import { formatKrw } from '@/utils/format-currency';

type PostPaymentLimitColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  onViewDetail: (row: UserLimitRESP) => void;
  onEdit: (row: UserLimitRESP) => void;
  onDelete: (row: UserLimitRESP) => void;
  onViewPaymentHistory: (row: UserLimitRESP) => void;
};

// function formatAmount(amount: number): string {
//   return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
// }

export function getPostPaymentLimitColumns({
  t,
  tCommon,
  onViewDetail,
  onEdit,
  onDelete,
  onViewPaymentHistory,
}: PostPaymentLimitColumnsOptions): ColumnDef<UserLimitRESP>[] {
  return [
    {
      id: 'no',
      header: () => <div className='text-center'>{t('post_payment_limit.columns.no', 'No')}</div>,
      enableSorting: false,
      size: 60,
      cell: ({ row }) => (
        <div className='text-center'>
          <span className='text-muted-foreground text-sm'>{row.index + 1}</span>
        </div>
      ),
    },
    {
      id: 'customer',
      header: t('post_payment_limit.columns.customer', 'Customer'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm font-medium'>{row.original.customer?.name ?? '—'}</span>
          <span className='text-muted-foreground text-xs'>{row.original.customer?.email ?? '—'}</span>
        </div>
      ),
    },
    {
      id: 'limit',
      accessorKey: 'limit',
      header: () => <div className='text-center'>{t('post_payment_limit.columns.limit', 'Limit')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='text-center'>
          <span className='text-sm font-medium'>{formatKrw(row.original.limit)}</span>
        </div>
      ),
    },
    {
      id: 'usage_amount',
      accessorKey: 'usage_amount',
      header: () => <div className='text-center'>{t('post_payment_limit.columns.usage_amount', 'Used')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='text-center'>
          <span className='text-sm font-medium text-red-600'>{formatKrw(row.original.usage_amount ?? 0)}</span>
        </div>
      ),
    },
    {
      id: 'remaining_amount',
      accessorKey: 'remaining_amount',
      header: () => <div className='text-center'>{t('post_payment_limit.columns.remaining_amount', 'Remaining')}</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const isExceeded = (row.original.usage_amount ?? 0) > row.original.limit;
        return (
          <div className='flex items-center justify-center gap-1.5'>
            <span className={`text-sm font-medium ${isExceeded ? 'text-red-600' : 'text-green-600'}`}>
              {formatKrw(row.original.remaining_amount ?? 0)}
            </span>
            {isExceeded && (
              <span className='rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700'>
                {t('post_payment_limit.exceeded', 'Exceeded')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <div className='text-center'>{t('post_payment_limit.columns.status', 'Status')}</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.original.status as UserLimitStatus;
        const style = USER_LIMIT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700';
        const label = USER_LIMIT_STATUS_LABELS[status]?.(t) ?? row.original.status;
        return (
          <div className='flex justify-center'>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>{label}</span>
          </div>
        );
      },
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: () => <div className='text-center'>{t('post_payment_limit.columns.created_at', 'Created At')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='text-center'>
          <span className='text-muted-foreground text-sm'>{dayjs(row.original.created_at).format('YYYY-MM-DD')}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('post_payment_limit.columns.actions', 'Actions')}</div>,
      enableSorting: false,
      size: 60,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onViewPaymentHistory(row.original)} className='cursor-pointer'>
                <History className='mr-2 size-4' />
                {t('post_payment_limit.actions.payment_history', 'Payment History')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetail(row.original)} className='cursor-pointer'>
                <Eye className='mr-2 size-4' />
                {t('post_payment_limit.actions.view_detail', 'View Detail')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row.original)} className='cursor-pointer'>
                <Edit className='mr-2 size-4' />
                {tCommon('action.edit', 'Edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(row.original)} className='cursor-pointer text-red-600 focus:text-red-600'>
                <Trash2 className='mr-2 size-4' />
                {tCommon('action.delete', 'Delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
