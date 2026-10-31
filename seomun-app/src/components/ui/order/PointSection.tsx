'use client';

import { Button, Description, Input } from '@/components/common';
import { useTranslations } from 'next-intl';
import { OrderCheckOutFormValues } from './schema';
import { Controller, useFormContext } from 'react-hook-form';
import { useAuthStore } from '@/hooks';

const PointSection = () => {
  const t = useTranslations('');
  const { control, getValues, setValue } = useFormContext<OrderCheckOutFormValues>();
  const { profile } = useAuthStore();
  const availablePoint = Math.max(0, Number(profile?.point.balance) || 0);

  const normalizePoint = (value: string) => {
    if (!value) return '';

    const point = Number(value);
    if (!Number.isFinite(point)) return '';

    return String(Math.min(availablePoint, Math.max(0, Math.floor(point))));
  };

  return (
    <div>
      <Description
        mode='form'
        isCollapse={false}
        title={
          <div className='flex items-center gap-1.5'>
            <p className='title-20'>{t('order.point_discount')}</p>
            <p className='body-14 hidden md:block'>({t('order.available_increment')})</p>
          </div>
        }
        extra={
          <p className='title-14 text-text-brand'>
            {t('order.point_held')}: {availablePoint} P
          </p>
        }>
        <div className='mt-3 flex gap-1.5'>
          <Controller
            control={control}
            name='point'
            render={({ field }) => (
              <Input
                {...field}
                className='flex-1 appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'
                containerClassName='flex-1'
                placeholder='0'
                type='number'
                min={0}
                max={availablePoint}
                step={1}
                onKeyDown={(event) => {
                  if (['+', '-', 'e', 'E'].includes(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={(event) => field.onChange(normalizePoint(event.target.value))}
                onBlur={() => {
                  field.onChange(normalizePoint(field.value || ''));
                  field.onBlur();
                }}
              />
            )}
          />
          <Button
            type='button'
            className='w-12.5 px-0'
            onClick={() =>
              setValue('appliedPoint', normalizePoint(getValues('point') || ''), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }>
            {t('common.apply')}
          </Button>
        </div>
      </Description>
    </div>
  );
};

export default PointSection;
