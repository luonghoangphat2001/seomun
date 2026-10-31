import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDatePickerFormField, AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth-store';
import { parseDateOnly } from '@/utils/format-date';

import type { EquipmentLogRESP } from '../api/equipment.response';
import { EquipmentLogCostType } from '../enums';
import { createEquipmentLogFormSchema, type EquipmentLogFormValues } from '../schemas/equipment-log-form.schema';

const buildDefaultValues = (manager: string, log?: EquipmentLogRESP | null): EquipmentLogFormValues => ({
  log_date: parseDateOnly(log?.log_date) ?? new Date(),
  maintenance_details: log?.maintenance_details ?? '',
  special_notes: log?.special_notes ?? '',
  cost_type: log?.cost_type ?? EquipmentLogCostType.PAID,
  manager: log?.manager ?? manager,
});

type EquipmentLogFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (values: EquipmentLogFormValues) => void;
  log?: EquipmentLogRESP | null;
};

export function EquipmentLogFormDialog({ open, onOpenChange, isPending, onSubmit, log }: EquipmentLogFormDialogProps) {
  const { t } = useTranslation('page');

  const managerName = useAuthStore((state) => state.user?.name ?? '');
  const isEdit = Boolean(log);

  const costTypeOptions = [
    { value: EquipmentLogCostType.PAID, label: t('orders.equipment.detail.log.cost_type.paid', 'Paid') },
    { value: EquipmentLogCostType.FREE, label: t('orders.equipment.detail.log.cost_type.free', 'Free') },
  ];

  const schema = useMemo(() => createEquipmentLogFormSchema(t), [t]);
  const form = useForm<EquipmentLogFormValues>({ resolver: zodResolver(schema), defaultValues: buildDefaultValues(managerName, log) });

  useEffect(() => {
    if (open) form.reset(buildDefaultValues(managerName, log));
  }, [form, log, managerName, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('orders.equipment.detail.log.form.edit_title', 'Edit Memo') : t('orders.equipment.detail.log.form.title', 'Add Memo')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <AppDatePickerFormField
              name='log_date'
              control={form.control}
              label={t('orders.equipment.detail.log.form.log_date', 'Date')}
              placeholder={t('orders.equipment.detail.log.form.log_date_placeholder', 'Select date')}
              required
            />
            <AppSelectFormField
              name='cost_type'
              control={form.control}
              label={t('orders.equipment.detail.log.form.cost_type', 'Cost Type')}
              placeholder={t('orders.equipment.detail.log.form.cost_type_placeholder', 'Select cost type')}
              options={costTypeOptions}
              required
            />
          </div>

          <AppTextareaFormField
            name='maintenance_details'
            control={form.control}
            label={t('orders.equipment.detail.log.form.maintenance_details', 'Maintenance Details')}
            placeholder={t('orders.equipment.detail.log.form.maintenance_details_placeholder', 'Enter maintenance details')}
            minRows={4}
            required
          />

          <AppTextareaFormField
            name='special_notes'
            control={form.control}
            label={t('orders.equipment.detail.log.form.special_notes', 'Special Notes')}
            placeholder={t('orders.equipment.detail.log.form.special_notes_placeholder', 'Enter special notes')}
            minRows={3}
          />

          <AppInputFormField
            name='manager'
            control={form.control}
            label={t('orders.equipment.detail.log.form.manager', 'Person in Charge')}
            placeholder={t('orders.equipment.detail.log.form.manager_placeholder', 'Enter person in charge')}
            required
          />

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
              {t('orders.equipment.detail.log.form.cancel', 'Cancel')}
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? t('orders.equipment.detail.log.form.saving', 'Saving...') : t('orders.equipment.detail.log.form.save', 'Save Memo')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
