'use client';

import { Button, Modal, ModalHandle, SafeImage } from '@/components/common';
import { useDesignHistoryListQuery } from '@/apis/design/design.query';
import { DesignHistoryArtWork, DesignHistoryRESP } from '@/apis/design/design.response';
import { DATE_FORMAT } from '@/constants/common';
import { DesignSide } from '@/enums/design';
import { useMediaQuery, useWebEditorStore } from '@/hooks';
import { cn, formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { forwardRef, type UIEvent, useState } from 'react';

type ImportTemplateModalProps = {
  productId?: number;
};

export const ImportTemplateModal = forwardRef<ModalHandle, ImportTemplateModalProps>(({ productId }, ref) => {
  const t = useTranslations('editor');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: designHistory, fetchNextPage, hasNextPage, isFetchingNextPage } = useDesignHistoryListQuery(productId);
  const { setSelectedSizeOptionId, setTemplate } = useWebEditorStore();
  const designs = designHistory?.pages.flatMap((page) => page.data.designs) ?? [];

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight <= 160;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  };

  const onClose = () => {
    if (ref && 'current' in ref && ref.current) ref.current.close();
  };

  const handleLoad = (design: DesignHistoryRESP) => {
    const artworks = [design.artworks.front, design.artworks.back].filter((artwork): artwork is DesignHistoryArtWork =>
      Boolean(artwork),
    );
    const layers = artworks.flatMap(getArtworkLayers).filter(Boolean);
    if (!layers.length) return;
    const frontArtwork = artworks.find((artwork) => artwork.side === DesignSide.FRONT);
    const backArtwork = artworks.find((artwork) => artwork.side === DesignSide.BACK);

    setSelectedSizeOptionId(design.size_option_id || null);
    setTemplate(null, layers, {
      backgrounds: [frontArtwork ? getArtworkBackground(frontArtwork) : {}, backArtwork ? getArtworkBackground(backArtwork) : {}],
      previewImages: [frontArtwork?.preview_image_path ?? '', backArtwork?.preview_image_path ?? ''],
      hasBackSide: Boolean(backArtwork),
      sidesToUpdate: artworks.map((artwork) => artwork.side),
      sizeMm: design.width_mm > 0 && design.height_mm > 0 ? { width: design.width_mm, height: design.height_mm } : undefined,
    });
    setSelectedId(null);
    onClose();
  };

  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <Modal
      ref={ref}
      title={<p className='title-18 md:title-24 md:px-6 md:pt-2.5'>{t('import')}</p>}
      titleClassName='pt-0'
      size='xl'
      className='max-w-[720px]'
      position={isDesktop ? 'center' : 'bottom'}
      footer={
        <div className='flex justify-end gap-3 md:gap-4 md:px-6 md:pt-2'>
          <Button variant='outline' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            variant='primary'
            disabled={selectedId === null}
            onClick={() => {
              const design = designs.find((d) => d.id === selectedId);
              if (design) handleLoad(design);
            }}>
            {t('import')}
          </Button>
        </div>
      }>
      <div className='border-border-soft flex flex-col border-y'>
        <div
          className='scrollbar-hide grid max-h-[60dvh] grid-cols-3 gap-4 overflow-y-auto p-6 md:grid-cols-4'
          onScroll={handleScroll}>
          {designs.map((design) => {
            const isSelected = selectedId === design.id;
            return (
              <div key={design.id} onClick={() => setSelectedId(design.id)} className='cursor-pointer'>
                <div
                  className={cn(
                    'bg-fill-soft h-[110px] w-full border',
                    isSelected ? 'border-text-brand border-2' : 'border-border-soft',
                  )}>
                  {design.preview.front.preview_path && (
                    <SafeImage
                      src={design.preview.front.preview_path}
                      width={160}
                      height={110}
                      alt={design.title}
                      className='h-full w-full object-contain'
                    />
                  )}
                </div>
                <p className={cn('title-16 mt-2 underline', isSelected ? 'text-text-brand' : 'text-text-main')}>{design.title}</p>
                <p className='caption-12 text-text-secondary'>{formatDate(design.updated_at, DATE_FORMAT.DATE_HOUR_MINUTE)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
});

ImportTemplateModal.displayName = 'ImportTemplateModal';

const getArtworkLayers = (artwork: DesignHistoryArtWork) =>
  Array.isArray(artwork.layout_data) ? artwork.layout_data : (artwork.layout_data.objects ?? []);

const getArtworkBackground = (artwork: DesignHistoryArtWork) =>
  Array.isArray(artwork.layout_data) ? {} : (artwork.layout_data.background ?? {});
