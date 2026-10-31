import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, AlertTriangle, Loader2, RotateCcw, Truck } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { AppButton } from '@/components/shared/app-button';
import { AppDateRangePickerFormField } from '@/components/shared/form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatDateOnly, parseDate } from '@/utils/format-date';

import { useShippingSettingsQuery, useUpdateShippingSettingsMutation } from '../api/shipping-settings.query';
import { mapShippingSettingsFormToREQ } from '../api/shipping-settings.service';
import { createShippingSettingsFormSchema, getShippingSettingsFormDefaultValues, type ShippingSettingsFormValues } from '../schemas';

export function ShippingSettingsPage() {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');

  const { data, isPending, isError, isFetching, refetch } = useShippingSettingsQuery();

  const schema = useMemo(() => createShippingSettingsFormSchema(t, tValidation), [t, tValidation]);

  const settings = data?.data;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ShippingSettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getShippingSettingsFormDefaultValues(),
  });

  const [startAt, endAt] = useWatch({ control, name: ['free_shipping_start_at', 'free_shipping_end_at'] });

  const updateMutation = useUpdateShippingSettingsMutation({
    onSuccess: (response) => {
      reset(getShippingSettingsFormDefaultValues(response.data));
      toast.success(t('orders.shipping_settings.messages.save_success'));
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('orders.shipping_settings.messages.save_error'))),
  });

  // ============================================================================
  // Variables
  // ============================================================================
  const isActive = settings?.is_active ?? false;

  const appliedFrom = formatDateOnly(parseDate(settings?.free_shipping_start_at ?? undefined));
  const appliedTo = formatDateOnly(parseDate(settings?.free_shipping_end_at ?? undefined));
  const appliedPeriod = appliedFrom && appliedTo ? `${appliedFrom} ~ ${appliedTo}` : null;

  const payload = mapShippingSettingsFormToREQ({ free_shipping_start_at: startAt, free_shipping_end_at: endAt });

  const willDisable = isActive && !startAt && !endAt;

  const howItWorks = [
    t('orders.shipping_settings.how_it_works.free'),
    t('orders.shipping_settings.how_it_works.boundary'),
    t('orders.shipping_settings.how_it_works.disable'),
  ];

  // ============================================================================
  // Functions
  // ============================================================================
  const onSubmit = (values: ShippingSettingsFormValues) => {
    updateMutation.mutate(mapShippingSettingsFormToREQ(values));
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (!settings) return;
    reset(getShippingSettingsFormDefaultValues(settings));
  }, [settings, reset]);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('orders.shipping_settings.title')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('orders.shipping_settings.description')}</p> */}
      </div>

      <Separator />

      {isPending ? (
        <div className='bg-card flex min-h-80 items-center justify-center rounded-xl border shadow-sm'>
          <Loader2 className='text-muted-foreground size-5 animate-spin' aria-hidden='true' />
        </div>
      ) : isError ? (
        <div className='bg-card flex min-h-80 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
          <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
            <AlertCircle className='size-6' />
          </div>

          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>{t('orders.shipping_settings.error.load_title')}</h2>
            <p className='text-muted-foreground text-sm'>{t('orders.shipping_settings.error.load_description')}</p>
          </div>

          <Button type='button' variant='outline' onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
            {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
            {tCommon('action.retry')}
          </Button>
        </div>
      ) : (
        <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]'>
          <form onSubmit={handleSubmit(onSubmit)} className='bg-card overflow-hidden rounded-xl border shadow-sm' noValidate>
            <div className='px-5 py-4'>
              <h2 className='text-base font-semibold'>{t('orders.shipping_settings.form.section_title')}</h2>
              <p className='text-muted-foreground mt-0.5 text-sm'>{t('orders.shipping_settings.form.section_description')}</p>
            </div>

            <Separator className='opacity-50' />

            <div className='space-y-5 px-5 py-5'>
              <AppDateRangePickerFormField
                control={control}
                fromName='free_shipping_start_at'
                toName='free_shipping_end_at'
                label={t('orders.shipping_settings.form.fields.period')}
                placeholder={t('orders.shipping_settings.form.placeholders.period')}
                disabled={updateMutation.isPending}
                allowClear
              />

              <div className='space-y-2'>
                <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                  {t('orders.shipping_settings.form.preview_label')}
                </p>

                <div className='grid gap-3 sm:grid-cols-2'>
                  <PayloadPreviewItem label={t('orders.shipping_settings.form.fields.start_at')} value={payload.free_shipping_start_at ?? '—'} />
                  <PayloadPreviewItem label={t('orders.shipping_settings.form.fields.end_at')} value={payload.free_shipping_end_at ?? '—'} />
                </div>
              </div>

              {willDisable ? (
                <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800'>
                  <AlertTriangle className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
                  <p className='text-sm'>{t('orders.shipping_settings.form.disable_warning')}</p>
                </div>
              ) : null}
            </div>

            <div className='bg-muted/30 flex items-center justify-end gap-2 border-t px-5 py-3'>
              <Button
                type='button'
                variant='ghost'
                className='gap-2'
                onClick={() => reset(getShippingSettingsFormDefaultValues(settings))}
                disabled={!isDirty || updateMutation.isPending}
              >
                <RotateCcw className='size-4' aria-hidden='true' />
                {tCommon('action.reset')}
              </Button>

              <AppButton type='submit' isLoading={updateMutation.isPending} disabled={!isDirty}>
                {tCommon('action.save')}
              </AppButton>
            </div>
          </form>

          <aside className='bg-card space-y-4 rounded-xl border p-5 shadow-sm lg:sticky lg:top-6'>
            <div className='flex items-start gap-3'>
              <div className='bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg'>
                <Truck className='size-5' aria-hidden='true' />
              </div>

              <div className='min-w-0 space-y-1.5'>
                <p className='text-muted-foreground text-sm'>{t('orders.shipping_settings.status.label')}</p>
                <Badge
                  variant='outline'
                  className={isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}
                >
                  {isActive ? tCommon('status.active') : tCommon('status.inactive')}
                </Badge>
              </div>
            </div>

            <Separator className='opacity-50' />

            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>{t('orders.shipping_settings.status.period_label')}</p>

              {appliedPeriod ? (
                <p className='font-mono text-sm font-medium'>{appliedPeriod}</p>
              ) : (
                <p className='text-muted-foreground text-sm'>{t('orders.shipping_settings.status.disabled_hint')}</p>
              )}
            </div>

            <Separator className='opacity-50' />

            <div className='space-y-2'>
              <p className='text-sm font-medium'>{t('orders.shipping_settings.how_it_works.title')}</p>

              <ul className='text-muted-foreground space-y-2 text-sm'>
                {howItWorks.map((item) => (
                  <li key={item} className='flex gap-2'>
                    <span className='bg-muted-foreground/40 mt-1.5 size-1.5 shrink-0 rounded-full' aria-hidden='true' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </PageContainer>
  );
}

function PayloadPreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-muted/40 rounded-lg border px-3 py-2.5'>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p className='mt-0.5 font-mono text-sm font-medium'>{value}</p>
    </div>
  );
}
