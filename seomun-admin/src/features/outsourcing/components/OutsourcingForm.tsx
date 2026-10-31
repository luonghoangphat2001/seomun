import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppInputFormField, AppSwitchFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { FileType } from '@/enums';
import { FormMode } from '@/enums/form.enum';
import type { IBaseError } from '@/types/api';
import { blockNonDigitKey } from '@/utils/format-phone';
import { useCreateOutsourcingMutation, useUpdateOutsourcingMutation, type OutsourcingRESP } from '@/features/outsourcing/api';
import { OutsourcingCertificateField } from '@/features/outsourcing/components/OutsourcingCertificateField';
import { createOutsourcingFormSchema, getOutsourcingFormDefaultValues, type OutsourcingFormValues } from '@/features/outsourcing/schemas';
import {
  buildOutsourcingPayload,
  buildOutsourcingUpdatePayload,
  type OutsourcingSubmitValues,
} from '@/features/outsourcing/utils/outsourcing-list-params';
import { useUploadFileMutation } from '@/features/system-content/images';

type OutsourcingFormProps = {
  mode: FormMode;
  outsourcing?: OutsourcingRESP;
  onCancel: () => void;
  onSubmitSuccess: () => void;
};

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='rounded-xl border'>
      <div className='border-b px-5 py-4'>
        <h2 className='text-sm font-semibold'>{title}</h2>
      </div>
      <div className='grid items-start gap-x-6 gap-y-5 p-5 md:grid-cols-2'>{children}</div>
    </section>
  );
}

export function OutsourcingForm({ mode, outsourcing, onCancel, onSubmitSuccess }: OutsourcingFormProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tForm } = useTranslation('form');
  const { t: tMessage } = useTranslation('message');
  const { t: tValidation } = useTranslation('validation');
  const isEditMode = mode === FormMode.EDIT;
  const outsourcingId = outsourcing?.id;
  const hasValidOutsourcingId = outsourcingId !== undefined && Number.isFinite(outsourcingId) && outsourcingId > 0;
  const createMutation = useCreateOutsourcingMutation();
  const updateMutation = useUpdateOutsourcingMutation(outsourcingId ?? 0);
  const uploadCertificateMutation = useUploadFileMutation(FileType.OUTSOURCING_REGISTRATION_CERTIFICATE);
  const isPending = createMutation.isPending || updateMutation.isPending || uploadCertificateMutation.isPending;

  const { control, handleSubmit, reset } = useForm<OutsourcingFormValues>({
    resolver: zodResolver(createOutsourcingFormSchema(mode, tValidation, tForm)),
    defaultValues: getOutsourcingFormDefaultValues(mode, outsourcing),
  });

  const onSubmit = async (values: OutsourcingFormValues) => {
    const successMessage = isEditMode ? tMessage('outsourcing.update.success') : tMessage('outsourcing.create.success');
    const errorMessage = isEditMode ? tMessage('outsourcing.update.error') : tMessage('outsourcing.create.error');

    if (isEditMode && !hasValidOutsourcingId) {
      toast.error(tMessage('outsourcing.invalid_id'));
      return;
    }

    let certificateUrl: string | null;

    if (values.registration_certificate instanceof File) {
      try {
        const uploaded = await uploadCertificateMutation.mutateAsync(values.registration_certificate);
        certificateUrl = uploaded.url;
      } catch {
        toast.error(tCommon('upload_failed'));
        return;
      }
    } else {
      certificateUrl = values.registration_certificate;
    }

    const submitValues: OutsourcingSubmitValues = { ...values, registration_certificate: certificateUrl };

    const mutationOptions = {
      onSuccess: () => {
        toast.success(successMessage);
        onSubmitSuccess();
      },
      onError: (error: AxiosError<IBaseError>) => {
        toast.error(error.response?.data.message || error.response?.data.error || errorMessage);
      },
    };

    if (isEditMode) {
      updateMutation.mutate(buildOutsourcingUpdatePayload(submitValues), mutationOptions);
      return;
    }

    createMutation.mutate(buildOutsourcingPayload(submitValues), mutationOptions);
  };

  useEffect(() => {
    reset(getOutsourcingFormDefaultValues(mode, outsourcing));
  }, [mode, outsourcing, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-5'>
      <FormSection title={tForm('outsourcing.sections.basic_info')}>
        <AppInputFormField
          name='name'
          control={control}
          label={tForm('outsourcing.fields.company_name.label')}
          placeholder={tForm('outsourcing.fields.company_name.placeholder')}
          disabled={isPending}
          required
        />
        <AppInputFormField
          name='representative_name'
          control={control}
          label={tForm('outsourcing.fields.representative_name.label')}
          placeholder={tForm('outsourcing.fields.representative_name.placeholder')}
          disabled={isPending}
          required
        />
        <AppInputFormField
          name='email'
          control={control}
          type='email'
          label={tForm('outsourcing.fields.email.label')}
          placeholder={tForm('outsourcing.fields.email.placeholder')}
          disabled={isPending}
          required
        />
        <AppInputFormField
          name='contact'
          control={control}
          label={tForm('outsourcing.fields.contact.label')}
          placeholder={tForm('outsourcing.fields.contact.placeholder')}
          type='tel'
          inputMode='numeric'
          onKeyDown={blockNonDigitKey}
          disabled={isPending}
          required
        />
        <AppInputFormField
          name='address'
          control={control}
          label={tForm('outsourcing.fields.address.label')}
          placeholder={tForm('outsourcing.fields.address.placeholder')}
          disabled={isPending}
          required
          fieldClassName='md:col-span-2'
        />
      </FormSection>

      <FormSection title={tForm('outsourcing.sections.business')}>
        <AppInputFormField
          name='registration_number'
          control={control}
          label={tForm('outsourcing.fields.registration_number.label')}
          placeholder={tForm('outsourcing.fields.registration_number.placeholder')}
          inputMode='numeric'
          onKeyDown={blockNonDigitKey}
          disabled={isPending}
          required
        />
        <OutsourcingCertificateField
          control={control}
          label={tForm('outsourcing.fields.registration_certificate.label')}
          description={tForm('outsourcing.fields.registration_certificate.description')}
          disabled={isPending}
          className='md:col-span-2'
        />
      </FormSection>

      <FormSection title={tForm('outsourcing.sections.work')}>
        <AppTextareaFormField
          name='work_details'
          control={control}
          label={tForm('outsourcing.fields.work_details.label')}
          placeholder={tForm('outsourcing.fields.work_details.placeholder')}
          rows={4}
          disabled={isPending}
          required
          fieldClassName='md:col-span-2'
        />
        <AppTextareaFormField
          name='memo'
          control={control}
          label={tForm('outsourcing.fields.memo.label')}
          placeholder={tForm('outsourcing.fields.memo.placeholder')}
          rows={3}
          maxLength={500}
          disabled={isPending}
          fieldClassName='md:col-span-2'
        />
        <AppSwitchFormField
          name='is_active'
          control={control}
          label={tForm('outsourcing.fields.is_active.label')}
          description={tForm('outsourcing.fields.is_active.description')}
          disabled={isPending}
          fieldClassName='md:col-span-2'
        />
      </FormSection>

      <div className='bg-muted/30 flex items-center justify-end gap-2 rounded-xl border px-5 py-4'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
          {tCommon('action.cancel')}
        </Button>
        <Button type='submit' disabled={isPending}>
          {isEditMode ? tForm('outsourcing.actions.save_changes') : tForm('outsourcing.actions.register')}
        </Button>
      </div>
    </form>
  );
}
