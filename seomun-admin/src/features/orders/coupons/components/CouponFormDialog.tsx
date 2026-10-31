import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import {
  AppDateRangePickerFormField,
  AppInputFormField,
  AppSelectFormField,
  AppSwitchFormField,
  AppTextareaFormField,
} from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { getApiErrorMessage } from '@/utils/api-error';
import { blockNonPositiveNumericKeys, NO_SPIN_INPUT_CLASS, stripLeadingZeros } from '@/utils/numeric-input';

import { useCreateCouponMutation, useUpdateCouponMutation } from '../api/coupon.query';
import type { Coupon } from '../api/coupon.response';
import { mapCouponFormToREQ } from '../api/coupon.service';
import { getCouponDiscountTypeOptions } from '../constants';
import { CouponDiscountType } from '../enums';
import { createCouponFormSchema, getCouponFormDefaultValues, type CouponFormValues } from '../schemas';

// ============================================================================
// Type definitions
// ============================================================================

type CouponFormDialogProps = {
  isOpen: boolean;
  /** `undefined` means create mode. */
  editCoupon?: Coupon;
  onClose: () => void;
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='space-y-3'>
      <h3 className='text-sm font-semibold'>{title}</h3>
      <div className='grid gap-4 sm:grid-cols-2'>{children}</div>
    </section>
  );
}

