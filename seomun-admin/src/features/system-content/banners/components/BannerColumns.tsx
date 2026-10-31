import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ExposureStatus } from '@/enums';

import type { Banner } from '@/features/system-content/banners/api';
import { BANNER_EXPOSURE_STATUS_OPTIONS } from '../constants';

export const STATUS_STYLES: Record<ExposureStatus, string> = {
  [ExposureStatus.EXPOSED]: 'bg-green-100 text-green-800',
  [ExposureStatus.NON_EXPOSED]: 'bg-gray-100 text-gray-800',
};

type BannerColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  getEditTo: (bannerId: string) => string;
  onDelete?: (bannerId: string) => void;
};

export function getBannerColumns({ t, tCommon, getEditTo, onDelete }: BannerColumnsOptions): ColumnDef<Banner>[] {
  return [
    {
      id: 'no',
      header: t('banners.list.table.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      id: 'preview',
      header: t('banners.list.table.banner'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='bg-muted h-10 w-16 overflow-hidden rounded border'>
            {row.original.image_path && <img src={row.original.image_path} alt={row.original.name} className='h-full w-full object-cover' />}
          </div>
          <div className='space-y-1'>
            <div className='font-medium'>{row.original.name}</div>
            <div className='text-muted-foreground max-w-55 truncate text-xs'>{row.original.link_url}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'sort_order',
      header: t('banners.list.table.sort_order'),
      cell: ({ row }) => <div>{row.original.sort_order}</div>,
      enableSorting: false,
    },
    {
      id: 'period',
      header: () => <div className='text-center'>{t('banners.list.table.period')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-1 text-center text-xs'>
          <div>
            {row.original.exposure_start_date ? t('banners.list.table.period_start') + ': ' + row.original.exposure_start_date.slice(0, 10) : '-'}
          </div>
          <div>{row.original.exposure_end_date ? t('banners.list.table.period_end') + ': ' + row.original.exposure_end_date.slice(0, 10) : '-'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <div className='text-center'>{t('banners.list.table.status')}</div>,
      cell: ({ row }) => {
        const { value } = row.original.status;
        return (
          <div className='text-center'>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[value] ?? 'bg-gray-100 text-gray-800'}`}>
              {BANNER_EXPOSURE_STATUS_OPTIONS[value]?.(t)}
            </span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: t('banners.list.table.created_at'),
      cell: ({ row }) => <span>{row.original.created_at ? row.original.created_at.slice(0, 10) : '-'}</span>,
      enableSorting: false,
    },
    {
      accessorKey: 'updated_at',
      header: t('banners.list.table.updated_at'),
      cell: ({ row }) => <span>{row.original.updated_at ? row.original.updated_at.slice(0, 10) : '-'}</span>,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('banners.list.table.actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link to={getEditTo(String(row.original.id))}>
              <Pencil className='size-4' />
              {tCommon('action.edit')}
            </Link>
          </Button>
          <Button variant='destructive' size='sm' onClick={() => onDelete?.(String(row.original.id))}>
            <Trash2 className='size-4' />
            {tCommon('action.delete')}
          </Button>
        </div>
      ),
    },
  ];
}
