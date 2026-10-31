import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { PrintingPrice } from '../../api';
import { getBookPrintingSizeTypeLabel, getBookPrintingTypeLabel, getPrintingMachineTypeLabel, getPrintSideTypeLabel } from '../../constants';

export function getPrintingPriceColumns(
  t: TFunction,
  onEdit: (printingPrice: PrintingPrice) => void,
  onDelete: (printingPrice: PrintingPrice) => void,
): ColumnDef<PrintingPrice>[] {
  return [
    {
      accessorKey: 'name',
      header: t('page.products.unit_price_settings.printing_price.columns.name', 'Name'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    },
    {
      accessorKey: 'machine_type',
      header: t('page.products.unit_price_settings.printing_price.columns.machine_type', 'Machine type'),
      enableSorting: false,
      cell: ({ row }) => getPrintingMachineTypeLabel(t, row.original.machine_type),
    },
    {
      accessorKey: 'book_printing_size_type',
      header: t('page.products.unit_price_settings.printing_price.columns.size_type', 'Size type'),
      enableSorting: false,
      cell: ({ row }) => getBookPrintingSizeTypeLabel(t, row.original.book_printing_size_type),
    },
    {
      accessorKey: 'side_type',
      header: t('page.products.unit_price_settings.printing_price.columns.side_type', 'Side type'),
      enableSorting: false,
      cell: ({ row }) => getPrintSideTypeLabel(t, row.original.side_type),
    },
    {
      accessorKey: 'book_printing_type',
      header: t('page.products.unit_price_settings.printing_price.columns.printing_type', 'Printing type'),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.book_printing_type ? (
          getBookPrintingTypeLabel(t, row.original.book_printing_type)
        ) : (
          <span className='text-muted-foreground'>-</span>
        ),
    },
    {
      id: 'items_count',
      header: () => <span className='block text-center'>{t('page.products.unit_price_settings.printing_price.columns.items_count', 'Items')}</span>,
      enableSorting: false,
      cell: ({ row }) => <span className='block text-center tabular-nums'>{row.original.printing_price_items?.length ?? 0}</span>,
    },
    {
      accessorKey: 'is_hot_deal',
      header: () => <span className='block text-center'>{t('page.products.unit_price_settings.printing_price.columns.status', 'Status')}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.is_hot_deal ? (
            <Badge variant='secondary'>{t('page.products.unit_price_settings.printing_price.status.hot_deal', 'Hot deal')}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>{t('page.products.unit_price_settings.printing_price.status.none', 'None')}</span>
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