export function CouponFormDialog({ isOpen, editCoupon, onClose }: CouponFormDialogProps) {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation('page');
  const { t: tValidation } = useTranslation('validation');
  const { t: tCommon } = useTranslation('common');

  const schema = useMemo(() => createCouponFormSchema(t, tValidation), [t, tValidation]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getCouponFormDefaultValues(),
  });

  /** Last type the form settled on, so a reset isn't mistaken for the user switching type. */
  const previousDiscountTypeRef = useRef<CouponDiscountType>(getCouponFormDefaultValues().discount_type);

  const createMutation = useCreateCouponMutation({
    onSuccess: () => {
      toast.success(t('orders.coupons.messages.create_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('orders.coupons.messages.create_error'))),
  });

  const updateMutation = useUpdateCouponMutation({
    onSuccess: () => {
      toast.success(t('orders.coupons.messages.update_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('orders.coupons.messages.update_error'))),
  });

  // ============================================================================
  // Variables
  // ============================================================================
  const isEdit = editCoupon !== undefined;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const discountType = watch('discount_type');
  const isPercentage = discountType === CouponDiscountType.PERCENTAGE;
  const discountTypeOptions = getCouponDiscountTypeOptions(t);
  // Nothing to save on an untouched edit. Creating always starts clean, so only gate edits.
  const isUnchangedEdit = isEdit && !isDirty;

  // ============================================================================
  // Functions
  // ============================================================================
  const onSubmit = (values: CouponFormValues) => {
    const payload = mapCouponFormToREQ(values);

    if (isEdit) {
      // `code` is never editable here, so always send the stored one — the API requires it.
      updateMutation.mutate({ couponId: editCoupon.id, payload: { ...payload, code: editCoupon.code } });
      return;
    }

    createMutation.mutate(payload);
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (!isOpen) return;
    const defaults = getCouponFormDefaultValues(editCoupon);
    // Seed the tracker so loading a coupon is never mistaken for the user switching type.
    previousDiscountTypeRef.current = defaults.discount_type;
    reset(defaults);
  }, [isOpen, editCoupon, reset]);

  // An amount entered as a percentage is meaningless as a fixed amount and vice versa, so clear it
  // when the type actually changes — along with the cap, which only applies to percentages.
  useEffect(() => {
    if (previousDiscountTypeRef.current === discountType) return;
    previousDiscountTypeRef.current = discountType;
    setValue('discount_value', '', { shouldDirty: true });
    setValue('max_discount_amount', '', { shouldDirty: true });
  }, [discountType, setValue]);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('orders.coupons.form.edit_title') : t('orders.coupons.form.create_title')}</DialogTitle>
        </DialogHeader>

        {/* Only the field area scrolls, so the footer actions stay reachable on a tall form. */}
        <form onSubmit={handleSubmit(onSubmit)} className='flex min-h-0 flex-1 flex-col gap-4' noValidate>
          <div className='-mr-2 min-h-0 flex-1 space-y-6 overflow-y-auto pr-2'>
            <FormSection title={t('orders.coupons.form.sections.basic')}>
              <AppInputFormField
                name='code'
                control={control}
                label={t('orders.coupons.form.fields.code')}
                placeholder={t('orders.coupons.form.placeholders.code')}
                description={isEdit ? t('orders.coupons.form.hints.code_locked') : undefined}
                readOnly={isEdit}
                disabled={isPending}
                className='h-10'
                required
              />

              <AppInputFormField
                name='name'
                control={control}
                label={t('orders.coupons.form.fields.name')}
                placeholder={t('orders.coupons.form.placeholders.name')}
                disabled={isPending}
                className='h-10'
                required
              />

              <AppTextareaFormField
                name='description'
                control={control}
                label={t('orders.coupons.form.fields.description')}
                placeholder={t('orders.coupons.form.placeholders.description')}
                disabled={isPending}
                fieldClassName='sm:col-span-2'
                rows={3}
              />

              <AppInputFormField
                name='usage_limit'
                control={control}
                label={t('orders.coupons.form.fields.usage_limit')}
                description={t('orders.coupons.form.hints.usage_limit')}
                type='number'
                min={1}
                onKeyDown={blockNonPositiveNumericKeys}
                inputClassName={NO_SPIN_INPUT_CLASS}
                normalize={stripLeadingZeros}
                disabled={isPending}
                className='h-10'
              />
            </FormSection>

            <Separator />

            <FormSection title={t('orders.coupons.form.sections.discount')}>
              <AppSelectFormField
                name='discount_type'
                control={control}
                label={t('orders.coupons.form.fields.discount_type')}
                options={discountTypeOptions}
                disabled={isPending}
                className='h-10'
                clearable={false}
                required
              />

              <AppInputFormField
                name='discount_value'
                control={control}
                label={t('orders.coupons.form.fields.discount_value')}
                type='number'
                min={0}
                max={isPercentage ? 100 : undefined}
                suffix={isPercentage ? '%' : t('orders.coupons.form.units.currency')}
                onKeyDown={blockNonPositiveNumericKeys}
                inputClassName={NO_SPIN_INPUT_CLASS}
                normalize={stripLeadingZeros}
                disabled={isPending}
                className='h-10'
                required
              />

              <AppInputFormField
                name='min_order_amount'
                control={control}
                label={t('orders.coupons.form.fields.min_order_amount')}
                description={t('orders.coupons.form.hints.min_order_amount')}
                type='number'
                min={0}
                suffix={t('orders.coupons.form.units.currency')}
                onKeyDown={blockNonPositiveNumericKeys}
                inputClassName={NO_SPIN_INPUT_CLASS}
                normalize={stripLeadingZeros}
                disabled={isPending}
                className='h-10'
              />

              {isPercentage ? (
                <AppInputFormField
                  name='max_discount_amount'
                  control={control}
                  label={t('orders.coupons.form.fields.max_discount_amount')}
                  description={t('orders.coupons.form.hints.max_discount_amount')}
                  type='number'
                  min={0}
                  suffix={t('orders.coupons.form.units.currency')}
                  onKeyDown={blockNonPositiveNumericKeys}
                  inputClassName={NO_SPIN_INPUT_CLASS}
                  normalize={stripLeadingZeros}
                  disabled={isPending}
                  className='h-10'
                />
              ) : null}
            </FormSection>

            <Separator />

            <FormSection title={t('orders.coupons.form.sections.period')}>
              <AppDateRangePickerFormField
                control={control}
                fromName='claim_starts_at'
                toName='claim_ends_at'
                label={t('orders.coupons.form.fields.claim_period')}
                description={t('orders.coupons.form.hints.claim_period')}
                placeholder={t('orders.coupons.form.placeholders.date_range')}
                disabled={isPending}
                fieldClassName='sm:col-span-2'
                allowClear
              />

              <AppDateRangePickerFormField
                control={control}
                fromName='starts_at'
                toName='expires_at'
                label={t('orders.coupons.form.fields.period')}
                description={t('orders.coupons.form.hints.period')}
                placeholder={t('orders.coupons.form.placeholders.date_range')}
                disabled={isPending}
                fieldClassName='sm:col-span-2'
                allowClear
              />

              <AppSwitchFormField
                name='is_active'
                control={control}
                label={t('orders.coupons.form.fields.is_active')}
                description={t('orders.coupons.form.hints.is_active')}
                disabled={isPending}
                fieldClassName='sm:col-span-2 pt-2'
              />
            </FormSection>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
              {tCommon('action.cancel')}
            </Button>

            <AppButton type='submit' isLoading={isPending} disabled={isUnchangedEdit}>
              {tCommon('action.save')}
            </AppButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
