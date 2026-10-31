import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil, Pin, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ExposureStatus } from '@/enums';

import type { Notice } from '@/features/system-content/notices/api';
import type { NoticeType } from '../enums';
import { NOTICE_EXPOSURE_STATUS_OPTIONS, NOTICE_TYPE_OPTIONS } from '../..';

type NoticeColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  getEditTo: (noticeId: string) => string;
  onDelete?: (noticeId: string) => void;
};

export function getNoticeColumns({ t, tCommon, getEditTo, onDelete }: NoticeColumnsOptions): ColumnDef<Notice>[] {
  return [
    {
      accessorKey: 'id',
      header: t('notices.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      accessorKey: 'title',
      header: t('notices.columns.title'),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          {row.original.is_pinned && <Pin className='text-primary size-3.5' />}
          <span className='font-medium'>{row.original.title}</span>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'author',
      header: t('notices.columns.author'),
      cell: ({ row }) => <span>{row.original.author?.name ?? '-'}</span>,
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: t('notices.columns.type'),
      cell: ({ row }) => {
        const type = row.original.type as NoticeType | null;
        const getLabel = type ? NOTICE_TYPE_OPTIONS[type] : undefined;
        return <span>{getLabel ? getLabel(t) : '-'}</span>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'exposure_status',
      header: t('notices.columns.exposure'),
      cell: ({ row }) => (
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            row.original.exposure_status.value === ExposureStatus.EXPOSED ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {NOTICE_EXPOSURE_STATUS_OPTIONS[row.original.exposure_status.value](t)}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'view_count',
      header: t('notices.columns.views'),
      cell: ({ row }) => <span>{row.original.view_count.toLocaleString()}</span>,
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: t('notices.columns.created_at'),
      cell: ({ row }) => <span>{row.original.created_at ? row.original.created_at.slice(0, 10) : '-'}</span>,
      enableSorting: true,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('notices.columns.actions')}</div>,
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
