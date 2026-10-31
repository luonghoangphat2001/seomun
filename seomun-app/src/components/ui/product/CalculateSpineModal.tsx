'use client';

import { useProductSpineMutation } from '@/apis/product/product.query';
import { ProductSpineREQ } from '@/apis/product/product.request';
import { Button, Input, Modal, ModalHandle, Radio } from '@/components/common';
import { FormRadioGroup, FormSelect } from '@/components/form';
import { useDebounce, useMediaQuery } from '@/hooks';
import { Reload } from '@/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { CalculateSpineFormValues, calculateSpineSchema } from './schema';
import { ProductSpineSide } from '@/enums/product';

export type CalculateSpinePaper = {
  id: number;
  name: string;
};

type CalculateSpineModalProps = {
  papers?: CalculateSpinePaper[];
  selectedPaperId?: number;
};

export const CalculateSpineModal = forwardRef<ModalHandle, CalculateSpineModalProps>(({ papers = [], selectedPaperId }, ref) => {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { control, reset, setValue } = useForm<CalculateSpineFormValues>({
    resolver: zodResolver(calculateSpineSchema()),
    defaultValues: {
      paper_id: 0,
      pages: 0,
      print_side: ProductSpineSide.SINGLE,
    },
  });
  const formValues = useWatch({ control });
  const debouncedFormValues = useDebounce(formValues, 300);

  //api spine
  const {
    data: spineData,
    isPending: isCalculatingSpine,
    mutate: calculateSpine,
    reset: resetSpineResult,
  } = useProductSpineMutation();

  const paperOptions = useMemo(() => papers.map((paper) => ({ value: paper.id, label: paper.name })), [papers]);
  const defaultPaperId = useMemo(() => {
    const selectedPaper = paperOptions.find((paper) => paper.value === selectedPaperId);

    return selectedPaper?.value ?? paperOptions[0]?.value ?? 0;
  }, [paperOptions, selectedPaperId]);

  useEffect(() => {
    if (defaultPaperId) {
      setValue('paper_id', defaultPaperId);
    }
  }, [defaultPaperId, setValue]);

  useEffect(() => {
    if (!debouncedFormValues.paper_id || !debouncedFormValues.pages || !debouncedFormValues.print_side) {
      resetSpineResult();
      return;
    }

    calculateSpine(debouncedFormValues as ProductSpineREQ);
  }, [calculateSpine, debouncedFormValues, resetSpineResult]);

  const onReset = () => {
    reset({
      paper_id: defaultPaperId,
      pages: 0,
      print_side: ProductSpineSide.SINGLE,
    });
    resetSpineResult();
  };

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      title={<span className='title-18 md:title-24 absolute md:left-1/2 md:-translate-x-1/2'>{tHome('book_spine')}</span>}
      size='md'
      className='w-full md:max-w-[600px] [&>div:last-child]:border-t-0'
      footer={
        <div className='flex justify-center'>
          <Button
            form='calculate-spine-form'
            type='button'
            variant='primary'
            size='lg'
            className='body-16 w-full px-6 md:w-47'
            onClick={onReset}
            leftIcon={<Reload className='size-6' />}>
            {tCommon('reset')}
          </Button>
        </div>
      }>
      <form id='calculate-spine-form' className='flex flex-col gap-7 p-4 md:px-10 md:pt-10 md:pb-6'>
        <FormRadioGroup
          control={control}
          name='print_side'
          label={t('print')}
          labelPlacement={isDesktop ? 'left' : 'top'}
          labelClassName='title-16 w-27'>
          <Radio label={t('single_side')} value={ProductSpineSide.SINGLE} labelClassName='input-15' />
          <Radio label={t('double_side')} value={ProductSpineSide.DOUBLE} labelClassName='input-15' />
        </FormRadioGroup>
        <FormSelect
          name='paper_id'
          options={paperOptions}
          control={control}
          label={t('paper')}
          placeholder={t('paper')}
          labelPlacement={isDesktop ? 'left' : 'top'}
          labelClassname='title-16 w-27'
          selectClassname='h-11'
          disabled={!paperOptions.length}
        />
        <Controller
          name='pages'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              label={t('page_count')}
              placeholder={t('page_count')}
              labelPlacement={isDesktop ? 'left' : 'top'}
              labelClassName='min-w-27'
              textLabelClassName='title-16'
              className='h-11'
              value={field.value || ''}
              onChange={(e) => field.onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
              error={error?.message}
              isError={!!error}
              helperText={t('snipe_note')}
              helperTextClassName='text-error! body-14!'
            />
          )}
        />
        <div className='border-border-brand bg-primary-50 my-1 flex justify-center rounded-xl border py-6'>
          <div className='flex items-center gap-3'>
            <p className='title-16'>책등:</p>
            <p className='text-text-brand'>
              {isCalculatingSpine ? (
                <span className='bg-primary-100 block h-10 w-24 animate-pulse rounded-md' />
              ) : spineData?.data.spine_width_mm ? (
                <>
                  <span className='title-32'>{spineData.data.spine_width_mm}</span> <span className='title-24'>mm</span>
                </>
              ) : (
                <>
                  <span className='title-32'>0</span> <span className='title-24'>mm</span>
                </>
              )}
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
});

CalculateSpineModal.displayName = 'CalculateSpineModal';
