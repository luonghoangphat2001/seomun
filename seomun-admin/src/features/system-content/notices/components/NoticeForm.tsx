import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDateRangePicker } from '@/components/shared/app-date-range-picker/AppDateRangePicker';
import { AppRichTextEditor, uploadPendingImages } from '@/components/shared/app-rich-text-editor';
import { AppCheckboxFormField, AppFormField, AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { AppLabel } from '@/components/shared/app-label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileType, type FormMode } from '@/enums';

import { toFormValues } from '@/features/system-content/notices/api/notice.service.ts';
import type { Notice, NoticeFilterFields } from '@/features/system-content/notices/api';
import { getNoticeExposureStatusOptions, getNoticeTypeOptions } from '@/features/system-content/notices/constants';
import { noticeFormSchema, type NoticeFormValues } from '@/features/system-content/notices/schemas';
import { NoticeAttachmentUpload } from './NoticeAttachmentUpload';

// === Types ===

type RangeValue = { from?: number; to?: number } | undefined;

// === Component ===

type NoticeFormProps = {
  mode: FormMode;
  notice?: Notice;
  filterData?: NoticeFilterFields;
  isPending: boolean;
  isDeleting?: boolean;
  onCancel: () => void;
  onSubmit: (values: NoticeFormValues) => void;
  onDelete?: () => void;
};

export function NoticeForm({ mode, notice, isPending: isMutating, isDeleting, onCancel, onSubmit, onDelete }: NoticeFormProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const isEditMode = mode === 'edit';

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: toFormValues(notice),
  });
  const isPending = isMutating || isSubmitting;

  const submit = handleSubmit(async (values) => {
    const content = await uploadPendingImages(values.content, FileType.NOTICE_ATTACHMENTS);
    if (content !== null) onSubmit({ ...values, content });
  });

  useEffect(() => {
    reset(toFormValues(notice));
  }, [notice, reset]);

  const exposureStartDate = watch('exposure_start_date');
  const exposureEndDate = watch('exposure_end_date');

  const exposureDateRange = useMemo<RangeValue>(() => {
    if (!exposureStartDate && !exposureEndDate) return undefined;
    return {
      from: exposureStartDate ? parseISO(exposureStartDate).getTime() : undefined,
      to: exposureEndDate ? parseISO(exposureEndDate).getTime() : undefined,
    };
  }, [exposureStartDate, exposureEndDate]);

  const handleExposureDateRangeChange = (range: RangeValue) => {
    setValue('exposure_start_date', range?.from ? format(new Date(range.from), 'yyyy-MM-dd') : undefined, { shouldValidate: true });
    setValue('exposure_end_date', range?.to ? format(new Date(range.to), 'yyyy-MM-dd') : undefined, { shouldValidate: true });
  };

  const exposureStatusOptions = useMemo(() => getNoticeExposureStatusOptions(t), [t]);
  const noticeTypeOptions = useMemo(() => getNoticeTypeOptions(t), [t]);

  return (
    <form onSubmit={submit} className='space-y-4' noValidate>
      <Controller control={control} name='exposure_location' render={() => <></>} />
      {/* Basic Information */}
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('notices.form.section.basic_info')}</h2>
        </div>
        <Separator />
        <div className='p-6'>
          <AppInputFormField
            name='title'
            control={control}
            label={t('notices.form.field.title')}
            labelClassName='text-muted-foreground text-xs font-medium tracking-wider'
            placeholder={t('notices.form.field.title_placeholder')}
            required
            fieldClassName='md:col-span-4'
          />
          <div className='mt-4 flex gap-x-6 gap-y-3'>
            <div className='flex min-w-0 flex-col gap-1.5 md:col-span-2'>
              <AppLabel label={t('notices.form.field.exposure_period')} htmlFor='notice-exposure-period' />
              <AppDateRangePicker
                id='notice-exposure-period'
                value={exposureDateRange}
                onChange={handleExposureDateRangeChange}
                placeholder={t('notices.form.field.exposure_period_placeholder')}
                allowClear
                className='min-w-50'
              />
            </div>
            <AppSelectFormField
              name='type'
              control={control}
              label={t('notices.form.field.type')}
              labelClassName='text-muted-foreground text-xs font-medium tracking-wider'
              placeholder={t('notices.form.field.type_placeholder')}
              options={noticeTypeOptions}
              clearable
              fieldClassName='w-50'
            />
            <AppSelectFormField
              name='exposure_status'
              control={control}
              label={t('notices.form.field.exposure_status')}
              labelClassName='text-muted-foreground text-xs font-medium tracking-wider'
              placeholder={t('notices.form.field.exposure_status_placeholder')}
              options={exposureStatusOptions}
              clearable={false}
              required
              fieldClassName='w-50'
            />
            <AppCheckboxFormField
              name='is_pinned'
              control={control}
              label={t('notices.form.field.is_pinned')}
              labelClassName='text-muted-foreground text-xs font-medium tracking-wider'
              fieldClassName='self-end pb-2.5'
            />
          </div>
        </div>
      </section>

      {/* Detail */}
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('notices.form.section.detail')}</h2>
        </div>
        <Separator />
        <div className='space-y-4 p-6'>
          <Controller
            control={control}
            name='content'
            render={({ field, fieldState }) => (
              <AppFormField label={t('notices.form.field.content')} error={fieldState.error?.message} required disabled={isPending}>
                {() => (
                  <AppRichTextEditor
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('notices.form.field.content_placeholder')}
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
              <div className='flex max-w-2xl flex-col gap-1.5'>
                <AppLabel label={t('notices.form.field.attachments')} htmlFor='notice-attachments' />
                <NoticeAttachmentUpload value={field.value} onChange={field.onChange} />
              </div>
            )}
          />
        </div>
      </section>

      <div className='flex items-center justify-between gap-2'>
        <div>
          {isEditMode && onDelete && (
            <AppButton variant='destructive' onClick={onDelete} disabled={isPending} isLoading={isDeleting}>
              {tCommon('action.delete')}
            </AppButton>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isDeleting}>
            {tCommon('action.cancel')}
          </Button>
          <Button type='submit' disabled={isPending || isDeleting}>
            {isPending ? tCommon('message.saving') : isEditMode ? tCommon('action.edit') : tCommon('action.save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
