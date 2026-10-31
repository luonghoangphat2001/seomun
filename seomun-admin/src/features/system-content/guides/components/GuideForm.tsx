import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppLabel } from '@/components/shared/app-label';
import { AppDateRangePicker } from '@/components/shared/app-date-range-picker/AppDateRangePicker';
import { AppRichTextEditor, uploadPendingImages } from '@/components/shared/app-rich-text-editor';
import { AppFormField, AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileType } from '@/enums';
import { FormMode } from '@/enums/form.enum';

import type { Guide } from '../api/guide.response';
import { toGuideFormValues } from '../api/guide.service';
import { getGuideExposureStatusOptions, getGuideTypeOptions } from '../constants';
import { createGuideFormSchema, type GuideFormValues } from '../schemas';
import { GuideAttachmentUpload } from './GuideAttachmentUpload';

type RangeValue = { from?: number; to?: number } | undefined;

type GuideFormProps = {
  mode: FormMode;
  guide?: Guide;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (values: GuideFormValues) => void;
};

export function GuideForm({ mode, guide, isPending: isMutating, onCancel, onSubmit }: GuideFormProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidate } = useTranslation('validation');

  const isEditMode = mode === FormMode.EDIT;

  const schema = useMemo(() => createGuideFormSchema(tValidate, t), [tValidate, t]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<GuideFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toGuideFormValues(guide),
  });
  const isPending = isMutating || isSubmitting;

  const submit = handleSubmit(async (values) => {
    const content = await uploadPendingImages(values.content, FileType.GUIDE_CONTENT_ATTACHMENTS);
    if (content !== null) onSubmit({ ...values, content });
  });

  useEffect(() => {
    reset(toGuideFormValues(guide));
  }, [guide, reset]);

  const typeOptions = getGuideTypeOptions(t);
  const exposureStatusOptions = getGuideExposureStatusOptions(t);

  const exposureStartDate = watch('exposure_start_date');
  const exposureEndDate = watch('exposure_end_date');

  const exposureDateRange = useMemo<RangeValue>(() => {
    if (!exposureStartDate && !exposureEndDate) return undefined;
    return {
      from: exposureStartDate ? exposureStartDate.getTime() : undefined,
      to: exposureEndDate ? exposureEndDate.getTime() : undefined,
    };
  }, [exposureStartDate, exposureEndDate]);

  const handleExposureDateRangeChange = (range: RangeValue) => {
    setValue('exposure_start_date', range?.from ? new Date(range.from) : null, { shouldValidate: true });
    setValue('exposure_end_date', range?.to ? new Date(range.to) : null, { shouldValidate: true });
  };

  return (
    <form noValidate onSubmit={submit} className='space-y-4'>
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('guides.form.section.basic_info')}</h2>
        </div>
        <Separator />
        <div className='space-y-4 p-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <AppInputFormField
              name='title'
              control={control}
              label={t('guides.form.field.title')}
              placeholder={t('guides.form.field.title_placeholder')}
              required
              disabled={isPending}
            />
            <AppSelectFormField
              name='type'
              control={control}
              label={t('guides.form.field.type')}
              placeholder={t('guides.form.field.type_placeholder')}
              options={typeOptions}
              clearable={false}
              required
              disabled={isPending}
            />
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <AppSelectFormField
              name='exposure_status'
              control={control}
              label={t('guides.form.field.exposure_status')}
              placeholder={t('guides.form.field.exposure_status_placeholder')}
              options={exposureStatusOptions}
              clearable={false}
              required
              disabled={isPending}
            />
            <div className='flex flex-col gap-1.5'>
              <AppLabel label={t('guides.form.field.exposure_period')} />
              <AppDateRangePicker
                value={exposureDateRange}
                onChange={handleExposureDateRangeChange}
                placeholder={t('guides.form.field.exposure_period_placeholder')}
                allowClear
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </section>

      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('guides.form.section.detail')}</h2>
        </div>
        <Separator />
        <div className='space-y-4 p-6'>
          <Controller
            control={control}
            name='content'
            render={({ field, fieldState }) => (
              <AppFormField label={t('guides.form.field.content')} error={fieldState.error?.message} required disabled={isPending}>
                {() => (
                  <AppRichTextEditor
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('guides.form.field.content_placeholder')}
                    imageUploadMode='deferred'
                    minHeight={240}
                    disabled={isPending}
                  />
                )}
              </AppFormField>
            )}
          />
          <Controller
            control={control}
            name='attachments'
            render={({ field }) => (
              <div className='flex flex-col gap-1.5'>
                <AppLabel label={t('guides.form.field.attachments')} htmlFor='guide-attachments' />
                <GuideAttachmentUpload value={field.value} onChange={field.onChange} disabled={isPending} />
              </div>
            )}
          />
        </div>
      </section>

      <div className='flex items-center justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
          {tCommon('action.cancel')}
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending ? tCommon('message.saving') : isEditMode ? tCommon('action.edit') : tCommon('action.save')}
        </Button>
      </div>
    </form>
  );
}
