import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { NotificationTemplateRESP } from '../api';
import { getNotificationTemplateUsageStatusLabel, sortNotificationChannelTypes } from '../constants';
import { NotificationTemplateSortField } from '../enums';

interface NotificationTemplateColumnsOptions {
  t: TFunction<'page'>;
  onOpenDetail: (template: NotificationTemplateRESP) => void;
  onEdit: (template: NotificationTemplateRESP) => void;
  onCopy: (template: NotificationTemplateRESP) => void;
  onDelete: (template: NotificationTemplateRESP) => void;
}

export function getNotificationTemplateColumns({
  t,
  onOpenDetail,
  onEdit,
  onCopy,
  onDelete,
}: NotificationTemplateColumnsOptions): ColumnDef<NotificationTemplateRESP>[] {
  return [
    {
      id: 'no',
      header: t('notifications.templates.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.index + 1}</span>,
    },
    {
      id: NotificationTemplateSortField.TEMPLATE_NUMBER,
      accessorKey: 'template_number',
      header: t('notifications.templates.columns.template_number'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.original.template_number}</span>,
    },
    {
      id: NotificationTemplateSortField.NAME,
      accessorKey: 'name',
      header: t('notifications.templates.columns.template_name'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='space-y-0.5'>
          <div className='font-medium'>{row.original.name}</div>
          <div className='text-muted-foreground text-xs'>
            {t('notifications.templates.columns.configured_channels', { count: row.original.channel_types.length })}
          </div>
        </div>
      ),
    },
    {
      id: 'channels',
      header: t('notifications.templates.columns.sending_type'),
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className='flex flex-wrap gap-1.5'>
            {sortNotificationChannelTypes(row.original.channel_types).map((channel) => (
              <Badge key={channel} variant='secondary' className='rounded-md px-2 py-0.5 text-xs'>
                {channel}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'usage_status',
      header: t('notifications.templates.columns.usage_status'),
      enableSorting: false,
      cell: ({ row }) => {
        return <span className='text-sm'>{getNotificationTemplateUsageStatusLabel(t, row.original.usage_status.value)}</span>;
      },
    },
    {
      id: 'registrant',
      header: t('notifications.templates.columns.registrant'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm'>{row.original.registrant.name}</span>,
    },
    {
      accessorKey: 'updated_at',
      header: t('notifications.templates.columns.last_updated'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.updated_at ?? row.original.created_at}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('notifications.templates.columns.actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center' onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type='button' variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onOpenDetail(row.original)} className='cursor-pointer'>
                <Eye className='mr-2 size-4' />
                {t('notifications.templates.columns.preview')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row.original)} className='cursor-pointer'>
                <Pencil className='mr-2 size-4' />
                {t('notifications.templates.columns.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(row.original)} className='cursor-pointer'>
                <Copy className='mr-2 size-4' />
                {t('notifications.templates.columns.copy')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(row.original)} className='cursor-pointer text-red-600 focus:text-red-600'>
                <Trash2 className='mr-2 size-4' />
                {t('notifications.templates.columns.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
