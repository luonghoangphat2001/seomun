import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';

import { PERMISSION_USAGE_STATUS_OPTIONS } from '../constants';
import { PermissionUsageStatus } from '../enums';
import type { PermissionRESP } from '../api/permission.response';
import { getPermissionFormDefaultValues, permissionFormSchema, type PermissionFormValues } from '../schemas';

type PermissionFormDialogProps = {
  open: boolean;
  permission?: PermissionRESP | null;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PermissionFormValues) => void;
};

export function PermissionFormDialog({ open, permission, isPending = false, onOpenChange, onSubmit }: PermissionFormDialogProps) {
  const { t } = useTranslation();

  const statusOptions = PERMISSION_USAGE_STATUS_OPTIONS.map((option) => ({
    ...option,
    label: option.value === PermissionUsageStatus.ACTIVE ? t('page.permissions.status.active') : t('page.permissions.status.inactive'),
  }));

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: getPermissionFormDefaultValues(permission),
  });

  useEffect(() => {
    if (open) {
      form.reset(getPermissionFormDefaultValues(permission));
    }
  }, [form, open, permission]);

  return (
    <AppDialogModal
      isOpen={open}
      setIsOpen={onOpenChange}
      title={permission ? t('page.permissions.list.dialog.edit_title') : t('page.permissions.list.dialog.create_title')}
      onOk={form.handleSubmit(onSubmit)}
      okText={t('common.action.save')}
      cancelText={t('common.action.cancel')}
      confirmLoading={isPending}
      width={560}
    >
      <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
        <AppInputFormField
          name='name'
          control={form.control}
          label={t('page.permissions.list.form.permission_name')}
          placeholder={t('page.permissions.list.form.permission_name_placeholder')}
          disabled={isPending}
          required
        />
        <AppTextareaFormField
          name='description'
          control={form.control}
          label={t('page.permissions.list.form.description')}
          placeholder={t('page.permissions.list.form.description_placeholder')}
          disabled={isPending}
          className='min-h-10'
          rows={3}
        />
        <AppSelectFormField
          name='usage_status'
          control={form.control}
          label={t('page.permissions.list.form.usage_status')}
          placeholder={t('page.permissions.list.form.usage_status_placeholder')}
          options={statusOptions}
          disabled={isPending}
          clearable={false}
          required
        />
      </form>
    </AppDialogModal>
  );
}
