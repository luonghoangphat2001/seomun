'use client';

import { Product } from '@/apis/product/product.response';
import { useQuoteInquiryCreateMutation } from '@/apis/my/quote-inquiry/quote-inquiry.query';
import { Button, ModalHandle } from '@/components/common';
import { FormInput, FormTextarea, FormUpload } from '@/components/form';
import { useRouter } from '@/i18n/navigation';
import { ChevDown } from '@/icons';
import { cn, toPlainPhone } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useAuthStore } from '@/hooks';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageTitle from '../components/PageTitle';
import { ProductSelectModal } from './ProductSelectModal';
import { productInquiryDefault, productInquiryFormValues, productInquirySchema } from './schema';

export const ProductInquiryCreate = () => {
  const t = useTranslations();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const productModalRef = useRef<ModalHandle>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const form = useForm<productInquiryFormValues>({
    mode: 'all',
    defaultValues: productInquiryDefault,
    resolver: zodResolver(productInquirySchema(t)),
  });
  const { control, handleSubmit, setValue } = form;
  const { mutate: createProductInquiry, isPending } = useQuoteInquiryCreateMutation();

  const onCreate = handleSubmit(async (input: productInquiryFormValues) => {
    if (isPending) return;

    const formData = new FormData();
    formData.append('category', 'product');
    formData.append('title', input.title.trim());
    formData.append('content', input.detail.trim());
    formData.append(
      'contact',
      toPlainPhone(input.phone || profile?.profile.mobile || profile?.profile.phone || user?.mobile || user?.phone || ''),
    );

    if (selectedProductId !== null) {
      formData.append('product_id', String(selectedProductId));
    }

    if (input.manager?.trim()) {
      formData.append('manager_name', input.manager.trim());
    }

    const files = (input.files ?? []).map((item) => item.file).filter((file): file is File => Boolean(file));

    files.forEach((file) => {
      formData.append(files.length === 1 ? 'attachments' : 'attachments[]', file);
    });

    createProductInquiry(formData, {
      onSuccess: (resp) => {
        toast.success(resp.message ?? t('common.success_create'));
        router.push(ROUTES.MY_PAGE.PRODUCT_INQUIRY);
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_create'));
      },
    });
  });

  const backToList = () => {
    router.push(ROUTES.MY_PAGE.PRODUCT_INQUIRY);
  };

  const onSelectProduct = (product: Partial<Product>) => {
    setSelectedProductId(product?.id ?? null);
    setValue('product', product?.name?.ko ?? '', { shouldValidate: true });
  };

  return (
    <main className='relative space-y-4 md:mt-0 md:space-y-8'>
      <PageTitle
        title={t('inquiry.contact_us')}
        returnRoute={ROUTES.MY_PAGE.PRODUCT_INQUIRY}
        extra={
          <div className='mobile-button flex gap-3 md:gap-4'>
            <Button variant='outline' className='body-16 h-12 flex-1 md:h-10 md:w-auto' onClick={backToList}>
              {t('common.cancel')}
            </Button>
            <Button className='body-16 h-12 flex-1 md:h-10 md:w-auto' onClick={onCreate} loading={isPending}>
              {t('inquiry.write')}
            </Button>
          </div>
        }
      />
      <FormProvider {...form}>
        <section className='max-w-230 space-y-4 md:space-y-6'>
          <Controller
            name='product'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className='space-y-1.5'>
                <label className='body-16 text-text-main block'>{t('inquiry.product')}</label>
                <div className='relative'>
                  <div
                    onClick={() => productModalRef.current?.open()}
                    className={cn(
                      'flex h-11 w-full cursor-pointer items-center justify-between rounded-[8px] border bg-white px-3 transition-all',
                      field.value ? 'text-text-main' : 'text-gray-400',
                      error ? 'border-error' : 'border-border-soft',
                    )}>
                    <span className='input-15 truncate'>{field.value || t('inquiry.goods')}</span>
                    <ChevDown className='size-5 shrink-0' />
                  </div>
                  {error && <p className='text-error caption-12 mt-1'>{error.message}</p>}
                </div>
              </div>
            )}
          />
          <ProductSelectModal ref={productModalRef} onSelect={onSelectProduct} />
          <FormInput
            labelPlacement={'top'}
            label={t('inquiry.title')}
            control={control}
            name='title'
            placeholder={t('inquiry.enter_title')}
          />
          <FormTextarea
            labelPlacement={'top'}
            label={t('inquiry.detail')}
            control={control}
            name='detail'
            placeholder={t('inquiry.enter_inquiry')}
            rows={10}
          />
          <FormInput
            labelPlacement={'top'}
            label={t('inquiry.person_in_charge')}
            control={control}
            name='manager'
            placeholder={t('inquiry.person_in_charge')}
          />
          <FormInput
            labelPlacement={'top'}
            label={t('inquiry.contact')}
            control={control}
            name='phone'
            placeholder={t('inquiry.contact')}
            helperText={t('inquiry.notification_text_message')}
            phoneFormat
          />
          <FormUpload
            labelPlacement={'top'}
            label={t('inquiry.attachment')}
            control={control}
            name='files'
            labelButton={t('inquiry.file_upload')}
            helperText={t('inquiry.image_limit')}
            multiple={true}
            accept='.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg'
          />
        </section>
      </FormProvider>
    </main>
  );
};
