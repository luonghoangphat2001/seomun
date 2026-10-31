'use client';

import { useGuideListQuery } from '@/apis/guide/guide.query';
import {
  Button,
  ImagePreviewModal,
  ImagePreviewModalHandle,
  Modal,
  ModalHandle,
  SafeImage,
  Select,
  SelectOption,
} from '@/components/common';
import { PostProcessingCode } from '@/enums/product';
import { Careright } from '@/icons';
import { cn, formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

interface PostProcessingDetailItemProps {
  type: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  price?: number;
}

export const PostProcessingDetailItem = ({ type, label, value, onChange, options, price }: PostProcessingDetailItemProps) => {
  const t = useTranslations('product');
  const [isOpen, setIsOpen] = useState(true);
  const modalRef = useRef<ImagePreviewModalHandle>(null);
  const fileOperationModalRef = useRef<ModalHandle>(null);
  const { data: guideList } = useGuideListQuery({ type: type as PostProcessingCode });
  const guide = guideList?.list[0];
  const images = guide?.attachments.map((attachment) => attachment.url) ?? [];

  return (
    <div className='bg-fill-light border-border-soft w-full space-y-3 rounded-lg border p-3 md:space-y-2 md:bg-white'>
      <div className='flex flex-wrap items-center gap-3'>
        <div onClick={() => setIsOpen(!isOpen)} className='flex cursor-pointer items-center gap-2'>
          <Careright className={cn('size-4 transition-transform', isOpen ? 'rotate-90' : '-rotate-90')} />
          <span className='input-15'>{label}</span>
        </div>

        <Select
          options={options || []}
          value={value || options[0]?.value || ''}
          onChange={(val) => onChange?.(val as string)}
          className='hidden w-[140px] md:block'
          selectClassname='h-10 !bg-white'
        />

        <div className='flex-1' />

        <span className='input-15 md:bg-border-light border-border-soft rounded-lg border bg-white p-3'>
          {formatCurrency(price ?? 0)}
        </span>
      </div>

      {isOpen && (
        <div className='space-y-2'>
          <div className='scrollbar-hide flex gap-1 overflow-x-auto md:gap-3'>
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => modalRef.current?.open(index)}
                className='flex flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden bg-[#d9d9d9] transition-opacity hover:opacity-90'>
                <SafeImage src={img} alt={`${label} preview ${index + 1}`} width={180} height={100} className='object-contain' />
              </div>
            ))}
          </div>

          <div className='flex items-center justify-between gap-3 md:hidden'>
            <Select
              options={options || []}
              value={value || options[0]?.value || ''}
              onChange={(val) => onChange?.(val as string)}
              className='flex-1'
              selectClassname='h-10 !bg-white'
            />
          </div>

          <div className='bg-border-light flex flex-col justify-between gap-3 p-0 md:flex-row md:items-center md:gap-5 md:p-3'>
            {guide?.content && (
              <div
                className='caption-12 text-text-main [&_a]:text-text-brand [&_blockquote]:border-text-brand [&_h1]:body-16 [&_h2]:body-14 [&_td]:border-border-soft [&_th]:border-border-soft flex-1 break-words [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h1]:mb-2 [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:font-semibold [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_li]:mb-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:bg-white [&_th]:p-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5'
                dangerouslySetInnerHTML={{ __html: guide.content }}
              />
            )}
            <Button
              variant='outline-primary'
              type='button'
              size='xs'
              className='body-14 w-fit shrink-0'
              onClick={() => fileOperationModalRef.current?.open()}>
              {t('file_operation_method')}
            </Button>
          </div>
        </div>
      )}

      <ImagePreviewModal ref={modalRef} images={images} />
      <Modal ref={fileOperationModalRef} size='lg' title={t('file_operation_method')} bodyClassName='p-4 md:p-6'>
        <div className='space-y-4'>
          {images.length > 0 && (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type='button'
                  onClick={() => modalRef.current?.open(index)}
                  className='overflow-hidden rounded-lg bg-[#d9d9d9] transition-opacity hover:opacity-90'>
                  <SafeImage
                    src={image}
                    alt={`${label} preview ${index + 1}`}
                    width={400}
                    height={225}
                    className='h-auto w-full object-contain'
                  />
                </button>
              ))}
            </div>
          )}

          {guide?.content && (
            <div
              className='body-14 text-text-main md:body-16 [&_a]:text-text-brand [&_blockquote]:border-text-brand [&_h1]:body-16 [&_h2]:body-14 [&_td]:border-border-soft [&_th]:border-border-soft break-words [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h1]:mb-2 [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:font-semibold [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_li]:mb-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:bg-white [&_th]:p-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5'
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
