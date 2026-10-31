import { useWebEditorStore } from '@/hooks';
import { SafeImage } from '@/components/common';
import { ArrowCircleDown, ArrowCircleUp, Plus, Trash } from '@/icons';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export const FooterPreview = () => {
  const t = useTranslations('editor');
  const searchParams = useSearchParams();
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const { activeSide, datas, thumbnails, selectedTemplateId, selectSide, addSide, deleteSide } = useWebEditorStore();
  const designGroupId = Number(searchParams.get('design_group_id'));
  const isCreateMode = !Number.isInteger(designGroupId) || designGroupId <= 0;
  const canManageSides = isCreateMode && !selectedTemplateId;

  return (
    <footer
      className={`bg-border-light border-border-soft relative hidden items-center justify-center border-t md:flex ${
        isPreviewVisible ? '' : 'h-0 border-t-0'
      }`}>
      <button
        type='button'
        aria-label={t(isPreviewVisible ? 'hide_page_previews' : 'show_page_previews')}
        title={t(isPreviewVisible ? 'hide_page_previews' : 'show_page_previews')}
        onClick={() => setIsPreviewVisible((visible) => !visible)}
        className='border-border-soft absolute bottom-full left-4 z-10 flex h-7 w-12 cursor-pointer items-center justify-center rounded-t-md border border-b-0 bg-white transition-colors hover:bg-gray-100'>
        {isPreviewVisible ? <ArrowCircleDown className='size-5' /> : <ArrowCircleUp className='size-5' />}
      </button>
      {isPreviewVisible && (
        <div className='scrollbar-hide flex max-w-[calc(100dvw-440px)] items-center gap-12 overflow-x-auto px-12 py-4'>
          <div className='flex items-center gap-12'>
            {datas.map((_, index) => (
              <div
                key={index}
                onClick={() => selectSide(index)}
                className='group relative flex h-full cursor-pointer flex-col items-center gap-2'>
                <div
                  className={`relative flex h-[80px] w-[142px] items-center justify-center overflow-hidden border bg-white transition-all ${
                    activeSide === index ? 'border-text-brand scale-105' : 'border-border-soft group-hover:border-gray-400'
                  }`}>
                  {canManageSides && datas.length > 1 && (
                    <button
                      type='button'
                      aria-label={t('delete')}
                      title={t('delete')}
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteSide(index);
                      }}
                      className='bg-text-main/70 hover:bg-error absolute top-1 right-1 z-10 flex size-6 items-center justify-center rounded text-white'>
                      <Trash className='size-3.5' />
                    </button>
                  )}
                  <div className='relative flex h-full w-full items-center justify-center bg-gray-50'>
                    <SafeImage
                      src={thumbnails[index]}
                      className='h-auto max-h-[80px] w-auto max-w-[142px] object-contain'
                      alt={`Page ${index + 1} preview`}
                      width={0}
                      height={0}
                      unoptimized
                    />
                  </div>
                </div>
                <p className='title-16'>{index + 1}</p>
              </div>
            ))}
            {canManageSides && datas.length < 2 && (
              <button
                type='button'
                onClick={addSide}
                className='group flex cursor-pointer flex-col items-center gap-2 text-center'>
                <span className='border-border-soft group-hover:border-text-brand flex h-[80px] w-[142px] items-center justify-center border bg-white transition-colors'>
                  <Plus className='size-7' />
                </span>
                <span className='title-16'>{t('add_page')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
