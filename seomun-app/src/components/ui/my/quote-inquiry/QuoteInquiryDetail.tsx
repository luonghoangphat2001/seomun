'use client';

import { useQuoteInquiryCreateCommentMutation, useQuoteInquiryDetailQuery } from '@/apis/my/quote-inquiry/quote-inquiry.query';
import { Button, Description, DescriptionContent, ModalHandle, SafeImage } from '@/components/common';
import Loading from '@/components/common/loading';
import { FormTextarea, FormUpload } from '@/components/form';
import { InquiryComments } from '@/components/ui/my/components/InquiryComments';
import { DATE_FORMAT } from '@/constants/common';
import { PaperClip } from '@/icons';
import { formatDate, formatFileSize } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import PageTitle from '../components/PageTitle';
import { QuoteInquiryDetailModal } from './QuoteInquiryDetailModal';
import { additionalInquiryDefault, AdditionalInquiryFormValues, additionalInquirySchema } from './schema';
import toast from 'react-hot-toast';

export const QuoteInquiryDetail = () => {
  const t = useTranslations();
  const { id } = useParams();
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const additionalInquiryModalRef = useRef<ModalHandle>(null);
  const inquiryId = Number(id) || undefined;

  const form = useForm<AdditionalInquiryFormValues>({
    mode: 'all',
    resolver: zodResolver(additionalInquirySchema(t)),
    defaultValues: additionalInquiryDefault,
  });
  const { control, handleSubmit, reset } = form;
  const { data: inquiry, isLoading } = useQuoteInquiryDetailQuery(inquiryId);
  const { mutate: createComment, isPending } = useQuoteInquiryCreateCommentMutation();

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
    <main className='relative max-w-230 space-y-3 md:mt-0 md:space-y-4 md:space-y-8'>
      <PageTitle
        title={
          <p>
            <span className='text-text-brand'>[{t('inquiry.quote_inquiry')}]</span> {`${inquiry.title}`}
          </p>
        }
        returnRoute={ROUTES.MY_PAGE.QUOTE_INQUIRY}
      />

      <div className='mobile-seperator'></div>

      <div className='md:border-border-soft space-y-3 md:space-y-4 md:border'>
        <div className='md:bg-fill-light flex items-center gap-3 md:gap-6 md:p-3'>
          <div className='relative h-[76px] w-[97px] shrink-0 overflow-hidden rounded bg-gray-100 md:h-[108px] md:w-[139px]'>
            <SafeImage
              src={inquiry.productImage || '/images/product-sample.png'}
              alt={inquiry.product}
              fill
              className='object-cover'
            />
          </div>
          <div className='space-y-2 md:space-y-3 md:py-3'>
            <div className='flex items-center gap-1 md:gap-2'>
              <span className='body-14 w-20 md:w-16'>{t('inquiry.data_written')}</span>
              <span className='title-14'>{inquiry.createdAt}</span>
            </div>
            <div className='flex items-center gap-1 md:gap-2'>
              <span className='body-14 w-20 md:w-16'>{t('inquiry.person_in_charge')}</span>
              <span className='title-14'>{inquiry.manager}</span>
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
                    value: <div className='body-14 md:body-16 whitespace-pre-wrap'>{inquiry.product}</div>,
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

      {/* {!showAdditionalForm && (
        <div className='hidden justify-end md:flex'>
          <Button
            variant='primary'
            size='lg'
            onClick={() => {
              setShowAdditionalForm(true);
            }}>
            {t('inquiry.additional_inquiries')}
          </Button>
        </div>
      )} */}

      {showAdditionalForm && (
        <div className='border-border-soft hidden space-y-4 rounded-[12px] p-5 md:block md:border'>
          <div className='border-text-main flex items-end justify-between border-b pb-4'>
            <span className='title-40 leading-none'>Q</span>
            <span className='body-14'>{formatDate(new Date(), DATE_FORMAT.DATE_WITH_DOT)}</span>
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
                multiple={false}
                maxFiles={1}
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

      <QuoteInquiryDetailModal
        ref={additionalInquiryModalRef}
        form={form}
        loading={isPending}
        onSubmit={(e) => handleSubmit(onSubmit)(e)}
      />
    </main>
  );
};
