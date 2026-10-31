import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ExposureStatus } from '@/enums';

import type { Popup } from '../api/popup.response';
import { POPUP_EXPOSURE_LOCATION_OPTIONS, POPUP_EXPOSURE_STATUS_OPTIONS, type PopupExposureLocation } from '../constants';
import { PopupImagePreviewModal } from './PopupImagePreviewModal';

export const STATUS_STYLES: Record<ExposureStatus, string> = {
  [ExposureStatus.EXPOSED]: 'bg-green-100 text-green-800',
  [ExposureStatus.NON_EXPOSED]: 'bg-gray-100 text-gray-800',
};

type PopupColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  getEditTo: (popupId: string) => string;
  onDelete?: (popupId: string) => void;
};

export function getPopupColumns({ t, tCommon, getEditTo, onDelete }: PopupColumnsOptions): ColumnDef<Popup>[] {
  return [
    {
      id: 'no',
      header: t('popups.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      id: 'image',
      header: t('popups.columns.image'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='group bg-muted relative h-10 w-16 overflow-hidden rounded border'>
          {row.original.image_path ? (
            <>
              <img src={row.original.image_path} alt={row.original.name} className='h-full w-full object-cover' />
              <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <PopupImagePreviewModal
                  url={row.original.image_path}
                  name={row.original.name}
                  size={row.original.size_settings}
                  className='text-white'
                />
              </div>
            </>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: t('popups.columns.popup'),
      enableSorting: true,
      cell: ({ row }) => {
        const loc = row.original.exposure_location;
        const locLabel = loc ? (POPUP_EXPOSURE_LOCATION_OPTIONS[loc as PopupExposureLocation]?.(t) ?? loc) : null;
        return (
          <div className='space-y-0.5'>
            <div className='font-medium'>{row.original.name}</div>
            {locLabel && <div className='text-muted-foreground text-xs'>{locLabel}</div>}
          </div>
        );
      },
    },
    {
      id: 'size',
      header: t('popups.columns.size'),
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original.size_settings;
        return <span className='text-sm tabular-nums'>{s ? `${s.width} × ${s.height}` : '-'}</span>;
      },
    },
    {
      id: 'period',
      header: () => <div className='text-center'>{t('popups.columns.period')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-1 text-center text-xs'>
          <div>
            {row.original.exposure_start_date?.slice(0, 10)
              ? t('popups.columns.period_start') + ': ' + row.original.exposure_start_date?.slice(0, 10)
              : '-'}
          </div>
          <div>
            {row.original.exposure_end_date?.slice(0, 10)
              ? t('popups.columns.period_end') + ': ' + row.original.exposure_end_date?.slice(0, 10)
              : '-'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <div className='text-center'>{t('popups.columns.status')}</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const { value } = row.original.status;
        return (
          <div className='text-center'>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[value] ?? 'bg-gray-100 text-gray-800'}`}>
              {POPUP_EXPOSURE_STATUS_OPTIONS[value]?.(t)}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('popups.columns.actions')}</div>,
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
