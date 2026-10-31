import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { PermissionUsageStatus } from '../enums';
import type { PermissionRESP } from '../api/permission.response';

export const PERMISSION_STATUS_STYLES = {
  [PermissionUsageStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [PermissionUsageStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
} satisfies Record<PermissionUsageStatus, string>;

/** Users shown inline; the rest collapse into a "+N" button that opens the full list. */
const MAX_VISIBLE_USERS = 2;

type PermissionColumnsOptions = {
  onSettings: (permission: PermissionRESP) => void;
  onDelete: (permission: PermissionRESP) => void;
  t: TFunction;
};

function renderHeader(label: string) {
  return () => <span className='whitespace-nowrap'>{label}</span>;
}

export function getPermissionColumns({ onSettings, onDelete, t }: PermissionColumnsOptions): ColumnDef<PermissionRESP>[] {
  return [
    {
      accessorKey: 'name',
      header: renderHeader(t('page.permissions.list.columns.permission_name')),
      cell: ({ row }) => <span className='font-medium whitespace-nowrap'>{row.original.name}</span>,
      enableSorting: false,
    },
    {
      accessorKey: 'description',
      header: renderHeader(t('page.permissions.list.columns.description')),
      cell: ({ row }) => (
        <span className='text-muted-foreground block max-w-80 truncate text-sm' title={row.original.description}>
          {row.original.description || '-'}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'users',
      header: renderHeader(t('page.permissions.list.columns.users')),
      cell: ({ row }) => {
        const users = (row.original.users ?? []).map((user) => ({ id: user.id, label: `${user.name} (${user.username})` }));

        if (users.length === 0) {
          return <span className='text-muted-foreground text-sm'>-</span>;
        }

        const hiddenCount = users.length - MAX_VISIBLE_USERS;
        const countLabel = t('page.permissions.list.users_count', { count: users.length });

        return (
          <div className='flex items-center gap-1.5 text-sm whitespace-nowrap'>
            <span>
              {users
                .slice(0, MAX_VISIBLE_USERS)
                .map((user) => user.label)
                .join(', ')}
            </span>
            {hiddenCount > 0 && (
              <Popover>
                {/* The popover renders in a portal but its clicks still bubble to the row through React; stop them. */}
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    aria-label={countLabel}
                    onClick={(event) => event.stopPropagation()}
                    className='bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 data-[state=open]:bg-primary/15 data-[state=open]:text-foreground cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium tabular-nums transition-colors outline-none focus-visible:ring-3'
                  >
                    +{hiddenCount}
                  </button>
                </PopoverTrigger>
                <PopoverContent align='start' className='max-h-64 w-auto min-w-56 p-0' onClick={(event) => event.stopPropagation()}>
                  <div className='text-muted-foreground border-b px-3 py-2 text-xs font-medium'>{countLabel}</div>
                  <ul className='py-1'>
                    {users.map((user) => (
                      <li key={user.id} className='px-3 py-1.5 text-sm whitespace-nowrap'>
                        {user.label}
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'usage_status',
      header: renderHeader(t('page.permissions.list.columns.usage_status')),
      cell: ({ row }) => {
        const status = row.original.usage_status.value;

        return (
          <span className={`rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${PERMISSION_STATUS_STYLES[status]}`}>
            {status === PermissionUsageStatus.ACTIVE ? t('page.permissions.status.active') : t('page.permissions.status.inactive')}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => <span className='block text-center whitespace-nowrap'>{t('page.permissions.list.columns.actions')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        // Buttons sit inside a clickable row; keep their clicks from also triggering row navigation.
        <div className='flex justify-center gap-2' onClick={(event) => event.stopPropagation()}>
          <Button type='button' variant='outline' size='sm' onClick={() => onSettings(row.original)}>
            {t('page.permissions.list.actions.settings')}
          </Button>
          <Button type='button' variant='destructive' size='sm' onClick={() => onDelete(row.original)}>
            {t('common.action.delete')}
          </Button>
        </div>
      ),
    },
  ];
}
