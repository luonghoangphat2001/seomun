'use client';

import { Product } from '@/apis/product/product.response';
import { useDesignDetailQuery } from '@/apis/design/design.query';
import { Modal, ModalHandle, SafeImage } from '@/components/common';
import { DesignSide } from '@/enums/design';
import { ChevronRight, Star } from '@/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

interface ProductInfoLeftProps {
  product: Product;
}

export const ProductInfoLeft = ({ product }: ProductInfoLeftProps) => {
  const t = useTranslations('product');
  const searchParams = useSearchParams();
  const designGroupId = Number(searchParams.get('design_group_id'));
  const { data: designDetail } = useDesignDetailQuery(
    Number.isInteger(designGroupId) && designGroupId > 0 ? designGroupId : undefined,
  );
  const designPreviewImages = useMemo(
    () =>
      [DesignSide.FRONT, DesignSide.BACK]
        .map((side) => designDetail?.artworks.find((artwork) => artwork.side === side)?.preview_image_path)
        .filter((image): image is string => Boolean(image)),
    [designDetail],
  );
  const imageList = useMemo(
    () => [...new Set([...designPreviewImages, ...product.images])],
    [designPreviewImages, product.images],
  );
  const defaultImage = product.first_image || product.images[0] || '';
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const displayImage = hoveredImage && imageList.includes(hoveredImage) ? hoveredImage : imageList[0] || defaultImage;

  const notesList = [
    // { title: t('simple_product_description'), content: product?.short_description || '-' },
    { title: t('important_note'), content: product?.specification?.notes || '-' },
  ];

  const modalRef = useRef<ModalHandle>(null);
  const [selectedNote, setSelectedNote] = useState<(typeof notesList)[0] | null>(null);

  const handleOpenNote = (note: (typeof notesList)[0]) => {
    setSelectedNote(note);
    modalRef.current?.open();
  };

  return (
    <div className='w-full space-y-3 bg-gray-50 md:space-y-4 md:bg-white lg:w-[500px]'>
      <div className='space-y-3 bg-white px-4 pb-3 md:px-0 md:pb-0'>
        <div className='space-y-3 bg-white md:hidden'>
          <nav className='body-14 text-text-secondary flex items-center gap-1 p-1'>
            <span>Home</span>
            <span>
              <ChevronRight className='size-5' />
            </span>
            <span>명함</span>
            <span>
              <ChevronRight className='size-5' />
            </span>
            <span className='text-text-main title-14 font-semibold'>일반 명함</span>
          </nav>
          <div className='space-y-1.5'>
            <h1 className='title-24'>일반 명함</h1>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-1'>
                <span className='body-14'>{t('star')} (4.7)</span>
                <Star className='fill-text-brand text-text-brand size-3.5' />
              </div>
              <div className='bg-border-soft h-3 w-[1px]' />
              <div className='body-14 underline underline-offset-4'>{t('review')} (102)</div>
            </div>
          </div>
        </div>

        <div className='border-border-soft relative aspect-[4/3] w-full overflow-hidden border bg-gray-50 md:aspect-square'>
          <SafeImage src={displayImage} alt={product.name['ko']} fill className='object-contain' />
        </div>

        <div className='grid grid-cols-4 gap-1.5 md:gap-3' onMouseLeave={() => setHoveredImage(null)}>
          {imageList.map((img, idx) => (
            <div
              key={idx}
              className={cn(
                'relative h-20 w-full cursor-pointer overflow-hidden border-2 transition-all md:h-24',
                displayImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300',
              )}
              onMouseEnter={() => setHoveredImage(img)}>
              <SafeImage src={img} alt={`${product.name['ko']} thumbnail ${idx}`} fill className='object-cover' />
            </div>
          ))}
        </div>

        {/* <Button
          variant='outline'
          size='lg'
          leftIcon={<SelectionPlus className='size-5 md:size-6' />}
          className='body-14 sm:body-16 h-9 w-full md:h-11 md:w-auto'>
          {t('download_custom')}
        </Button> */}
      </div>

      <div className='text-text-secondary hidden space-y-3 md:block'>
        {notesList.map((note, index) => (
          <div key={index} className='space-y-2 rounded-lg bg-gray-50 p-4'>
            <h3 className='title-14'>{note.title}</h3>
            <div className={cn('body-14 scrollbar-thin max-h-100 space-y-1 overflow-y-auto whitespace-pre-line')}>
              {note.content}
            </div>
          </div>
        ))}
      </div>

      <div
        className='flex cursor-pointer items-center justify-between bg-white p-4 md:hidden'
        onClick={() => handleOpenNote(notesList[0])}>
        <p className='title-14'>{t('simple_product_description')}</p>
        <ChevronRight className='-rotation-90 size-5' />
      </div>

      <div
        className='flex cursor-pointer items-center justify-between bg-white p-4 md:hidden'
        onClick={() => handleOpenNote(notesList[1])}>
        <p className='title-14'>{t('important_note')}</p>
        <ChevronRight className='-rotation-90 size-5' />
      </div>

      <Modal ref={modalRef} position='bottom' title={selectedNote?.title} className='[&>div:first-child]:border-transparent'>
        <div className='p-4 pt-0'>
          <div className='body-14 scrollbar-thin max-h-[50dvh] space-y-1 overflow-y-auto text-justify whitespace-pre-line'>
            {selectedNote?.content || '-'}
          </div>
        </div>
      </Modal>
    </div>
  );
};
