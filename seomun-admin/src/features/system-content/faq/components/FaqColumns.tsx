import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ExposureStatus } from '@/enums';

import { FAQ_POSTING_STATUS_LABELS, getFaqCategoryOptions } from '../constants';
import { FaqSortField } from '../enums';
import type { FaqRESP } from '../api/faq.response';

const STATUS_STYLES: Record<ExposureStatus, string> = {
  [ExposureStatus.EXPOSED]: 'bg-green-100 text-green-800',
  [ExposureStatus.NON_EXPOSED]: 'bg-gray-100 text-gray-800',
};

type FaqColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  onDelete?: (faqId: string) => void;
};

export function getFaqColumns({ t, tCommon, onDelete }: FaqColumnsOptions): ColumnDef<FaqRESP>[] {
  return [
    {
      id: 'no',
      header: t('faqs.list.table.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      id: FaqSortField.CATEGORY,
      accessorKey: 'category',
      header: t('faqs.list.table.category'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className='bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium'>
          {getFaqCategoryOptions(t)[getFaqCategoryOptions(t).findIndex((o) => o.value === row.original.category)]?.label ?? row.original.category}
        </span>
      ),
    },
    {
      id: FaqSortField.TITLE,
      accessorFn: (row) => row.question,
      header: t('faqs.list.table.question'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='max-w-md space-y-0.5'>
          <div className='line-clamp-2 font-medium'>{row.original.question}</div>
          {row.original.author && <div className='text-muted-foreground text-xs'>{row.original.author.name}</div>}
        </div>
      ),
    },
    {
      id: 'status',
      header: t('faqs.list.table.status'),
      enableSorting: false,
      cell: ({ row }) => {
        const val = row.original.posting_status.value;
        return (
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[val] ?? 'bg-gray-100 text-gray-800'}`}>
            {FAQ_POSTING_STATUS_LABELS[val]?.(t) ?? val}
          </span>
        );
      },
    },
    {
      id: 'view_count',
      accessorKey: 'view_count',
      header: t('faqs.list.table.views'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm tabular-nums'>{row.original.view_count.toLocaleString()}</span>,
    },
    {
      id: FaqSortField.CREATED_AT,
      accessorKey: 'created_at',
      header: t('faqs.list.table.created_at'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.created_at.slice(0, 10)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('faqs.list.table.actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link to='/system-content/faqs/$faqId' params={{ faqId: String(row.original.id) }}>
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
