'use client';

import { useReviewCreateMutation } from '@/apis/my/review/review.query';
import { ReviewUnreviewedOrderItemRESP } from '@/apis/my/review/review.response';
import { useUploadFileMutation } from '@/apis/file/file.query';
import { Button, FileItem, Modal, ModalHandle } from '@/components/common';
import { FormTextarea, FormUpload } from '@/components/form';
import { useMediaQuery } from '@/hooks';
import { PointLogo, Star } from '@/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { forwardRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

type ReviewModalProps = {
  detail?: ReviewUnreviewedOrderItemRESP | null;
};

type ReviewFormValues = {
  content: string;
  rating: number;
  files: FileItem[];
};

const reviewFormDefaultValues: ReviewFormValues = {
  content: '',
  rating: 0,
  files: [],
};

export const ReviewModal = forwardRef<ModalHandle, ReviewModalProps>(({ detail }, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [hover, setHover] = useState(0);

  const { control, handleSubmit, reset, setValue, watch } = useForm<ReviewFormValues>({
    mode: 'all',
    defaultValues: reviewFormDefaultValues,
  });

  const rating = watch('rating');

  const { mutateAsync: uploadFile, isPending: isUploadingFile } = useUploadFileMutation();
  const { mutateAsync: createReview, isPending: isCreatingReview } = useReviewCreateMutation();

  const reviewTitle = detail?.product?.name || detail?.product_snapshot?.name || detail?.title || '-';
  const reviewImage = detail?.product?.images?.[0] || detail?.product?.first_image || '/images/design-sample-1.png';
  const isPending = isUploadingFile || isCreatingReview;

  useEffect(() => {
    reset(reviewFormDefaultValues);
    setHover(0);
  }, [detail, reset]);

  const handleClose = () => {
    reset(reviewFormDefaultValues);
    setHover(0);
  };

  const onSubmit = handleSubmit(async (input) => {
    if (!detail?.order_id || !detail?.product_id) {
      toast.error(t('common.error'));
      return;
    }

    if (!input.rating) {
      toast.error(t('validation.required', { field: t('product.star') }));
      return;
    }

    try {
      const images: string[] = [];

      for (const fileItem of input.files ?? []) {
        if (!fileItem.file) continue;

        const response = await uploadFile({ type: 'reviews', file: fileItem.file });
        images.push(response.data.file.url || response.data.file.path);
      }

      await createReview({
        product_id: detail.product_id,
        order_id: detail.order_id,
        rating: input.rating as 1 | 2 | 3 | 4 | 5,
        title: detail.product?.name || detail.product_snapshot?.name || detail.title,
        content: input.content.trim(),
        ...(images.length > 0 ? { images } : {}),
      });

      toast.success(t('common.success_create'));
      if (ref && 'current' in ref) {
        ref.current?.close();
      }
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      toast.error(message ?? t('common.fail_create'));
    }
  });

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      title={
        <div className='md:px-6 md:pt-2.5 md:pb-0.5'>
          <p className='title-18 md:title-24'>{t('sidebar.items.write_review')}</p>
        </div>
      }
      titleClassName='pt-0'
      size='md'
      className='max-w-301'
      onClose={handleClose}
      footer={
        <div className='flex justify-end gap-3 md:gap-4 md:px-6 md:pt-2'>
          <Button
            variant='outline'
            onClick={() => {
              if (ref && 'current' in ref) {
                ref.current?.close();
              }
            }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit} loading={isPending} disabled={!detail?.order_id || !detail?.product_id}>
            {t('common.write_review')}
          </Button>
        </div>
      }>
      <div className={cn('border-border-soft w-full border-y max-md:border-none')}>
        <div className='bg-primary-50 mx-4 my-6 flex items-center gap-2 p-3 md:m-0 md:px-10 md:py-3'>
          <PointLogo className='size-8' />
          <p className='body-16'>
            {t.rich('common.review_note', {
              point: '100',
              span: (chunks) => <span className='title-16 text-text-brand'>{chunks}</span>,
            })}
          </p>
        </div>

        <div className='scrollbar-hide max-h-122 space-y-4 overflow-auto px-4 pb-6 md:max-h-150 md:space-y-6 md:px-10 md:py-8'>
          <div className='flex items-center gap-6'>
            <Image src={reviewImage} alt={reviewTitle} width={107} height={60} className='rounded object-cover' />
            <p className='title-24'>{reviewTitle}</p>
          </div>
          <div className='border-border-soft h-px w-full border-t'></div>
          <div className='space-y-2'>
            <label className='body-16 block'>
              {t('product.star')} <span className='text-error ml-0.5'>*</span>
            </label>
            <div className='flex gap-1'>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hover || rating);

                return (
                  <button
                    type='button'
                    key={star}
                    className={cn('cursor-pointer text-gray-200')}
                    onClick={() => setValue('rating', star, { shouldValidate: true, shouldDirty: true })}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}>
                    <Star className={cn('size-8 transition-all', isFilled ? 'text-[#FFC107]' : '')} />
                  </button>
                );
              })}
            </div>
          </div>

          <FormTextarea
            control={control}
            name='content'
            label={t('common.review_content')}
            labelPlacement='top'
            required
            placeholder={t('placeholder.enter_hashtag')}
            // rows={8}
          />

          <div className='space-y-2'>
            <label className='body-16 block'>{t('common.attachment')}</label>
            <FormUpload control={control} name='files' labelButton={t('common.attach_photo')} />

            <p className='body-14 text-text-secondary'>{t('common.attach_note')}</p>
          </div>

          {/* <div className='space-y-2'>
            <FormInput label={t('common.hashtag')} control={control} name='' placeholder={t('placeholder.enter_hashtag')} />
            <div className='flex gap-1.5'>
              <p className='bg-text-brand-soft body-14 rounded-full px-2 py-1'>#해시태그</p>
              <p className='bg-text-brand-soft body-14 rounded-full px-2 py-1'>#해시태그</p>
            </div>
          </div> */}
        </div>
      </div>
    </Modal>
  );
});

ReviewModal.displayName = 'ReviewModal';
