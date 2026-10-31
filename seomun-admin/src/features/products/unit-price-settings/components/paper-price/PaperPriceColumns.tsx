import type { ColumnDef } from '@tanstack/react-table';
import type { Paper } from '@/features/products/options';
import type { TFunction } from 'i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { PaperPrice } from '../../api';
import { getPaperSizeDivisionCodeLabel } from '../../constants';

export function getPaperPriceColumns(
  t: TFunction,
  papers: Paper[],
  onEdit: (paperPrice: PaperPrice) => void,
  onDelete: (paperPrice: PaperPrice) => void,
): ColumnDef<PaperPrice>[] {
  const paperNameById = new Map(papers.map((paper) => [paper.id, paper.name]));

  return [
    {
      accessorKey: 'paper_id',
      header: t('page.products.unit_price_settings.paper_price.columns.paper', 'Paper'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{paperNameById.get(row.original.paper_id) ?? row.original.paper_id}</span>,
    },
    {
      accessorKey: 'paper_size_division_code',
      header: t('page.products.unit_price_settings.paper_price.columns.paper_size', 'Paper size'),
      enableSorting: false,
      cell: ({ row }) => getPaperSizeDivisionCodeLabel(t, row.original.paper_size_division_code),
    },
    {
      accessorKey: 'supply_price',
      header: t('page.products.unit_price_settings.paper_price.columns.supply_price', 'Supply price'),
      enableSorting: false,
      cell: ({ row }) => <span className='block tabular-nums'>{row.original.supply_price.toLocaleString()}원</span>,
    },
    {
      accessorKey: 'cost',
      header: t('page.products.unit_price_settings.paper_price.columns.cost', 'Cost'),
      enableSorting: false,
      cell: ({ row }) => <span className='block tabular-nums'>{row.original.cost.toLocaleString()}원</span>,
    },
    {
      accessorKey: 'is_hot_deal',
      header: () => <span className='block text-center'>{t('page.products.unit_price_settings.paper_price.columns.status', 'Status')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.is_hot_deal ? (
            <Badge variant='secondary'>{t('page.products.unit_price_settings.paper_price.status.hot_deal', 'Hot deal')}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>{t('page.products.unit_price_settings.paper_price.status.none', 'None')}</span>
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
