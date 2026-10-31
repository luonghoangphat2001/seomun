import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, type KeyboardEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker/AppDateRangePicker';
import { AppFieldLabel, AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { FormMode } from '@/enums/form.enum';

import type { Popup } from '../api/popup.response';
import { toPopupFormValues } from '../api/popup.service';
import { getPopupExposureStatusOptions } from '../constants';
import { createPopupFormSchema, type PopupFormValues } from '../schemas';
import { PopupImageUpload } from './PopupImageUpload';

type RangeValue = { from?: number; to?: number } | undefined;

const normalizeDimensionValue = (value: string) => value.replace(/[eE+-]/g, '');
const preventInvalidDimensionKeys = (event: KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-'].includes(event.key)) event.preventDefault();
};

type PopupFormProps = {
  mode: FormMode;
  popup?: Popup;
  isPending?: boolean;
  isDeleting?: boolean;
  onCancel: () => void;
  onSubmit: (values: PopupFormValues) => void;
  onDelete?: () => void;
};

export function PopupForm({ mode, popup, isPending, isDeleting, onCancel, onSubmit, onDelete }: PopupFormProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidate } = useTranslation('validation');

  const isEditMode = mode === 'edit';

  const schema = useMemo(() => createPopupFormSchema(tValidate, t), [tValidate, t]);

  const { control, handleSubmit, reset, watch, setValue } = useForm<PopupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toPopupFormValues(popup),
  });

  useEffect(() => {
    reset(toPopupFormValues(popup));
  }, [popup, reset]);

  const startDate = watch('exposure_start_date');
  const endDate = watch('exposure_end_date');
  const widthValue = watch('width');
  const heightValue = watch('height');

  const previewSize = useMemo(() => {
    const w = Number(widthValue);
    const h = Number(heightValue);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
    return { width: w, height: h };
  }, [widthValue, heightValue]);

  const exposureDateRange = useMemo<RangeValue>(() => {
    if (!startDate && !endDate) return undefined;
    return {
      from: startDate ? startDate.getTime() : undefined,
      to: endDate ? endDate.getTime() : undefined,
    };
  }, [startDate, endDate]);

  const handleExposureDateRangeChange = (range: RangeValue) => {
    setValue('exposure_start_date', range?.from ? new Date(range.from) : null, { shouldValidate: true });
    setValue('exposure_end_date', range?.to ? new Date(range.to) : null, { shouldValidate: true });
  };

  const noOptionsText = tCommon('message.no_options_found');
  const statusOptions = getPopupExposureStatusOptions(t);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
      {/* ── Settings ──────────────────────────────────────────────── */}
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('popups.form.section.settings')}</h2>
        </div>
        <Separator />
        <div className='space-y-4 p-6'>
          <div className='flex gap-4'>
            <AppInputFormField
              name='name'
              control={control}
              label={t('popups.form.field.name')}
              placeholder={t('popups.form.field.name_placeholder')}
              required
              className='w-100'
            />
            <AppSelectFormField
              name='status'
              control={control}
              label={t('popups.form.field.status')}
              placeholder={t('popups.form.field.status_placeholder')}
              options={statusOptions}
              emptyText={noOptionsText}
              clearable={false}
              required
              className='w-40'
            />
            <div className='flex flex-col gap-1.5'>
              <AppFieldLabel label={t('popups.form.field.exposure_period')} />
              <AppDateRangePicker
                value={exposureDateRange}
                onChange={handleExposureDateRangeChange}
                placeholder={t('popups.form.field.exposure_period_placeholder')}
                allowClear
                className='w-60'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <AppInputFormField
              name='width'
              className='w-25'
              control={control}
              type='number'
              label={t('popups.form.field.width')}
              placeholder='400'
              min={10}
              step={1}
              normalize={normalizeDimensionValue}
              onKeyDown={preventInvalidDimensionKeys}
              required
            />
            <AppInputFormField
              name='height'
              className='w-25'
              control={control}
              type='number'
              label={t('popups.form.field.height')}
              placeholder='300'
              min={10}
              step={1}
              normalize={normalizeDimensionValue}
              onKeyDown={preventInvalidDimensionKeys}
              required
            />
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className='grid gap-6 p-6 md:grid-cols-2'>
          <Controller
            control={control}
            name='image_path'
            render={({ field, fieldState }) => (
              <PopupImageUpload
                label={t('popups.form.field.image')}
                hint={t('popups.form.field.image_hint')}
                required
                error={fieldState.error?.message}
                value={field.value}
                size={previewSize}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
          <AppTextareaFormField
            name='content'
            control={control}
            label={t('popups.form.field.content')}
            placeholder={t('popups.form.field.content_placeholder')}
            rows={7}
          />
        </div>

        {/* ── Exposure Settings ─────────────────────────────────────── */}
      </section>

      <div className='flex items-center justify-between gap-2'>
        <div>
          {isEditMode && onDelete && (
            <Button type='button' variant='destructive' onClick={onDelete} disabled={isPending ?? isDeleting}>
              {isDeleting ? tCommon('message.saving') : tCommon('action.delete')}
            </Button>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isPending ?? isDeleting}>
            {tCommon('action.cancel')}
          </Button>
          <Button type='submit' disabled={isPending ?? isDeleting}>
            {isPending ? tCommon('message.saving') : isEditMode ? tCommon('action.edit') : tCommon('action.save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
