import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utils/format-date';

import type { ErpOptionGroupRESP, ErpOptionRESP, Paper, SizeOption } from '../api/option.response';
import { getErpOptionGroupTypeLabel, getPaperCategoryLabel, getPaperStatusLabel } from '../constants/option.constants';
import { ErpOptionGroupSortField, PaperStatusValue } from '../enums';

export function getErpOptionGroupColumns(t: TFunction): ColumnDef<ErpOptionGroupRESP>[] {
  return [
    {
      accessorKey: 'id',
      header: t('page.products.options.columns.id'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.original.id}</span>,
    },
    {
      id: ErpOptionGroupSortField.CODE,
      accessorKey: 'code',
      header: t('page.products.options.columns.code'),
      enableSorting: true,
      cell: ({ row }) => <span className='font-medium'>{row.original.code}</span>,
    },
    {
      id: ErpOptionGroupSortField.LABEL,
      accessorKey: 'label',
      header: t('page.products.options.columns.label'),
      enableSorting: true,
    },
    {
      id: ErpOptionGroupSortField.TYPE,
      accessorKey: 'type',
      header: t('page.products.options.columns.type'),
      enableSorting: true,
      cell: ({ row }) => getErpOptionGroupTypeLabel(t, row.original.type),
    },
    // {
    //   id: ErpOptionGroupSortField.DISPLAY_TYPE,
    //   accessorKey: 'display_type',
    //   header: t('page.products.options.columns.display_type'),
    //   enableSorting: true,
    // },
    // {
    //   id: ErpOptionGroupSortField.IS_REQUIRED,
    //   accessorKey: 'is_required',
    //   header: t('page.products.options.columns.required'),
    //   enableSorting: true,
    //   cell: ({ row }) => (row.original.is_required ? t('common.yes') : t('common.no')),
    // },
    // {
    //   accessorKey: 'sort_order',
    //   header: t('page.products.options.columns.sort_order'),
    //   enableSorting: false,
    // },
    {
      id: ErpOptionGroupSortField.CREATED_AT,
      accessorKey: 'created_at',
      header: t('page.products.options.columns.created_at'),
      enableSorting: true,
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: 'actions',
      header: t('page.products.options.columns.actions'),
      enableSorting: false,
      cell: ({ row }) => (
        <Button asChild variant='outline' size='sm'>
          <Link to='/products/options/$groupId' params={{ groupId: String(row.original.id) }}>
            {t('page.products.options.actions.detail')}
          </Link>
        </Button>
      ),
    },
  ];
}

export function getErpOptionColumns(
  t: TFunction,
  onEdit: (option: ErpOptionRESP) => void,
  onDelete: (option: ErpOptionRESP) => void,
  showValue = false,
): ColumnDef<ErpOptionRESP>[] {
  return [
    {
      accessorKey: 'id',
      header: t('page.products.options.columns.id'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.original.id}</span>,
    },
    {
      accessorKey: 'code',
      header: t('page.products.options.columns.code'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.code}</span>,
    },
    {
      accessorKey: 'label',
      header: t('page.products.options.columns.label'),
      enableSorting: false,
    },
    ...(showValue
      ? [
          {
            accessorKey: 'value',
            header: t('page.products.options.columns.value'),
            enableSorting: false,
          } satisfies ColumnDef<ErpOptionRESP>,
        ]
      : []),
    {
      accessorKey: 'status_label',
      header: t('page.products.options.columns.status'),
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: t('page.products.options.columns.created_at'),
      enableSorting: false,
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: 'actions',
      header: () => <span className='block text-center'>{t('page.products.options.columns.actions')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Button type='button' variant='outline' size='sm' onClick={() => onEdit(row.original)}>
            {t('page.products.options.actions.detail')}
          </Button>
          <Button type='button' variant='destructive' size='sm' onClick={() => onDelete(row.original)}>
            {t('common.action.delete')}
          </Button>
        </div>
      ),
    },
  ];
}

export function getSizeOptionColumns(t: TFunction, onEdit: (option: SizeOption) => void): ColumnDef<SizeOption>[] {
  return [
    { accessorKey: 'id', header: t('page.products.options.columns.id'), enableSorting: false },
    { accessorKey: 'name', header: t('page.products.options.columns.name'), enableSorting: false },
    {
      accessorKey: 'cutting_width',
      header: t('page.products.options.columns.cutting_width'),
      enableSorting: false,
      cell: ({ row }) => `${row.original.cutting_width}mm`,
    },
    {
      accessorKey: 'cutting_height',
      header: t('page.products.options.columns.cutting_height'),
      enableSorting: false,
      cell: ({ row }) => `${row.original.cutting_height}mm`,
    },
    {
      accessorKey: 'working_width',
      header: t('page.products.options.columns.working_width'),
      enableSorting: false,
      cell: ({ row }) => `${row.original.working_width}mm`,
    },
    {
      accessorKey: 'working_height',
      header: t('page.products.options.columns.working_height'),
      enableSorting: false,
      cell: ({ row }) => `${row.original.working_height}mm`,
    },
    {
      accessorKey: 'created_at',
      header: t('page.products.options.columns.created_at'),
      enableSorting: false,
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: 'actions',
      header: t('page.products.options.columns.actions'),
      enableSorting: false,
      cell: ({ row }) => (
        <Button type='button' variant='outline' size='sm' onClick={() => onEdit(row.original)}>
          {t('page.products.options.actions.detail')}
        </Button>
      ),
    },
  ];
}

export function getPaperColumns(t: TFunction, onEdit: (paper: Paper) => void, onDelete: (paper: Paper) => void): ColumnDef<Paper>[] {
  return [
    { accessorKey: 'id', header: t('page.products.options.columns.id'), enableSorting: false },
    {
      accessorKey: 'category',
      header: t('page.products.options.columns.category'),
      enableSorting: false,
      cell: ({ row }) => getPaperCategoryLabel(t, row.original.category),
    },
    { accessorKey: 'name', header: t('page.products.options.columns.name'), enableSorting: false },
    {
      accessorKey: 'is_active',
      header: t('page.products.options.columns.is_active'),
      enableSorting: false,
      cell: ({ row }) => getPaperStatusLabel(t, row.original.is_active ? PaperStatusValue.ACTIVE : PaperStatusValue.HIDDEN),
    },
    {
      accessorKey: 'created_at',
      header: t('page.products.options.columns.created_at'),
      enableSorting: false,
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: 'actions',
      header: t('page.products.options.columns.actions'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <Button type='button' variant='outline' size='sm' onClick={() => onEdit(row.original)}>
            {t('page.products.options.actions.detail')}
          </Button>
          <Button type='button' variant='destructive' size='sm' onClick={() => onDelete(row.original)}>
            {t('common.action.delete')}
          </Button>
        </div>
      ),
    },
  ];
}
