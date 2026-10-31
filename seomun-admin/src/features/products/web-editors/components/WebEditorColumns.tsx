import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { WebEditorRES } from '../api';
import { WEB_EDITOR_TYPE_TRANSLATION_KEYS } from '../constants';
import { WebEditorStatus } from '../enums';

type WebEditorColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  onNavigateToDetail: (id: number) => void;
  onDelete: (id: number) => void;
};

export function getWebEditorColumns({ t, tCommon, onNavigateToDetail, onDelete }: WebEditorColumnsOptions): ColumnDef<WebEditorRES>[] {
  return [
    {
      id: 'no',
      header: t('products.web_editors.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm'>{row.index + 1}</span>,
    },
    {
      accessorKey: 'name',
      header: t('products.web_editors.columns.name'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    },
    {
      accessorKey: 'type',
      header: t('products.web_editors.columns.type'),
      enableSorting: false,
      cell: ({ row }) => {
        const key = WEB_EDITOR_TYPE_TRANSLATION_KEYS[row.original.type as keyof typeof WEB_EDITOR_TYPE_TRANSLATION_KEYS];
        return <span>{key ? t(key) : row.original.type}</span>;
      },
    },
    {
      accessorKey: 'dpi',
      header: t('products.web_editors.columns.dpi'),
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.dpi}</span>,
    },
    {
      accessorKey: 'status',
      header: t('products.web_editors.columns.status'),
      enableSorting: false,
      cell: ({ row }) => {
        const statusValue = row.original.status.value;
        const isActive = statusValue === WebEditorStatus.ACTIVE;
        return (
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {t(`products.web_editors.enum.status.${statusValue}`)}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: t('products.web_editors.columns.created_at'),
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.created_at?.slice(0, 10) ?? '-'}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('products.web_editors.columns.actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Button variant='outline' size='sm' onClick={() => onNavigateToDetail(row.original.id)}>
            <Pencil className='size-4' />
            {tCommon('action.edit')}
          </Button>
          <Button variant='destructive' size='sm' onClick={() => onDelete(row.original.id)}>
            <Trash2 className='size-4' />
            {tCommon('action.delete')}
          </Button>
        </div>
      ),
    },
  ];
}
