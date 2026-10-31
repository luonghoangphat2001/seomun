'use client';

import { useQuoteInquiryCreateCommentMutation, useQuoteInquiryDetailQuery } from '@/apis/my/quote-inquiry/quote-inquiry.query';
import { useOrderHistoryDetailQuery } from '@/apis/my/order/order.query';
import { getOrderOptionDescription } from '@/apis/my/order/order.service';
import { Button, Description, DescriptionContent, ModalHandle, SafeImage } from '@/components/common';
import Loading from '@/components/common/loading';
import { FormTextarea, FormUpload } from '@/components/form';
import { InquiryComments } from '@/components/ui/my/components/InquiryComments';
import { DesignSourceType } from '@/enums/common';
import { PaperClip } from '@/icons';
import { createProductOptionGroupNameTranslator } from '@/lib/product-option-labels';
import { formatFileSize } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageTitle from '../components/PageTitle';
import { PaymentInquiryDetailModal } from './PaymentInquiryDetailModal';
import { additionalInquiryDefault, AdditionalInquiryFormValues, additionalInquirySchema } from './schema';

export const PaymentInquiryDetail = () => {
  const t = useTranslations();
  const translateGroupName = createProductOptionGroupNameTranslator(t);
  const { id } = useParams();
  const inquiryId = Number(id) || undefined;
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const additionalInquiryModalRef = useRef<ModalHandle>(null);

  const form = useForm<AdditionalInquiryFormValues>({
    mode: 'all',
    resolver: zodResolver(additionalInquirySchema(t)),
    defaultValues: additionalInquiryDefault,
  });
  const { control, handleSubmit, reset } = form;
  const { data: inquiry, isLoading } = useQuoteInquiryDetailQuery(inquiryId);
  const { data: orderDetail } = useOrderHistoryDetailQuery(inquiry?.order);
  const { mutate: createComment, isPending } = useQuoteInquiryCreateCommentMutation();

  const productImages = orderDetail?.items.length
    ? orderDetail.items.map((item) => ({
        src:
          (item.configuration.design.design_group?.source_type === DesignSourceType.WEB_EDITOR
            ? item.design.front?.preview_image_path || item.configuration.design.design_group?.preview_image_path
            : item.product_snapshot?.first_image ||
              item.design.front?.preview_image_path ||
              item.configuration.design.design_group?.preview_image_path) ||
          orderDetail.product?.images ||
          inquiry?.productImage ||
          '/images/product-sample.png',
        alt: item.title,
      }))
    : [
        {
          src: inquiry?.productImage || '/images/product-sample.png',
          alt: inquiry?.product || t('common.product_name'),
        },
      ];

  const onSubmit = useCallback(
    async (data: AdditionalInquiryFormValues) => {
      if (!inquiryId || isPending) return;

      const attachments = (data.files ?? [])
        .map((item) => item.file)
        .filter((file): file is File => Boolean(file))
        .slice(0, 1);

      createComment(
        {
          id: inquiryId,
          content: data.comment.trim(),
          attachments,
        },
        {
          onSuccess: (resp) => {
            toast.success(resp.message ?? t('common.success_create'));
            reset(additionalInquiryDefault);
            setShowAdditionalForm(false);
            additionalInquiryModalRef.current?.close();
          },
          onError: (error) => {
            toast.error(error.response?.data.message ?? t('common.fail_create'));
          },
        },
      );
    },
    [additionalInquiryModalRef, createComment, inquiryId, isPending, reset, t],
  );

  if (isLoading) {
    return <Loading displayText />;
  }

  if (!inquiry) {
    return null;
  }

  return (
    <main className='relative max-w-230 space-y-3 md:mt-0 md:space-y-8'>
      <PageTitle
        title={
          <p>
            <span className='text-text-brand'>[{t('inquiry.payment_inquiry')}]</span> {`${inquiry.title}`}
          </p>
        }
        returnRoute={ROUTES.MY_PAGE.PAYMENT_INQUIRY}
      />

      <div className='mobile-seperator'></div>

      <div className='md:border-border-soft space-y-3 md:space-y-4 md:border'>
        <div className='md:bg-fill-light flex items-center gap-3 md:gap-6 md:p-3'>
          <div className='flex shrink-0 flex-wrap gap-2'>
            {productImages.map((productImage, index) => (
              <div
                key={`${productImage.src}-${index}`}
                className='relative h-[76px] w-[97px] overflow-hidden rounded bg-gray-100 md:h-[108px] md:w-[139px]'>
                <SafeImage src={productImage.src} alt={productImage.alt} fill className='object-cover' />
              </div>
            ))}
          </div>
          <div className='space-y-2 md:space-y-3 md:py-3'>
            <div className='flex items-center gap-1 md:gap-2'>
              <span className='body-14 w-20 md:w-16'>{t('inquiry.data_written')}</span>
              <span className='title-14'>{inquiry.createdAt}</span>
            </div>
            <div className='flex items-center gap-1 md:gap-2'>
              <span className='body-14 w-20 md:w-16'>{t('inquiry.person_in_charge')}</span>
              <span className='title-14'>{inquiry.manager || '-'}</span>
            </div>
            <div className='flex items-center gap-1 md:gap-2'>
              <span className='body-14 w-20 md:w-16'>{t('inquiry.mobile')}</span>
              <span className='title-14'>{inquiry.phone}</span>
            </div>
          </div>
        </div>

        <Description
          title={
            <span className='title-40 flex items-end justify-between'>
              Q <span className='body-14'>{inquiry.createdAt}</span>
            </span>
          }
          titleClassName='w-full'
          isCollapse={false}>
          <DescriptionContent
            labelClassName='items-start'
            className='border-x-0'
            rows={[
              {
                items: [
                  {
                    label: t('inquiry.title'),
                    value: <div className='body-14 md:body-16 whitespace-pre-wrap'>{inquiry.title}</div>,
                  },
                ],
              },
              {
                items: [
                  {
                    label: t('inquiry.product'),
                    value: orderDetail?.items.length ? (
                      <ul className='body-14 md:body-16 list-disc space-y-1 pl-5'>
                        {orderDetail.items.map((item) => {
                          const optionDescription = getOrderOptionDescription(item.options, translateGroupName);

                          return (
                            <li key={item.id}>
                              {item.title}
                              {optionDescription ? ` (${optionDescription})` : ''}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className='body-14 md:body-16 whitespace-pre-wrap'>{inquiry.product}</div>
                    ),
                  },
                ],
              },
              {
                items: [
                  {
                    label: t('inquiry.detail'),
                    value: <div className='body-14 md:body-16 whitespace-pre-wrap'>{inquiry.detail}</div>,
                  },
                ],
              },
              {
                items: [
                  {
                    label: t('inquiry.attachment'),
                    value:
                      inquiry.files.length > 0 ? (
                        <div className='flex flex-wrap gap-6'>
                          {inquiry.files.map((file) => (
                            <button
                              key={file.url}
                              type='button'
                              onClick={() => window.open(file.url, '_blank', 'noopener,noreferrer')}
                              className='text-text-brand-secondary flex items-center gap-1.5'>
                              <PaperClip className='size-5' />
                              <span className='body-14 md:body-16 underline'>
                                {file.name} ({formatFileSize(file.size)})
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        '-'
                      ),
                  },
                ],
              },
            ]}
          />
        </Description>

        <InquiryComments comments={inquiry.comments} />
      </div>

      {showAdditionalForm && (
        <div className='border-border-soft hidden space-y-4 rounded-[12px] p-5 md:block md:border'>
          <div className='border-text-main flex items-end justify-between border-b pb-4'>
            <span className='title-40 leading-none'>Q</span>
            <span className='body-14'>{inquiry.createdAt}</span>
          </div>
          <FormProvider {...form}>
            <form className='space-y-4' onSubmit={(e) => handleSubmit(onSubmit)(e)}>
              <FormTextarea
                control={control}
                name='comment'
                label={t('inquiry.company_name')}
                placeholder={t('inquiry.enter_comment')}
                rows={10}
                labelPlacement='top'
                className='md:min-h-[200px]'
                required
              />
              <FormUpload
                control={control}
                name='files'
                label={t('inquiry.attachment')}
                labelButton={t('inquiry.file_upload')}
                helperText={t('inquiry.image_limit')}
                labelPlacement='top'
              />
              <div className='flex justify-center'>
                <Button type='submit' size='lg' variant='primary' loading={isPending}>
                  {t('common.check')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}

      <PaymentInquiryDetailModal
        ref={additionalInquiryModalRef}
        form={form}
        onSubmit={(e) => handleSubmit(onSubmit)(e)}
        loading={isPending}
      />
    </main>
  );
};
