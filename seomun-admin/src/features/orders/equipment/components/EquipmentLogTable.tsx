import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { EquipmentLogRESP } from '../api/equipment.response';

type EquipmentLogTableProps = {
  logs: EquipmentLogRESP[];
  isLoading: boolean;
  onEdit: (log: EquipmentLogRESP) => void;
  onDelete: (log: EquipmentLogRESP) => void;
};

export function EquipmentLogTable({ logs, isLoading, onEdit, onDelete }: EquipmentLogTableProps) {
  const { t } = useTranslation('page');

  if (isLoading) {
    return <div className='text-muted-foreground text-sm'>{t('orders.equipment.detail.log.loading', 'Loading equipment logs...')}</div>;
  }

  if (logs.length === 0) {
    return <div className='text-muted-foreground text-sm'>{t('orders.equipment.detail.log.empty', 'No equipment logs found.')}</div>;
  }

  return (
    <div className='overflow-hidden rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('orders.equipment.detail.log.columns.date', 'Date')}</TableHead>
            <TableHead>{t('orders.equipment.detail.log.columns.maintenance', 'Maintenance Details')}</TableHead>
            <TableHead>{t('orders.equipment.detail.log.columns.special_notes', 'Special Notes')}</TableHead>
            <TableHead>{t('orders.equipment.detail.log.columns.cost_type', 'Cost Type')}</TableHead>
            <TableHead>{t('orders.equipment.detail.log.columns.manager', 'Person in Charge')}</TableHead>
            <TableHead className='w-24 text-center'>{t('orders.equipment.detail.log.columns.actions', 'Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.log_date}</TableCell>
              <TableCell className='whitespace-pre-wrap'>{log.maintenance_details}</TableCell>
              <TableCell>{log.special_notes || '-'}</TableCell>
              <TableCell>{t(`orders.equipment.detail.log.cost_type.${log.cost_type}`, log.cost_type)}</TableCell>
              <TableCell>{log.manager}</TableCell>
              <TableCell>
                <div className='flex justify-center gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0'
                    aria-label={t('orders.equipment.detail.log.form.edit_title', 'Edit Memo')}
                    onClick={() => onEdit(log)}
                  >
                    <Pencil className='size-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 text-red-600 hover:text-red-600'
                    aria-label={t('orders.equipment.detail.log.delete.title', 'Delete Memo')}
                    onClick={() => onDelete(log)}
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
