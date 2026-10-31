import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ExposureStatus } from '@/enums';

import type { Guide } from '../api/guide.response';
import { GUIDE_EXPOSURE_STATUS_OPTIONS, GUIDE_TYPE_OPTIONS } from '../constants';
import { GuideSortField, type GuideType } from '../enums';

const STATUS_STYLES: Record<ExposureStatus, string> = {
  [ExposureStatus.EXPOSED]: 'bg-green-100 text-green-800',
  [ExposureStatus.NON_EXPOSED]: 'bg-gray-100 text-gray-800',
};

type GuideColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
};

export function getGuideColumns({ t, tCommon }: GuideColumnsOptions): ColumnDef<Guide>[] {
  return [
    {
      id: 'no',
      header: t('guides.columns.no', 'No'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: t('guides.columns.type', 'Type'),
      enableSorting: false,
      cell: ({ row }) => {
        const type = row.original.type as GuideType | null;
        const label = type ? (GUIDE_TYPE_OPTIONS[type]?.(t) ?? row.original.type) : null;
        return label ? <span className='bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium'>{label}</span> : null;
      },
    },
    {
      id: GuideSortField.TITLE,
      accessorKey: 'title',
      header: t('guides.columns.title', 'Title'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='max-w-md space-y-0.5'>
          <div className='line-clamp-2 font-medium'>{row.original.title}</div>
          {row.original.author && <div className='text-muted-foreground text-xs'>{row.original.author.name}</div>}
        </div>
      ),
    },
    {
      id: 'status',
      header: t('guides.columns.status', 'Status'),
      enableSorting: false,
      cell: ({ row }) => {
        const value = row.original.exposure_status.value;
        return (
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[value] ?? 'bg-gray-100 text-gray-800'}`}>
            {GUIDE_EXPOSURE_STATUS_OPTIONS[value]?.(t)}
          </span>
        );
      },
    },
    {
      id: 'exposure_period',
      header: () => <div className='text-center'>{t('guides.form.field.exposure_period')}</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const { exposure_start_date, exposure_end_date } = row.original;
        if (!exposure_start_date && !exposure_end_date) return <div className='text-center'>-</div>;
        return (
          <div className='text-center text-xs whitespace-nowrap'>
            {exposure_start_date ? exposure_start_date.slice(0, 10) : '-'} ~ {exposure_end_date ? exposure_end_date.slice(0, 10) : '-'}
          </div>
        );
      },
    },
    {
      id: GuideSortField.CREATED_AT,
      accessorKey: 'created_at',
      header: t('guides.columns.created_at', 'Created At'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.created_at.slice(0, 10)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('guides.columns.actions', 'Actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const guideId = String(row.original.id);
        return (
          <div className='flex justify-center gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link to='/system-content/guides/$guideId' params={{ guideId }}>
                <Pencil className='size-4' />
                {tCommon('action.edit')}
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];
}
