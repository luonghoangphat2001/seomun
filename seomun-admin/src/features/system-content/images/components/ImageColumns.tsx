import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Eye, File, FileText, ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { ImageRESP } from '../api';
import { IMAGE_CATEGORY_LABELS } from '../constants';
import { ImageSortField } from '../enums';

// === Variables ===

function FileThumbnail({ url, mimeType, name }: { url: string; mimeType: string; name: string }) {
  if (mimeType.startsWith('image/')) {
    return <img src={url} alt={name} className='h-full w-full object-cover' />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className='size-6 text-red-400' />;
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className='size-6 text-blue-400' />;
  }
  return <File className='text-muted-foreground size-6' />;
}

// === Types ===

type ImageColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
};

export function getImageColumns({ t, tCommon }: ImageColumnsOptions): ColumnDef<ImageRESP>[] {
  return [
    {
      id: 'no',
      header: t('images.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      id: 'thumbnail',
      header: t('images.columns.thumbnail'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='bg-muted/30 flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded border'>
          {row.original.url && row.original.mime_type ? (
            <FileThumbnail url={row.original.url} mimeType={row.original.mime_type} name={row.original.name} />
          ) : (
            <ImageIcon className='text-muted-foreground size-5' />
          )}
        </div>
      ),
    },
    {
      id: ImageSortField.NAME,
      accessorKey: 'name',
      header: t('images.columns.name'),
      enableSorting: true,
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='block max-w-60 cursor-default truncate text-sm font-medium'>{row.original.name}</span>
            </TooltipTrigger>
            <TooltipContent>{row.original.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      id: ImageSortField.TYPE,
      accessorKey: 'type',
      header: t('images.columns.category'),
      enableSorting: true,
      cell: ({ row }) => {
        const labelFn = IMAGE_CATEGORY_LABELS[row.original.type as keyof typeof IMAGE_CATEGORY_LABELS];
        const label = labelFn ? labelFn(t) : row.original.type;
        return <span className='bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium'>{label}</span>;
      },
    },
    {
      id: 'mime_type',
      header: t('images.columns.type'),
      cell: ({ row }) => <span className='bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium'>{row.original.mime_type}</span>,
    },
    {
      id: ImageSortField.CREATED_AT,
      accessorKey: 'created_at',
      header: t('images.columns.upload_date'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.created_at.slice(0, 10)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('images.columns.actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const imageId = String(row.original.id);
        return (
          <div className='flex justify-center gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link to='/system-content/images/$imageId' params={{ imageId }}>
                <Eye className='size-4' />
                {tCommon('action.view')}
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];
}
