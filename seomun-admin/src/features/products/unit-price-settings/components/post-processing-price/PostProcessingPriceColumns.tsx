import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { PostProcessingPrice } from '../../api';
import { getPostProcessingSizeTypeLabel } from '../../constants';

export function getPostProcessingPriceColumns(
  t: TFunction,
  groupLabelById: Record<number, string>,
  onEdit: (postProcessingPrice: PostProcessingPrice) => void,
  onDelete: (postProcessingPrice: PostProcessingPrice) => void,
): ColumnDef<PostProcessingPrice>[] {
  return [
    {
      accessorKey: 'code',
      header: t('page.products.unit_price_settings.post_processing_price.columns.code', 'Code'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.code}</span>,
    },
    {
      accessorKey: 'post_processing_size_type',
      header: t('page.products.unit_price_settings.post_processing_price.columns.size_type', 'Size type'),
      enableSorting: false,
      cell: ({ row }) => getPostProcessingSizeTypeLabel(t, row.original.post_processing_size_type),
    },
    {
      id: 'erp_option_group',
      header: t('page.products.unit_price_settings.post_processing_price.columns.erp_option_group', 'Option group'),
      enableSorting: false,
      cell: ({ row }) => {
        const groupId = row.original.erp_option?.erp_option_group_id;
        if (groupId == null) {
          return <span className='text-muted-foreground'>-</span>;
        }

        return groupLabelById[groupId] ?? <span className='tabular-nums'>{groupId}</span>;
      },
    },
    {
      id: 'erp_option',
      header: t('page.products.unit_price_settings.post_processing_price.columns.erp_option', 'Option'),
      enableSorting: false,
      cell: ({ row }) => row.original.erp_option?.label ?? row.original.erp_option?.code ?? <span className='text-muted-foreground'>-</span>,
    },
    {
      id: 'items_count',
      header: () => (
        <span className='block text-center'>{t('page.products.unit_price_settings.post_processing_price.columns.items_count', 'Items')}</span>
      ),
      enableSorting: false,
      cell: ({ row }) => <span className='block text-center tabular-nums'>{row.original.post_processing_price_items?.length ?? 0}</span>,
    },
    {
      accessorKey: 'is_active',
      header: () => (
        <span className='block text-center'>{t('page.products.unit_price_settings.post_processing_price.columns.status', 'Status')}</span>
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.is_active ? (
            <Badge variant='secondary'>{t('page.products.unit_price_settings.post_processing_price.status.active', 'Active')}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>
              {t('page.products.unit_price_settings.post_processing_price.status.inactive', 'Inactive')}
            </span>
          )}
        </div>
      ),
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
