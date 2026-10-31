import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Eye, MoreHorizontal, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import type { NotificationHistoryRESP } from '../api/notification-history.response';
import { getNotificationSendingResultLabel, getNotificationTypeLabel } from '../constants';
import { NotificationHistorySortField, NotificationSendingResult } from '../enums';

const RESULT_BADGE_CLASSES: Record<NotificationSendingResult, string> = {
  [NotificationSendingResult.SUCCESS]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [NotificationSendingResult.FAILURE]: 'border-rose-200 bg-rose-50 text-rose-700',
};

interface NotificationHistoryColumnOptions {
  t: TFunction<'page'>;
  onOpenDetail: (history: NotificationHistoryRESP) => void;
  onResend: (history: NotificationHistoryRESP) => void;
  resendingHistoryId?: number | null;
  rowOffset?: number;
}

export function getNotificationHistoryColumns({
  t,
  onOpenDetail,
  onResend,
  resendingHistoryId,
  rowOffset = 0,
}: NotificationHistoryColumnOptions): ColumnDef<NotificationHistoryRESP>[] {
  return [
    {
      id: 'no',
      header: t('notifications.history.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{rowOffset + row.index + 1}</span>,
    },
    {
      accessorKey: 'template',
      header: t('notifications.history.columns.template'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='font-medium'>{row.original.template.template_number}</div>
          <div className='text-muted-foreground text-xs'>{row.original.message_title}</div>
        </div>
      ),
    },
    {
      accessorKey: 'notification_type',
      header: t('notifications.history.columns.notification_type'),
      enableSorting: false,
      cell: ({ row }) => (
        <span className='bg-muted inline-flex rounded px-2 py-1 text-xs font-medium'>
          {getNotificationTypeLabel(t, row.original.notification_type)}
        </span>
      ),
    },
    {
      accessorKey: 'sender',
      header: t('notifications.history.columns.sender'),
      enableSorting: false,
      cell: ({ row }) => row.original.sender?.name ?? '-',
    },
    // {
    //   accessorKey: 'delivery_summary',
    //   header: t('notifications.history.columns.delivery_summary'),
    //   enableSorting: false,
    //   cell: ({ row }) => (
    //     <div className='space-y-1'>
    //       <div className='text-sm font-medium'>
    //         {t('notifications.history.columns.delivered_count', { success: row.original.success_count, total: row.original.total_recipients })}
    //       </div>
    //       <div className='text-muted-foreground text-xs'>{t('notifications.history.columns.failures', { count: row.original.failure_count })}</div>
    //     </div>
    //   ),
    // },
    {
      id: NotificationHistorySortField.RECIPIENT_NAME,
      accessorKey: 'recipient_name',
      header: t('notifications.history.columns.recipient'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='font-medium'>{row.original.recipient_name}</div>
          <div className='text-muted-foreground text-xs'>{row.original.recipient_role}</div>
        </div>
      ),
    },
    {
      id: NotificationHistorySortField.SENT_AT,
      accessorKey: 'sent_at',
      header: t('notifications.history.columns.sent_at'),
      enableSorting: true,
    },
    {
      accessorKey: 'sending_result',
      header: t('notifications.history.columns.result'),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant='outline' className={RESULT_BADGE_CLASSES[row.original.sending_result]}>
          {getNotificationSendingResultLabel(t, row.original.sending_result)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('notifications.history.columns.actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const isResending = resendingHistoryId === row.original.id;

        return (
          <div className='flex justify-center' onClick={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type='button' variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => onOpenDetail(row.original)} className='cursor-pointer'>
                  <Eye className='mr-2 size-4' />
                  {t('notifications.history.columns.details')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResend(row.original)}
                  disabled={row.original.failure_count === 0 || isResending}
                  className='cursor-pointer'
                >
                  <RotateCcw className='mr-2 size-4' />
                  {isResending ? t('notifications.history.columns.resending') : t('notifications.history.columns.resend')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
