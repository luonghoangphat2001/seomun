import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useForm, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDatePickerFormField, AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { FormMode } from '@/enums/form.enum';
import { PermissionUsageStatus, usePermissionsQuery } from '@/features/permissions';
import type { AdministratorRESP } from '../api/administrator.response';
import { ADMINISTRATOR_STATUS_OPTIONS } from '../constants';
import { createAdministratorFormSchema, getAdministratorFormDefaultValues, type AdministratorFormValues } from '../schemas';
import { getFirstFormError } from '../utils/administrator-form';

type AdministratorFormProps = {
  mode: FormMode;
  administrator?: AdministratorRESP;
  isPending?: boolean;
  // detail page view mode: every field is disabled
  readOnly?: boolean;
  onChangePassword?: () => void;
  // create mode only; edit mode is saved/cancelled from the detail page header via ADMINISTRATOR_FORM_ID
  onCancel?: () => void;
  onSubmit: (values: AdministratorFormValues) => void;
};

export const ADMINISTRATOR_FORM_ID = 'administrator-form';

export function AdministratorForm({ mode, administrator, isPending, readOnly, onChangePassword, onCancel, onSubmit }: AdministratorFormProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tForm } = useTranslation('form');
  const { t: tPage } = useTranslation('page');
  const { t: tValidation } = useTranslation('validation');
  const isEditMode = mode === FormMode.EDIT;
  const schema = useMemo(() => createAdministratorFormSchema(mode, tValidation, tForm), [mode, tValidation, tForm]);
  const statusOptions = useMemo(
    () =>
      ADMINISTRATOR_STATUS_OPTIONS.map((option) => ({
        ...option,
        label: tPage(`administrators.enums.statuses.${option.value}`, String(option.label ?? '')),
      })),
    [tPage],
  );

  const { data: permissionsResponse } = usePermissionsQuery({ usage_status: PermissionUsageStatus.ACTIVE, page: 1, per_page: 100 });
  const permissionOptions = useMemo(
    () => (permissionsResponse?.data?.permissions ?? []).map((permission) => ({ value: String(permission.id), label: permission.name })),
    [permissionsResponse],
  );

  const { control, handleSubmit, reset } = useForm<AdministratorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getAdministratorFormDefaultValues(mode, administrator),
    mode: 'all',
  });

  useEffect(() => {
    reset(getAdministratorFormDefaultValues(mode, administrator));
  }, [administrator, mode, reset]);

  const handleInvalidSubmit = (errors: FieldErrors<AdministratorFormValues>) => {
    const message = getFirstFormError(errors);

    if (message) {
      toast.error(message);
    }
  };

  return (
    <form id={ADMINISTRATOR_FORM_ID} onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} noValidate className='space-y-5'>
      {isEditMode ? (
        <div className='rounded-xl border p-5'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <p className='text-sm font-medium'>{tForm('administrators.fields.created_at.label')}</p>
              <p className='text-muted-foreground mt-1 text-sm'>{dayjs(administrator?.created_at).format('YYYY-MM-DD HH:mm')}</p>
            </div>
            <div>
              <p className='text-sm font-medium'>{tForm('administrators.fields.updated_at.label')}</p>
              <p className='text-muted-foreground mt-1 text-sm'>{dayjs(administrator?.updated_at).format('YYYY-MM-DD HH:mm')}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* AppTextarea keeps disabled:opacity-50, so restore it for the read-only view */}
      <fieldset disabled={readOnly} className='min-w-0 rounded-xl border p-5 [&_textarea:disabled]:opacity-100'>
        <h2 className='mb-4 text-base font-semibold'>{tForm('administrators.sections.account')}</h2>
        <div className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-4'>
            <AppSelectFormField
              mode='single'
              name='admin_permission_id'
              control={control}
              label={tForm('administrators.fields.permissions.label')}
              placeholder={tForm('administrators.fields.permissions.placeholder')}
              options={permissionOptions}
              searchable
              required
            />
            <AppSelectFormField
              name='status'
              control={control}
              label={tForm('administrators.fields.status.label')}
              placeholder={tForm('administrators.fields.status.placeholder')}
              options={statusOptions}
              clearable={false}
              required
            />
          </div>
          <div className='grid gap-4 md:grid-cols-4'>
            <AppInputFormField
              name='username'
              control={control}
              label={tForm('administrators.fields.username.label')}
              placeholder={tForm('administrators.fields.username.placeholder')}
              readOnly={isEditMode}
              required
              autoComplete='false'
            />
            {!isEditMode ? (
              <>
                <AppInputFormField
                  name='password'
                  control={control}
                  type='password'
                  label={tForm('administrators.fields.password.label')}
                  placeholder={tForm('administrators.fields.password.placeholder')}
                  required
                />
                <AppInputFormField
                  name='password_confirmation'
                  control={control}
                  type='password'
                  label={tForm('administrators.fields.password_confirmation.label')}
                  placeholder={tForm('administrators.fields.password_confirmation.placeholder')}
                  required
                />
              </>
            ) : !readOnly && onChangePassword ? (
              <div className='flex items-end'>
                <Button type='button' variant='outline' onClick={onChangePassword} disabled={isPending}>
                  {tForm('administrators.actions.change_password')}
                </Button>
              </div>
            ) : null}
          </div>
          <div className='grid gap-4 md:grid-cols-4'>
            <AppInputFormField
              name='name'
              control={control}
              label={tForm('administrators.fields.name.label')}
              placeholder={tForm('administrators.fields.name.placeholder')}
              required
            />
            <AppInputFormField
              name='mobile'
              control={control}
              label={tForm('administrators.fields.mobile.label')}
              placeholder={tForm('administrators.fields.mobile.placeholder')}
              required
            />
            <AppInputFormField
              name='email'
              control={control}
              type='email'
              label={tForm('administrators.fields.email.label')}
              placeholder={tForm('administrators.fields.email.placeholder')}
              readOnly={isEditMode}
              required={!isEditMode}
            />
          </div>
          <div className='grid gap-4 md:grid-cols-4'>
            <AppInputFormField
              name='department'
              control={control}
              label={tForm('administrators.fields.department.label')}
              placeholder={tForm('administrators.fields.department.placeholder')}
            />
            <AppInputFormField
              name='position'
              control={control}
              label={tForm('administrators.fields.position.label')}
              placeholder={tForm('administrators.fields.position.placeholder')}
            />
            <AppInputFormField
              name='phone'
              control={control}
              label={tForm('administrators.fields.phone.label')}
              placeholder={tForm('administrators.fields.phone.placeholder')}
            />
          </div>
          <div className='grid gap-4 md:grid-cols-4'>
            <AppDatePickerFormField
              name='hire_date'
              control={control}
              label={tForm('administrators.fields.hire_date.label')}
              placeholder={tForm('administrators.fields.hire_date.placeholder')}
              formatStr='yyyy-MM-dd'
              clearable
            />
            <AppDatePickerFormField
              name='resignation_date'
              control={control}
              label={tForm('administrators.fields.resignation_date.label')}
              placeholder={tForm('administrators.fields.resignation_date.placeholder')}
              formatStr='yyyy-MM-dd'
              clearable
            />
            <AppInputFormField
              name='bank_name'
              control={control}
              label={tForm('administrators.fields.bank_name.label')}
              placeholder={tForm('administrators.fields.bank_name.placeholder')}
            />
            <AppInputFormField
              name='account_number'
              control={control}
              label={tForm('administrators.fields.account_number.label')}
              placeholder={tForm('administrators.fields.account_number.placeholder')}
            />
          </div>
          <AppTextareaFormField
            name='note'
            control={control}
            label={tForm('administrators.fields.memo.label')}
            placeholder={tForm('administrators.fields.memo.placeholder')}
            minRows={4}
          />
        </div>
      </fieldset>

      {!isEditMode ? (
        <div className='flex items-center justify-end gap-3'>
          <Button type='button' variant='outline' className='h-10 px-4' onClick={onCancel} disabled={isPending}>
            {tCommon('action.cancel')}
          </Button>
          <AppButton type='submit' className='h-10 px-4' isLoading={isPending}>
            {tForm('administrators.actions.create')}
          </AppButton>
        </div>
      ) : null}
    </form>
  );
}
