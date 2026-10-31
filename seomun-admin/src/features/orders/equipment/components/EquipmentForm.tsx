import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppSingleImageUpload } from '@/components/shared/app-single-image-upload';
import { AppDatePickerFormField, AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { blockNonDigitKey } from '@/utils/format-phone';

import { getEquipmentMachineTypeOptions, getEquipmentStatusOptions, getEquipmentWorkProcessOptions } from '../constants/equipment-options';
import { createEquipmentFormSchema, EQUIPMENT_FORM_DEFAULT_VALUES, type EquipmentFormValues } from '../schemas/equipment-form.schema';

type EquipmentFormProps = {
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: EquipmentFormValues) => void;
  mode?: 'create' | 'edit';
  defaultValues?: EquipmentFormValues;
};

export function EquipmentForm({ isPending, onCancel, onSubmit, mode = 'create', defaultValues }: EquipmentFormProps) {
  const { t } = useTranslation('page');

  const workProcessOptions = getEquipmentWorkProcessOptions(t);
  const machineTypeOptions = getEquipmentMachineTypeOptions();
  const statusOptions = getEquipmentStatusOptions(t);

  const schema = useMemo(() => createEquipmentFormSchema(t), [t]);
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? EQUIPMENT_FORM_DEFAULT_VALUES,
  });

  useEffect(() => {
    if (defaultValues) form.reset(defaultValues);
  }, [form, defaultValues]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='grid gap-4 md:grid-cols-2'>
          <AppInputFormField
            name='company_name'
            control={form.control}
            label={t('orders.equipment.form.company_name', 'Manufacturer Company')}
            placeholder={t('orders.equipment.form.company_name_placeholder', 'Enter manufacturer company')}
            required
          />
          <AppInputFormField
            name='name'
            control={form.control}
            label={t('orders.equipment.form.name', 'Equipment Name')}
            placeholder={t('orders.equipment.form.name_placeholder', 'Enter equipment name')}
            required
          />
          <AppSelectFormField
            name='machine_type'
            control={form.control}
            label={t('orders.equipment.form.machine_type', 'Machine Type')}
            placeholder={t('orders.equipment.form.machine_type_placeholder', 'Select machine type')}
            options={machineTypeOptions}
            clearable
          />
          <AppInputFormField
            name='maintenance_company'
            control={form.control}
            label={t('orders.equipment.form.maintenance_company', 'Maintenance Company')}
            placeholder={t('orders.equipment.form.maintenance_company_placeholder', 'Enter maintenance company')}
          />
          <AppInputFormField
            name='manager_name'
            control={form.control}
            label={t('orders.equipment.form.manager_name', 'Manager Name')}
            placeholder={t('orders.equipment.form.manager_name_placeholder', 'Enter manager name')}
          />
          <AppInputFormField
            name='manager_phone'
            control={form.control}
            label={t('orders.equipment.form.manager_phone', 'Manager Phone')}
            placeholder={t('orders.equipment.form.manager_phone_placeholder', 'Enter manager phone')}
            onKeyDown={blockNonDigitKey}
          />
          <AppDatePickerFormField
            name='introduced_at'
            control={form.control}
            label={t('orders.equipment.form.introduced_at', 'Introduced Date')}
            placeholder={t('orders.equipment.form.introduced_at_placeholder', 'Select introduced date')}
          />
          <AppSelectFormField
            name='work_process'
            control={form.control}
            label={t('orders.equipment.form.work_process', 'Work Process')}
            placeholder={t('orders.equipment.form.work_process_placeholder', 'Select work process')}
            options={workProcessOptions}
            required
          />
          <AppSelectFormField
            name='status'
            control={form.control}
            label={t('orders.equipment.form.status', 'Status')}
            placeholder={t('orders.equipment.form.status_placeholder', 'Select status')}
            options={statusOptions}
            required
          />
          <div className='md:col-span-2'>
            <AppTextareaFormField
              name='notes'
              control={form.control}
              label={t('orders.equipment.form.note', 'Note')}
              placeholder={t('orders.equipment.form.note_placeholder', 'Add equipment notes')}
              minRows={4}
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Controller
            name='image'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2'>
                <p className='text-sm font-medium'>{t('orders.equipment.form.image', 'Image')}</p>
                <AppSingleImageUpload
                  value={field.value}
                  onChange={(value) => field.onChange(value instanceof File ? value : null)}
                  isUploading={isPending}
                  error={fieldState.error?.message}
                  label={t('orders.equipment.form.upload_label', 'Upload equipment image')}
                  description={t('orders.equipment.form.upload_description', 'JPEG, PNG, WEBP up to 5MB')}
                />
              </div>
            )}
          />
        </div>
      </div>

      <div className='flex items-center justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
          {t('orders.equipment.form.cancel', 'Cancel')}
        </Button>
        <Button type='submit' disabled={isPending}>
          {mode === 'edit'
            ? isPending
              ? t('orders.equipment.form.saving', 'Saving...')
              : t('orders.equipment.form.save', 'Save Changes')
            : isPending
              ? t('orders.equipment.form.submitting', 'Registering...')
              : t('orders.equipment.form.submit', 'Register Equipment')}
        </Button>
      </div>
    </form>
  );
}
