import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { Copy, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { Template } from '../api';
import { TEMPLATE_STATUS_STYLES } from '../constants';
import { TemplateSortField } from '../enums';

interface TemplateColumnsOptions {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  onNavigateToDetail: (id: number) => void;
  onDelete: (id: number) => void;
  onCopy: (id: number) => void;
}

export function getTemplateColumns({ t, tCommon, onNavigateToDetail, onDelete, onCopy }: TemplateColumnsOptions): ColumnDef<Template>[] {
  return [
    {
      id: TemplateSortField.NAME,
      accessorKey: 'name',
      header: t('products.templates.list.columns.name', 'Template Name'),
      enableSorting: true,
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    },
    {
      id: TemplateSortField.IS_ACTIVE,
      accessorKey: 'status',
      header: t('products.templates.list.columns.status', 'Status'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${TEMPLATE_STATUS_STYLES[row.original.status.value]}`}>
          {tCommon(`status.${row.original.status.value}`, row.original.status.label)}
        </span>
      ),
    },
    {
      id: 'registrant',
      header: t('products.templates.list.columns.registrant', 'Registrant'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm'>{row.original.registrant?.name ?? '-'}</span>,
    },
    {
      id: TemplateSortField.UPDATED_AT,
      accessorKey: 'updated_at',
      header: t('products.templates.list.columns.updated_at', 'Last Modified'),
      enableSorting: true,
      cell: ({ row }) => {
        const updatedAt = dayjs(row.original.updated_at);
        return (
          <div className='text-sm'>
            <div>{updatedAt.format('YYYY-MM-DD HH:mm')}</div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1'>
          <Button variant='ghost' size='icon-sm' onClick={() => onCopy(row.original.id)} aria-label={tCommon('action.copy', 'Copy')}>
            <Copy className='size-4' />
          </Button>
          <Button variant='ghost' size='icon-sm' onClick={() => onNavigateToDetail(row.original.id)} aria-label={tCommon('action.edit', 'Edit')}>
            <Pencil className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon-sm'
            className='text-destructive'
            onClick={() => onDelete(row.original.id)}
            aria-label={tCommon('action.delete', 'Delete')}
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      ),
    },
  ];
}
