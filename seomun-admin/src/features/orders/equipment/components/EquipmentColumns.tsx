import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatPhoneNumber } from '@/utils/format-phone';

import type { EquipmentRESP } from '../api/equipment.response';
import { EquipmentStatus } from '../enums';

const statusStyles: Record<EquipmentStatus, string> = {
  [EquipmentStatus.ACTIVE]: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  [EquipmentStatus.INACTIVE]: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  [EquipmentStatus.MAINTENANCE]: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

type GetEquipmentColumnsParams = {
  t: TFunction<'page'>;
  onViewDetail: (equipmentId: number) => void;
  onDelete: (equipment: EquipmentRESP) => void;
};

export function getEquipmentColumns({ t, onViewDetail, onDelete }: GetEquipmentColumnsParams): ColumnDef<EquipmentRESP>[] {
  return [
    {
      accessorKey: 'company_name',
      header: t('orders.equipment.columns.company', 'Manufacturer Company'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.company_name}</span>,
    },
    {
      accessorKey: 'maintenance_company',
      header: t('orders.equipment.columns.maintenance_company', 'Maintenance Company'),
      enableSorting: false,
      cell: ({ row }) => row.original.maintenance_company ?? '-',
    },
    {
      accessorKey: 'manager_name',
      header: t('orders.equipment.columns.manager_name', 'Manager Name'),
      enableSorting: false,
      cell: ({ row }) => row.original.manager_name ?? '-',
    },
    {
      accessorKey: 'manager_phone',
      header: t('orders.equipment.columns.manager_phone', 'Manager Phone'),
      enableSorting: false,
      cell: ({ row }) => formatPhoneNumber(row.original.manager_phone) || '-',
    },
    {
      accessorKey: 'name',
      header: t('orders.equipment.columns.name', 'Equipment Name'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    },
    {
      accessorKey: 'work_process',
      header: t('orders.equipment.columns.work_process', 'Work Process'),
      enableSorting: false,
      cell: ({ row }) => t(`orders.equipment.work_process.${row.original.work_process}`, row.original.work_process),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('orders.equipment.columns.status', 'Status'),
      enableSorting: false,
      cell: ({ row }) => (
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusStyles[row.original.status]}`}>
          {t(`orders.equipment.status.${row.original.status}`, row.original.status)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('orders.equipment.columns.actions', 'Action')}</div>,
      enableSorting: false,
      size: 60,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type='button' variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onViewDetail(row.original.id)} className='cursor-pointer'>
                <Eye className='mr-2 size-4' />
                {t('orders.equipment.columns.detail', 'Detail')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(row.original)} className='cursor-pointer text-red-600 focus:text-red-600'>
                <Trash2 className='mr-2 size-4' />
                {t('orders.equipment.columns.delete', 'Delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
