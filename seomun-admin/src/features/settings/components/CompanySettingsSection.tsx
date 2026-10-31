import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/utils/api-error';

import { useDeleteCompanyStampMutation, useUpdateCompanySettingsMutation, useUploadCompanyStampMutation } from '../api/company-settings.query';
import type { CompanySettings } from '../api/company-settings.response';
import { SETTINGS_FIELD_CLASS } from '../constants';
import { createCompanySettingsFormSchema, getCompanySettingsFormDefaultValues, type CompanySettingsFormValues } from '../schemas';
import { CompanyStampField, type StampDraft } from './CompanyStampField';
import { SettingsFormCard } from './SettingsFormCard';

export function CompanySettingsSection({ settings }: { settings: CompanySettings }) {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const [stampDraft, setStampDraft] = useState<StampDraft>(null);

  const schema = useMemo(() => createCompanySettingsFormSchema(t, tValidation), [t, tValidation]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getCompanySettingsFormDefaultValues(settings),
  });

  const updateMutation = useUpdateCompanySettingsMutation({
    onSuccess: (_response, values) => reset(values),
    onError: (error) => toast.error(getApiErrorMessage(error, t('settings.company.messages.save_error'))),
  });

  const uploadStampMutation = useUploadCompanyStampMutation({
    onSuccess: () => setStampDraft(null),
    onError: (error) => toast.error(getApiErrorMessage(error, t('settings.stamp.upload_error'))),
  });

  const deleteStampMutation = useDeleteCompanyStampMutation({
    onSuccess: () => setStampDraft(null),
    onError: (error) => toast.error(getApiErrorMessage(error, t('settings.stamp.delete_error'))),
  });

  // ============================================================================
  // Variables
  // ============================================================================
  const isSaving = updateMutation.isPending || uploadStampMutation.isPending || deleteStampMutation.isPending;
  const hasChanges = isDirty || stampDraft !== null;
  const fieldProps = { control, disabled: isSaving, fieldClassName: SETTINGS_FIELD_CLASS } as const;

  // ============================================================================
  // Functions
  // ============================================================================
  const onSubmit = async (values: CompanySettingsFormValues) => {
    try {
      if (isDirty) await updateMutation.mutateAsync(values);
      if (stampDraft === 'delete') await deleteStampMutation.mutateAsync();
      else if (stampDraft) await uploadStampMutation.mutateAsync(stampDraft);
      toast.success(t('settings.company.messages.save_success'));
    } catch {
      // Already toasted by the mutation's onError.
    }
  };

  const handleReset = () => {
    reset(getCompanySettingsFormDefaultValues(settings));
    setStampDraft(null);
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    reset(getCompanySettingsFormDefaultValues(settings), { keepDirtyValues: true });
  }, [settings, reset]);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <SettingsFormCard
      title={t('settings.company.title')}
      description={t('settings.company.description')}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <>
          <Button type='button' variant='ghost' className='gap-2' onClick={handleReset} disabled={!hasChanges || isSaving}>
            <RotateCcw className='size-4' aria-hidden='true' />
            {tCommon('action.reset')}
          </Button>

          <AppButton type='submit' isLoading={isSaving} disabled={!hasChanges}>
            {tCommon('action.save')}
          </AppButton>
        </>
      }
    >
      <AppInputFormField {...fieldProps} name='company_name' label={t('settings.company.fields.company_name')} required />
      <AppInputFormField
        {...fieldProps}
        name='business_registration_number'
        label={t('settings.company.fields.business_registration_number')}
        placeholder='000-00-00000'
        required
      />
      <AppInputFormField {...fieldProps} name='representative_name' label={t('settings.company.fields.representative_name')} required />
      <CompanyStampField stamp={settings.stamp} draft={stampDraft} onDraftChange={setStampDraft} disabled={isSaving} />
      <AppInputFormField {...fieldProps} name='phone' label={t('settings.company.fields.phone')} placeholder='02-0000-0000' required />
      <AppInputFormField {...fieldProps} name='email' type='email' label={t('settings.company.fields.email')} placeholder='example@company.com' />
      <AppInputFormField {...fieldProps} name='website' label={t('settings.company.fields.website')} placeholder='https://' required />
      <AppInputFormField {...fieldProps} name='business_type' label={t('settings.company.fields.business_type')} />
      <AppInputFormField {...fieldProps} name='industry_type' label={t('settings.company.fields.industry_type')} />
      <AppInputFormField {...fieldProps} name='address' label={t('settings.company.fields.address')} required />
    </SettingsFormCard>
  );
}
