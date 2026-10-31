import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/utils/api-error';

import { useUpdateTransactionSettingsMutation, useUploadTransactionLogoMutation } from '../api/transaction-settings.query';
import type { TransactionSettings } from '../api/transaction-settings.response';
import { SETTINGS_FIELD_CLASS } from '../constants';
import { createTransactionSettingsFormSchema, getTransactionSettingsFormDefaultValues, type TransactionSettingsFormValues } from '../schemas';
import { SettingsFormCard } from './SettingsFormCard';
import { SettingsImageField } from './SettingsImageField';

export function TransactionSettingsSection({ settings }: { settings: TransactionSettings }) {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const schema = useMemo(() => createTransactionSettingsFormSchema(tValidation), [tValidation]);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isDirty },
  } = useForm<TransactionSettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getTransactionSettingsFormDefaultValues(settings),
  });

  const updateMutation = useUpdateTransactionSettingsMutation({
    onSuccess: () => reset(getValues()),
    onError: (error) => toast.error(getApiErrorMessage(error, t('settings.transaction.messages.save_error'))),
  });

  const uploadLogoMutation = useUploadTransactionLogoMutation({
    onSuccess: () => setLogoFile(null),
    onError: (error) => toast.error(getApiErrorMessage(error, t('settings.transaction.logo.upload_error'))),
  });

  // ============================================================================
  // Variables
  // ============================================================================
  const isSaving = updateMutation.isPending || uploadLogoMutation.isPending;
  const hasChanges = isDirty || Boolean(logoFile);
  const fieldProps = { control, disabled: isSaving, fieldClassName: SETTINGS_FIELD_CLASS } as const;

  // ============================================================================
  // Functions
  // ============================================================================
  const onSubmit = async (values: TransactionSettingsFormValues) => {
    try {
      if (isDirty) await updateMutation.mutateAsync({ ...values, logo: settings.logo ?? '' });
      if (logoFile) await uploadLogoMutation.mutateAsync(logoFile);
      toast.success(t('settings.transaction.messages.save_success'));
    } catch {
      // Already toasted by the mutation's onError.
    }
  };

  const handleReset = () => {
    reset(getTransactionSettingsFormDefaultValues(settings));
    setLogoFile(null);
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    reset(getTransactionSettingsFormDefaultValues(settings), { keepDirtyValues: true });
  }, [settings, reset]);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <SettingsFormCard
      title={t('settings.transaction.title')}
      description={t('settings.transaction.description')}
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
      <SettingsImageField
        label={t('settings.transaction.fields.logo')}
        description={t('settings.transaction.logo.description')}
        emptyText={t('settings.transaction.logo.empty')}
        uploadText={t('settings.transaction.logo.upload')}
        placeholderIcon={ImageIcon}
        isConfigured={Boolean(settings.logo)}
        previewUrl={settings.logo}
        fileName={settings.logo?.split('/').pop()}
        file={logoFile}
        disabled={isSaving}
        onSelect={setLogoFile}
      />
      <AppInputFormField {...fieldProps} name='address' label={t('settings.transaction.fields.address')} />
      <AppInputFormField {...fieldProps} name='email' type='email' label={t('settings.transaction.fields.email')} placeholder='example@company.com' />
      <AppInputFormField {...fieldProps} name='phone_number' label={t('settings.transaction.fields.phone_number')} placeholder='02-0000-0000' />
    </SettingsFormCard>
  );
}
