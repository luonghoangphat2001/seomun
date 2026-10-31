import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPhoneNumber } from '@/utils/format-phone';

import { ADMINISTRATOR_STATUS_LABELS } from '../constants/index';
import { AdministratorSortField, AdministratorStatus } from '../enums/index';
import type { AdministratorRESP } from '../api/administrator.response';

const STATUS_STYLES: Record<AdministratorStatus, string> = {
  [AdministratorStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [AdministratorStatus.INACTIVE]: 'bg-gray-100 text-gray-700',
};

const PERMISSION_GROUP_STYLES: Record<string, string> = {
  최고관리자: 'bg-yellow-100 text-yellow-800',
  총괄관리자: 'bg-green-100 text-green-800',
  관리자: 'bg-red-100 text-red-800',
  담당자: 'border bg-white text-gray-700',
  일반: 'border bg-white text-gray-700',
};

function renderHeader(label: string, className = 'min-w-24', alignClassName = '') {
  return () => <span className={`block whitespace-nowrap ${className} ${alignClassName}`}>{label}</span>;
}

function renderTextCell(value?: string | null, className = 'min-w-24') {
  return (
    <div className={`${className} max-w-48 truncate whitespace-nowrap`} title={value || undefined}>
      {value || '-'}
    </div>
  );
}

const formatDate = (value?: string | null) => (value ? dayjs(value).format('YYYY-MM-DD') : null);

export function getAdministratorColumns(
  t: TFunction<'page'>,
  tCommon: TFunction<'common'>,
  onDelete: (administrator: AdministratorRESP) => void,
  canManageAdministrator: (administrator: AdministratorRESP) => boolean,
): ColumnDef<AdministratorRESP>[] {
  return [
    {
      id: AdministratorSortField.STATUS,
      accessorKey: 'status',
      header: renderHeader(t('administrators.list.table.status'), 'min-w-20', 'text-center'),
      cell: ({ row }) => {
        const status = row.original?.status;

        return status && STATUS_STYLES[status] ? (
          <div className='flex min-w-20 justify-center'>
            <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status]}`}>
              {t(`administrators.enums.statuses.${status}`, ADMINISTRATOR_STATUS_LABELS[status] ?? '-')}
            </span>
          </div>
        ) : (
          <span className='text-muted-foreground block min-w-20 text-center text-sm whitespace-nowrap'>-</span>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'permission_groups',
      header: renderHeader(t('administrators.list.table.permission_group'), 'min-w-36', 'text-center'),
      cell: ({ row }) => {
        const groups = row.original?.permission_groups ?? [];

        return (
          <div className='flex min-w-36 flex-wrap justify-center gap-1'>
            {groups.length
              ? groups.map((group) => (
                  <span
                    key={group.id}
                    className={`inline-flex rounded px-2 py-1 text-xs font-medium whitespace-nowrap ${PERMISSION_GROUP_STYLES[group.name.trim()] ?? 'bg-muted'}`}
                  >
                    {group.name}
                  </span>
                ))
              : '-'}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: AdministratorSortField.NAME,
      accessorKey: 'name',
      header: renderHeader(t('administrators.list.table.name_username'), ''),
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='max-w-56 truncate font-medium' title={row.original?.name ?? undefined}>
            {row.original?.name ?? '-'}
          </div>
          <div className='text-muted-foreground max-w-56 truncate text-xs' title={row.original?.username ?? undefined}>
            {row.original?.username ?? '-'}
          </div>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'department',
      header: renderHeader(t('administrators.list.table.department')),
      cell: ({ row }) => renderTextCell(row.original?.department),
      enableSorting: false,
    },
    {
      id: AdministratorSortField.EMAIL,
      accessorKey: 'email',
      header: renderHeader(t('administrators.list.table.mobile_email'), ''),
      cell: ({ row }) => {
        const mobile = formatPhoneNumber(row.original?.mobile);

        return (
          <div className='space-y-1'>
            <div className='max-w-72 truncate' title={mobile || undefined}>
              {mobile || '-'}
            </div>
            <div className='text-muted-foreground max-w-72 truncate text-xs' title={row.original?.email ?? undefined}>
              {row.original?.email ?? '-'}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'hire_date',
      header: renderHeader(t('administrators.list.table.hire_date')),
      cell: ({ row }) => renderTextCell(formatDate(row.original?.hire_date)),
      enableSorting: false,
    },
    {
      accessorKey: 'resignation_date',
      header: renderHeader(t('administrators.list.table.resignation_date')),
      cell: ({ row }) => renderTextCell(formatDate(row.original?.resignation_date)),
      enableSorting: false,
    },
    {
      accessorKey: 'bank_name',
      header: renderHeader(t('administrators.list.table.bank_name')),
      cell: ({ row }) => renderTextCell(row.original?.bank_name),
      enableSorting: false,
    },
    {
      accessorKey: 'account_number',
      header: renderHeader(t('administrators.list.table.account_number'), 'min-w-32'),
      cell: ({ row }) => renderTextCell(row.original?.account_number, 'min-w-32'),
      enableSorting: false,
    },
    {
      accessorKey: 'last_login_at',
      header: renderHeader(t('administrators.list.table.last_login'), 'min-w-40'),
      cell: ({ row }) => {
        const lastLoginAt = row.original?.last_login_at ? dayjs(row.original.last_login_at).format('YYYY-MM-DD HH:mm') : '-';

        return (
          <div className='min-w-40 space-y-1'>
            <div className='max-w-40 truncate' title={lastLoginAt === '-' ? undefined : lastLoginAt}>
              {lastLoginAt}
            </div>
            <div className='text-muted-foreground max-w-40 truncate text-xs' title={row.original?.last_login_ip || undefined}>
              {row.original?.last_login_ip || '-'}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => <span className='block min-w-24 text-center whitespace-nowrap'>{t('administrators.list.table.actions')}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const canManage = canManageAdministrator(row.original);

        if (!canManage) {
          return null;
        }

        return (
          <div className='flex min-w-24 justify-center whitespace-nowrap'>
            <Button
              variant='destructive'
              size='sm'
              className='h-9'
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row.original);
              }}
            >
              <Trash2 className='size-4' />
              {tCommon('action.delete')}
            </Button>
          </div>
        );
      },
    },
  ];
}
