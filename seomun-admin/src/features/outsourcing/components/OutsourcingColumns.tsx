import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { OutsourcingRESP } from '../api';

type OutsourcingColumnsOptions = {
  getDetailTo: (outsourcingId: string) => string;
  getEditTo: (outsourcingId: string) => string;
  onDelete: (outsourcingId: number) => void;
  isDeleting?: boolean;
  t: TFunction<'page'>;
};

export function getOutsourcingColumns({
  getDetailTo,
  getEditTo,
  onDelete,
  isDeleting = false,
  t,
}: OutsourcingColumnsOptions): ColumnDef<OutsourcingRESP>[] {
  return [
    {
      id: 'no',
      header: t('outsourcing.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      accessorKey: 'name',
      header: t('outsourcing.columns.company_name'),
      enableSorting: false,
      cell: ({ row }) => <div className='font-medium'>{row.original.name}</div>,
    },
    {
      accessorKey: 'work_details',
      header: t('outsourcing.columns.work_details'),
      enableSorting: false,
      cell: ({ row }) => <div className='max-w-md truncate'>{row.original.work_details}</div>,
    },
    {
      accessorKey: 'representative_name',
      header: t('outsourcing.columns.representative'),
      enableSorting: false,
      cell: ({ row }) => <div>{row.original.representative_name}</div>,
    },
    {
      accessorKey: 'email',
      header: t('outsourcing.columns.email'),
      enableSorting: false,
      cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
      accessorKey: 'contact',
      header: t('outsourcing.columns.contact'),
      enableSorting: false,
      cell: ({ row }) => <div>{row.original.contact}</div>,
    },
    {
      accessorKey: 'address',
      header: t('outsourcing.columns.address'),
      enableSorting: false,
      cell: ({ row }) => <div className='max-w-md truncate'>{row.original.address}</div>,
    },
    {
      accessorKey: 'is_active',
      header: t('outsourcing.columns.status'),
      enableSorting: false,
      cell: ({ row }) => <div>{row.original.is_active ? t('outsourcing.status.active') : t('outsourcing.status.inactive')}</div>,
    },
    {
      id: 'actions',
      header: () => <span className='block text-center'>{t('outsourcing.columns.actions')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link to={getDetailTo(String(row.original.id))}>
              <Eye className='size-4' />
              {t('outsourcing.actions.view')}
            </Link>
          </Button>
          <Button variant='outline' size='sm' asChild>
            <Link to={getEditTo(String(row.original.id))}>
              <Pencil className='size-4' />
              {t('outsourcing.actions.edit')}
            </Link>
          </Button>
          <Button variant='destructive' size='sm' disabled={isDeleting} onClick={() => onDelete(row.original.id)}>
            <Trash2 className='size-4' />
            {t('outsourcing.actions.delete')}
          </Button>
        </div>
      ),
    },
  ];
}
