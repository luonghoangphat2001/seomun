'use client';

import { toPlainPhone } from '@/lib/utils';
import { getOrderOptionDescription } from '@/apis/my/order/order.service';
import { useOrderInfiniteListQuery, decodeOrderValue, encodeOrderValue } from '@/apis/my/order/order.query';
import { useQuoteInquiryCreateMutation } from '@/apis/my/quote-inquiry/quote-inquiry.query';
import { Button, SafeImage } from '@/components/common';
import { FormInput, FormRow, FormSelect, FormTextarea, FormUpload } from '@/components/form';
import { DesignSourceType } from '@/enums/common';
import { useRouter } from '@/i18n/navigation';
import { createProductOptionGroupNameTranslator } from '@/lib/product-option-labels';
import { ROUTES } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo, type UIEvent } from 'react';
import { useAuthStore } from '@/hooks';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageTitle from '../components/PageTitle';
import { refundRequestDefault, refundRequestFormValues, refundRequestSchema } from './schema';

export const RefundRequestCreate = () => {
  const t = useTranslations();
  const translateGroupName = createProductOptionGroupNameTranslator(t);
  const router = useRouter();
  const { user, profile } = useAuthStore();

  const form = useForm<refundRequestFormValues>({
    mode: 'all',
    defaultValues: refundRequestDefault,
    resolver: zodResolver(refundRequestSchema(t)),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;
  const {
    data: orderPages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isOrdersLoading,
  } = useOrderInfiniteListQuery({ per_page: 20 }, true);
  const { mutate: createRefundInquiry, isPending } = useQuoteInquiryCreateMutation();

  const orders = useMemo(() => orderPages?.pages.flatMap((page) => page.data.orders ?? []) ?? [], [orderPages]);

  const onCreate = handleSubmit(async (input: refundRequestFormValues) => {
    if (isPending) return;

    const selectedOrder = decodeOrderValue(input.order);

    const formData = new FormData();
    formData.append('category', 'refund');
    formData.append('order_number', selectedOrder.orderNumber.trim());
    if (selectedOrder.productId) {
      formData.append('product_id', String(selectedOrder.productId));
    }
    formData.append('title', input.title.trim());
    formData.append('content', input.detail.trim());
    formData.append(
      'contact',
      toPlainPhone(input.phone || profile?.profile.mobile || profile?.profile.phone || user?.mobile || user?.phone || ''),
    );

    if (input.manager?.trim()) {
      formData.append('manager_name', input.manager.trim());
    }

    const files = (input.files ?? []).map((item) => item.file).filter((file): file is File => Boolean(file));

    files.forEach((file) => {
      formData.append(files.length === 1 ? 'attachments' : 'attachments[]', file);
    });

    createRefundInquiry(formData, {
      onSuccess: (resp) => {
        toast.success(resp.message ?? t('common.success_create'));
        router.push(ROUTES.MY_PAGE.REFUND_REQUEST);
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_create'));
      },
    });
  });

  const backToList = () => {
    router.push(ROUTES.MY_PAGE.REFUND_REQUEST);
  };

  const orderOptions = useMemo(
    () =>
      orders.map((order) => {
        const items = order.items?.length ? order.items : [undefined];

        return {
          label: (
            <div className='space-y-3 py-1'>
              {items.map((item, index) => {
                const configuration = item?.configuration;
                const designGroup = configuration?.design.design_group;
                const isWebEditor = designGroup?.source_type === DesignSourceType.WEB_EDITOR;
                const productImage =
                  (isWebEditor
                    ? configuration?.design.editor_design.front?.preview_image_path
                    : item?.product_snapshot?.first_image || designGroup?.preview_image_path) ||
                  order.product?.images ||
                  '/images/product-sample.png';
                const productName = configuration?.product_name || order.product?.name || t('common.order');
                const productDescription = item?.options ? getOrderOptionDescription(item.options, translateGroupName) : '';

                return (
                  <div key={`${order.order_number}-${index}`} className='flex gap-2'>
                    <div className='relative size-12 shrink-0 overflow-hidden rounded bg-gray-100'>
                      <SafeImage src={productImage} alt={productName} fill className='object-cover' />
                    </div>
                    <div className='flex min-w-0 flex-col justify-center gap-1.5'>
                      <p className='title-14 flex items-center gap-2 truncate'>
                        {index === 0 && (
                          <>
                            {order.order_number} <span className='bg-text-secondary inline-block size-1 rounded-full' />
                          </>
                        )}
                        {productName}
                      </p>
                      <p className='body-14 truncate'>{productDescription}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ),
          value: encodeOrderValue(order.order_number, order.product?.id),
        };
      }),
    [orders, t, translateGroupName],
  );

  const handleOrderDropdownScroll = (event: UIEvent<HTMLUListElement>) => {
    if (!hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (isNearBottom) {
      fetchNextPage();
    }
  };

  return (
    <main className='relative -mt-4 space-y-4 md:mt-0 md:space-y-8'>
      <PageTitle
        title={t('inquiry.contact_us')}
        returnRoute={ROUTES.MY_PAGE.REFUND_REQUEST}
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
          <FormRow label={t('inquiry.order_number')} labelPlacement='top' error={errors.order?.message}>
            <FormSelect
              name='order'
              control={control}
              placeholder={t('inquiry.order_number')}
              options={orderOptions}
              selectClassname='h-11'
              hideError
              disabled={isOrdersLoading || orderOptions.length === 0}
              onDropdownScroll={handleOrderDropdownScroll}
              renderSelectedValue={(option) => decodeOrderValue(String(option.value)).orderNumber || String(option.value)}
            />
          </FormRow>
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
          />
        </section>
      </FormProvider>
    </main>
  );
};
