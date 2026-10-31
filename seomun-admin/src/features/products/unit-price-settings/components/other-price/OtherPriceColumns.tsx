import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utils/format-date';

import type { OtherUnitPrice } from '../../api';

export function getOtherPriceColumns(
  t: TFunction,
  onEdit: (item: OtherUnitPrice) => void,
  onDelete: (item: OtherUnitPrice) => void,
  onToggleStatus: (item: OtherUnitPrice) => void,
  togglingId: number | null,
): ColumnDef<OtherUnitPrice>[] {
  return [
    {
      accessorKey: 'product_id',
      header: t('page.products.unit_price_settings.other_price.columns.product', 'Product'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium'>{row.original.product?.name ?? '-'}</span>
          <span className='text-muted-foreground text-xs'>
            {row.original.product?.category?.name ? `${row.original.product.category.name} · ` : ''}#{row.original.product_id}
          </span>
        </div>
      ),
    },
    {
      id: 'size_option',
      header: t('page.products.unit_price_settings.other_price.columns.size_option', 'Size option'),
      enableSorting: false,
      cell: ({ row }) => row.original.erp_size_option?.label ?? row.original.erp_size_option_id ?? '-',
    },
    {
      id: 'paper_option',
      header: t('page.products.unit_price_settings.other_price.columns.paper_option', 'Paper option'),
      enableSorting: false,
      cell: ({ row }) => row.original.erp_paper_option?.label ?? row.original.erp_paper_option_id ?? '-',
    },
    {
      id: 'subject_master_option',
      header: t('page.products.unit_price_settings.other_price.columns.subject_master_option', 'Subject master option'),
      enableSorting: false,
      cell: ({ row }) => row.original.erp_subject_master_option?.label ?? row.original.erp_subject_master_option_id ?? '-',
    },
    {
      id: 'items_count',
      header: () => <span className='block text-center'>{t('page.products.unit_price_settings.other_price.columns.items_count', 'Items')}</span>,
      enableSorting: false,
      cell: ({ row }) => <span className='block text-center tabular-nums'>{row.original.items?.length ?? 0}</span>,
    },
    {
      accessorKey: 'is_active',
      header: () => <span className='block text-center'>{t('page.products.unit_price_settings.other_price.columns.status', 'Status')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <button
            type='button'
            onClick={() => onToggleStatus(row.original)}
            disabled={togglingId === row.original.id}
            className='cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
          >
            {row.original.is_active ? (
              <Badge variant='secondary'>{t('page.products.unit_price_settings.other_price.status.active', 'Active')}</Badge>
            ) : (
              <span className='text-muted-foreground text-sm'>{t('page.products.unit_price_settings.other_price.status.inactive', 'Inactive')}</span>
            )}
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: t('page.products.unit_price_settings.other_price.columns.created_at', 'Created at'),
      enableSorting: false,
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: 'actions',
      header: () => <span className='block text-center'>{t('page.products.unit_price_settings.columns.actions')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Button type='button' variant='outline' size='sm' onClick={() => onEdit(row.original)}>
            {t('common.action.edit')}
          </Button>
          <Button type='button' variant='destructive' size='sm' onClick={() => onDelete(row.original)}>
            {t('common.action.delete')}
          </Button>
        </div>
      ),
    },
  ];
}
