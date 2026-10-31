import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber } from '@/utils/format-phone';

import { CustomerListWireStatus } from '../api/customer-list.request';
import type { CustomerMember } from '../../types/customer.type';
import { getCustomerStatusLabel, getMemberTypeLabel } from '../../utils/i18n';

const CUSTOMER_STATUS_BADGE_CLASSES: Record<CustomerListWireStatus, string> = {
  [CustomerListWireStatus.ACTIVE]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [CustomerListWireStatus.INACTIVE]: 'border-slate-200 bg-slate-50 text-slate-700',
  [CustomerListWireStatus.WITHDRAWN]: 'border-zinc-200 bg-zinc-100 text-zinc-600',
};

function normalizeCustomerListWireStatus(value: string): CustomerListWireStatus {
  const normalized = value.toLowerCase();
  if (normalized === CustomerListWireStatus.ACTIVE || normalized === CustomerListWireStatus.WITHDRAWN) return normalized;
  return CustomerListWireStatus.INACTIVE;
}

export function getCustomerListColumns(t: TFunction): ColumnDef<CustomerMember>[] {
  return [
    { accessorKey: 'id', header: '#', enableSorting: false },
    { accessorKey: 'name', header: t('page.customers.list.columns.name'), enableSorting: true },
    { accessorKey: 'username', header: t('page.customers.list.columns.username'), enableSorting: false },
    {
      accessorKey: 'companyName',
      header: t('page.customers.list.columns.company_name'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='max-w-56 truncate' title={row.original.companyName ?? undefined}>
          {row.original.companyName ?? '-'}
        </div>
      ),
    },
    { accessorKey: 'email', header: t('page.customers.list.columns.email'), enableSorting: false },
    {
      accessorKey: 'mobile',
      header: t('page.customers.list.columns.mobile'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='w-25' title={row.original.mobile ?? undefined}>
          {formatPhoneNumber(row.original.mobile)}
        </div>
      ),
    },
    {
      accessorKey: 'member_type',
      header: t('page.customers.list.columns.member_type'),
      enableSorting: false,
      cell: ({ row }) => getMemberTypeLabel(t, row.original.member_type),
    },
    {
      accessorKey: 'status',
      header: t('page.customers.list.columns.status'),
      cell: ({ row }) => {
        const status = normalizeCustomerListWireStatus(row.original.status.value);
        return (
          <Badge variant='outline' className={CUSTOMER_STATUS_BADGE_CLASSES[status]}>
            {getCustomerStatusLabel(t, status)}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'dateOfJoining',
      header: t('page.customers.list.columns.created_at'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='w-40' title={row.original.dateOfJoining ?? undefined}>
          {row.original.dateOfJoining ?? '-'}
        </div>
      ),
    },
    {
      accessorKey: 'note',
      header: t('page.customers.list.columns.note'),
      enableSorting: false,
      meta: { headerClassName: 'w-50' },
      cell: ({ row }) => (
        <div className='max-w-25 truncate' title={row.original.note ?? undefined}>
          {row.original.note ?? '-'}
        </div>
      ),
    },
  ];
}
