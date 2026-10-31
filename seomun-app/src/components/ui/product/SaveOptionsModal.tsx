'use client';

import { useSavedOptionCreateMutation } from '@/apis/my/saved-options/saved-options.query';
import { Button, Modal, ModalHandle } from '@/components/common';
import { FormInput, FormTextarea } from '@/components/form';
import { useMediaQuery } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createSaveOptionsSchema, SaveOptionsFormValues } from './schema';
import { useProductStore } from './store/useProductStore';

export const SaveOptionsModal = forwardRef<ModalHandle>((_, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const quoteRequest = useProductStore((state) => state.quoteRequest);
  const formValues = useProductStore((state) => state.formValues);
  const instructionLoadOptions = t('product.instruction_load_options').split('\n');

  const methods = useForm<SaveOptionsFormValues>({
    resolver: zodResolver(createSaveOptionsSchema(t)),
    defaultValues: { optionName: '', memo: '' },
  });

  const { control, handleSubmit, reset } = methods;

  //api save option
  const { mutate: createSavedOption, isPending } = useSavedOptionCreateMutation();

  const onClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
  };

  const onSubmit = (data: SaveOptionsFormValues) => {
    if (!quoteRequest || isPending) {
      toast.error(t('common.error'));
      return;
    }

    createSavedOption(
      {
        product_id: quoteRequest.product_id,
        quantity: quoteRequest.quantity_sets.quantity,
        number_of_cases: quoteRequest.quantity_sets.multiplier,
        order_name: data.optionName,
        notes: data.memo || undefined,
        options: quoteRequest.selected_options,
        input_options: formValues?.isDirectInput ? quoteRequest.input_options : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('common.success_create'));
          reset();
          onClose();
        },
        onError: (error) => {
          toast.error(error.response?.data.message ?? t('common.fail_create'));
        },
      },
    );
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      size='md'
      title={t('product.save_options')}
      titleClassName='title-18 md:title-24 md:px-6'
      onClose={reset}
      className='md:min-w-2xl'
      closeOnOverlayClick={false}
      description={
        <p className='caption-12 text-text-secondary mt-1 pl-6'>
          주문 시 자주 사용하는 제품의 옵션을 저장하여 더욱 편리하게 이용할 수 있습니다.
        </p>
      }
      footer={
        <div className='flex justify-end gap-2 md:gap-4 md:px-6'>
          <Button variant='outline' size='md' onClick={handleClose} disabled={isPending} className='h-10 md:h-11'>
            {t('common.cancel')}
          </Button>
          <Button
            variant='primary'
            size='md'
            onClick={(e) => handleSubmit(onSubmit)(e)}
            loading={isPending}
            className='h-10 md:h-11'>
            {t('product.save')}
          </Button>
        </div>
      }>
      <FormProvider {...methods}>
        <div className='border-border-soft flex flex-col gap-6 border-t border-b px-4 py-6 max-md:border-none md:px-10 md:py-8'>
          <div className='border-text-brand caption-12 text-text-secondary border-l-4 bg-[#FEFBEC] px-4 py-3 md:hidden'>
            <ul className='space-y-2'>
              {instructionLoadOptions.map((instruction) => (
                <li key={instruction} className='flex gap-2'>
                  <span className='shrink-0'>&bull;</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
          <FormInput
            name='optionName'
            control={control}
            label={t('product.option_name')}
            placeholder={t('product.name')}
            // helperText={t('product.sp_mes_name')}
            required
            labelPlacement={isDesktop ? 'left' : 'top'}
            inputClassName='w-full'
          />
          <FormTextarea
            name='memo'
            control={control}
            label={t('product.memo')}
            placeholder={t('product.memo')}
            rows={5}
            labelPlacement={isDesktop ? 'left' : 'top'}
            containerClassName='w-full items-start'
            labelClassName='mt-2'
          />
          <div className='border-border-soft hidden border-t pt-6 md:block'>
            <ul className='space-y-2'>
              {/* <li className='body-16 text-text-secondary flex gap-2'>
                <span>•</span>
                <span>{instructionLoadOptions[0]}</span>
              </li> */}
              {instructionLoadOptions.slice(1).map((instruction) => (
                <li key={instruction} className='caption-12 text-text-secondary flex gap-2'>
                  <span className='shrink-0'>&bull;</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FormProvider>
    </Modal>
  );
});

SaveOptionsModal.displayName = 'SaveOptionsModal';
