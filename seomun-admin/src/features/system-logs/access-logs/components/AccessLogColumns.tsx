import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { formatLocalDateTimeShort } from '@/utils/format-date';

import { buildAccessLogEventLabels } from '../constants';
import type { AccessLogRESP } from '../api';
import { AccessLogEventType, AccessLogSortField } from '../enums';

export function getAccessLogColumns(t: TFunction<'page'>): ColumnDef<AccessLogRESP>[] {
  const eventLabels = buildAccessLogEventLabels(t);

  return [
    {
      id: 'no',
      header: t('system_logs.access.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      id: AccessLogSortField.LOGIN_ID,
      accessorKey: 'login_id',
      header: t('system_logs.access.columns.login_id'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='font-medium'>{row.original.login_id}</div>
          <div className='text-muted-foreground text-xs'>{row.original.username ?? row.original.user?.name ?? '-'}</div>
        </div>
      ),
    },
    {
      id: AccessLogSortField.IP_ADDRESS,
      accessorKey: 'ip_address',
      header: t('system_logs.access.columns.ip_address'),
      enableSorting: true,
    },
    {
      id: AccessLogSortField.CONNECTION_TIME,
      accessorKey: 'connection_time',
      header: t('system_logs.access.columns.connection_time'),
      enableSorting: true,
      cell: ({ row }) => formatLocalDateTimeShort(row.original.connection_time),
    },
    {
      accessorKey: 'browser_info',
      header: t('system_logs.access.columns.browser_info'),
      enableSorting: false,
    },
    {
      accessorKey: 'event_type',
      header: t('system_logs.access.columns.event_type'),
      enableSorting: false,
      // A failed login is still a login attempt; success/failure goes in the result column.
      cell: ({ row }) =>
        eventLabels[row.original.event_type === AccessLogEventType.LOGIN_FAILED ? AccessLogEventType.LOGIN : row.original.event_type],
    },
    {
      id: 'result',
      header: t('system_logs.access.columns.result'),
      enableSorting: false,
      cell: ({ row }) => {
        const failed = row.original.event_type === AccessLogEventType.LOGIN_FAILED;
        return (
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${failed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {t(failed ? 'system_logs.access.result.failed' : 'system_logs.access.result.success')}
          </span>
        );
      },
    },
    {
      accessorKey: 'failure_reason',
      header: t('system_logs.access.columns.failure_reason'),
      enableSorting: false,
      cell: ({ row }) => row.original.failure_reason || '-',
    },
  ];
}
