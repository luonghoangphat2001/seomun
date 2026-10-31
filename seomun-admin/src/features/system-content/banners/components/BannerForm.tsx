import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDateRangePickerFormField, AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import type { FormMode } from '@/enums/form.enum';
import type { Banner, BannerFilterFields } from '../api/banner.response';
import { toBannerFormValues } from '../api/banner.service';
import { getBannerExposureStatusOptions } from '../constants';
import { createBannerFormSchema, type BannerFormValues } from '../schemas';
import { BannerImageUpload } from './BannerIarchUpload';

type BannerFormProps = {
  mode: FormMode;
  banner?: Banner;
  filterData?: BannerFilterFields;
  isPending?: boolean;
  isDeleting?: boolean;
  onCancel: () => void;
  onSubmit: (values: BannerFormValues) => void;
  onDelete?: () => void;
};

export function BannerForm({ mode, banner, filterData, isPending, isDeleting, onCancel, onSubmit, onDelete }: BannerFormProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidate } = useTranslation('validation');

  const isEditMode = mode === 'edit';

  const schema = useMemo(() => createBannerFormSchema(tValidate, t), [tValidate, t]);

  const { control, handleSubmit, reset } = useForm<BannerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toBannerFormValues(banner),
  });

  useEffect(() => {
    reset(toBannerFormValues(banner));
  }, [banner, reset]);

  const noOptionsText = tCommon('message.no_options_found');

  // const exposureLocationOptions = filterData?.exposure_location_options ?? [];
  const exposureStatusOptions = getBannerExposureStatusOptions(t);
  const exposureTargetOptions = [
    { value: 'all', label: t('banners.form.field.exposure_target_all') },
    ...(filterData?.exposure_target_options ?? []).map((o) => ({ value: String(o.value), label: o.label })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
      {/* ── Image Preview ─────────────────────────────────────────── */}
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('banners.form.section.image_preview')}</h2>
        </div>
        <Separator />
        <div className='space-y-4 p-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Controller
              control={control}
              name='image_path'
              render={({ field, fieldState }) => (
                <BannerImageUpload
                  label={t('banners.form.field.pc_image')}
                  required
                  hint={t('banners.form.field.pc_image_hint')}
                  error={fieldState.error?.message}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? '')}
                />
              )}
            />
            <Controller
              control={control}
              name='image_path_mobile'
              render={({ field, fieldState }) => (
                <BannerImageUpload
                  label={t('banners.form.field.mobile_image')}
                  required
                  hint={t('banners.form.field.mobile_image_hint')}
                  error={fieldState.error?.message}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? '')}
                />
              )}
            />
          </div>
        </div>
      </section>

      {/* ── Basic Information ─────────────────────────────────────── */}
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('banners.form.section.basic_info')}</h2>
        </div>
        <Separator />
        <div className='space-y-4 p-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <AppInputFormField
              name='name'
              control={control}
              label={t('banners.form.field.name')}
              placeholder={t('banners.form.field.name_placeholder')}
              required
            />
            <AppInputFormField
              name='link_url'
              control={control}
              label={t('banners.form.field.link_url')}
              placeholder={t('banners.form.field.link_url_placeholder')}
            />
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <AppSelectFormField
              name='status'
              control={control}
              label={t('banners.form.field.status')}
              placeholder={t('banners.form.field.status_placeholder')}
              options={exposureStatusOptions}
              emptyText={noOptionsText}
              clearable={false}
              required
            />
            <AppInputFormField name='sort_order' control={control} type='number' label={t('banners.form.field.sort_order')} placeholder='0' />
          </div>
        </div>
      </section>

      {/* ── Exposure Settings ─────────────────────────────────────── */}
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('banners.form.section.exposure_settings')}</h2>
        </div>
        <Separator />
        <div className='p-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <AppSelectFormField
              name='exposure_target'
              control={control}
              label={t('banners.form.field.exposure_target')}
              placeholder={t('banners.form.field.exposure_target_placeholder')}
              options={exposureTargetOptions}
              emptyText={noOptionsText}
              clearable={false}
            />
            <AppDateRangePickerFormField
              fromName='exposure_start_date'
              toName='exposure_end_date'
              control={control}
              label={t('banners.form.field.exposure_period')}
              placeholder={t('banners.form.field.exposure_period_placeholder')}
              allowClear
            />
          </div>
        </div>
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
