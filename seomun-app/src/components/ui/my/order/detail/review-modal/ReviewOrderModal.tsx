'use client';

import type { OrderHistoryOrderItemRESP } from '@/apis/my/order/order.response';
import { useOrderHistoryReviewMutation } from '@/apis/my/order/order.query';
import { useUploadFileMutation } from '@/apis/file/file.query';
import { Button, FileItem, Modal, ModalHandle, SafeImage } from '@/components/common';
import { FormTextarea, FormUpload } from '@/components/form';
import { useMediaQuery } from '@/hooks';
import { File2, PointLogo, Star } from '@/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

type ReviewOrderModalProps = {
  orderId?: number;
  items?: OrderHistoryOrderItemRESP[];
  productThumbnail?: string | null;
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

export const ReviewOrderModal = forwardRef<ModalHandle, ReviewOrderModalProps>(
  ({ orderId, items = [], productThumbnail }, ref) => {
    const t = useTranslations();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [hover, setHover] = useState(0);
    const { control, handleSubmit, reset, setValue, watch } = useForm<ReviewFormValues>({
      mode: 'all',
      defaultValues: reviewFormDefaultValues,
    });
    const rating = watch('rating');
    const { mutateAsync: uploadFile, isPending: isUploadingFile } = useUploadFileMutation();
    const { mutateAsync: createReview, isPending: isCreatingReview } = useOrderHistoryReviewMutation();
    const isPending = isUploadingFile || isCreatingReview;

    useEffect(() => {
      reset(reviewFormDefaultValues);
      setHover(0);
    }, [items, orderId, reset]);

    const handleClose = () => {
      reset(reviewFormDefaultValues);
      setHover(0);
    };

    const onSubmit = handleSubmit(async (input) => {
      if (!orderId || items.length === 0) {
        toast.error(t('common.error'));
        return;
      }

      if (!input.rating) {
        toast.error(t('validation.required', { field: t('product.star') }));
        return;
      }

      if (!input.content.trim()) {
        toast.error(t('validation.required', { field: t('common.review_content') }));
        return;
      }

      try {
        const images: string[] = [];

        for (const fileItem of input.files) {
          if (!fileItem.file) continue;

          const response = await uploadFile({ type: 'reviews', file: fileItem.file });
          images.push(response.data.file.url || response.data.file.path);
        }

        for (const item of items) {
          await createReview({
            product_id: item.product_id,
            order_id: orderId,
            rating: input.rating as 1 | 2 | 3 | 4 | 5,
            title: item.title,
            content: input.content.trim(),
            ...(images.length > 0 ? { images } : {}),
          });
        }

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
            <Button onClick={onSubmit} loading={isPending} disabled={!orderId || items.length === 0}>
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
            <div className='space-y-4'>
              {items.map((item) => {
                const designGroup = item.configuration.design.design_group;
                const isWebEditor = designGroup?.source_type === 'web_editor';
                const previewImages = !isWebEditor
                  ? item.product_snapshot?.first_image
                    ? [item.product_snapshot.first_image]
                    : productThumbnail
                      ? [productThumbnail]
                      : []
                  : [item.design.front?.preview_image_path, item.design.back?.preview_image_path].filter(
                      (image): image is string => Boolean(image),
                    );

                return (
                  <div key={item.id} className='flex items-center gap-6'>
                    <div className='flex shrink-0 gap-2'>
                      {previewImages.length > 0 ? (
                        previewImages.map((image, imageIndex) => (
                          <div
                            key={`${image}-${imageIndex}`}
                            className='border-border-soft relative h-15 w-26.75 overflow-hidden rounded border'>
                            <SafeImage src={image} alt={item.title} fill className='object-cover' />
                          </div>
                        ))
                      ) : (
                        <div className='border-border-soft flex h-15 w-26.75 items-center justify-center rounded border'>
                          <File2 className='text-text-secondary size-6' />
                        </div>
                      )}
                    </div>
                    <p className='title-24'>{item.title}</p>
                  </div>
                );
              })}
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
            />

            <div className='space-y-2'>
              <label className='body-16 block'>{t('common.attachment')}</label>
              <FormUpload control={control} name='files' labelButton={t('common.attach_photo')} />
              <p className='body-14 text-text-secondary'>{t('common.attach_note')}</p>
            </div>
          </div>
        </div>
      </Modal>
    );
  },
);

ReviewOrderModal.displayName = 'ReviewOrderModal';
