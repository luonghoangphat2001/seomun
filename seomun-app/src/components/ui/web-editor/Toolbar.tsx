'use client';

import { useEffect, useState } from 'react';

import { Input } from '@/components/common';
import { MAX_ZOOM, ZOOM_LEVELS } from '@/constants/web-editor';
import { useWebEditorStore } from '@/hooks';
import { Minus, Plus, Refresh, ReverseLeft, ReverseRight } from '@/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export const Toolbar = () => {
  const t = useTranslations('editor');
  const { datas, activeSide, zoom, undo, redo, setZoom, clearCanvas } = useWebEditorStore();
  const currentSide = datas[activeSide];

  const [localZoom, setLocalZoom] = useState(String(Math.round(zoom * 100)));

  useEffect(() => {
    setLocalZoom(String(Math.round(zoom * 100)));
  }, [zoom]);

  const canUndo = currentSide.past.length > 0;
  const canRedo = currentSide.future.length > 0;

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    const nextIndex = Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1);
    setZoom(ZOOM_LEVELS[nextIndex]);
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    const prevIndex = Math.max(currentIndex - 1, 0);
    setZoom(ZOOM_LEVELS[prevIndex]);
  };

  const handleOnchangeZoom = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setLocalZoom(cleaned);

    if (cleaned !== '') {
      const percent = Number(cleaned);

      const nextZoom = percent / 100;
      if (nextZoom >= MAX_ZOOM) setZoom(MAX_ZOOM);
    }
  };

  const handleBlur = () => {
    setLocalZoom(String(Math.round(zoom * 100)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const percent = Number(localZoom);
      if (!isNaN(percent)) {
        setZoom(percent / 100);
      }
      setLocalZoom(String(Math.round(zoom * 100)));
      e.currentTarget.blur();
    }
  };

  return (
    <section className='border-border-soft absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-4 rounded-[12px] border bg-white p-3 md:flex'>
      <article className='flex gap-2'>
        <button
          className={cn(
            'flex size-10 items-center justify-center',
            canUndo ? 'hover:text-text-brand cursor-pointer' : 'cursor-not-allowed',
          )}
          onClick={undo}
          disabled={!canUndo}
          title={t('undo')}>
          <ReverseLeft className={cn('size-6', !canUndo && 'text-text-third')} />
        </button>
        <button
          onClick={redo}
          className={cn(
            'flex size-10 items-center justify-center',
            canRedo ? 'hover:text-text-brand cursor-pointer' : 'cursor-not-allowed',
          )}
          disabled={!canRedo}
          title={t('redo')}>
          <ReverseRight className={cn('size-6', !canRedo && 'text-text-third')} />
        </button>
      </article>

      <p className='bg-border-soft h-4 w-[1px]' />

      <button
        className={cn(
          'flex size-10 items-center justify-center',
          canUndo ? 'hover:text-text-brand cursor-pointer' : 'cursor-not-allowed',
        )}
        onClick={clearCanvas}
        disabled={!canUndo}
        title={t('reset')}>
        <Refresh className={cn('size-6', !canUndo && 'text-text-third')} />
      </button>

      <p className='bg-border-soft h-4 w-[1px]' />

      {/* <button
        className={cn('hover:text-text-brand flex size-10 cursor-pointer items-center justify-center')}
        onClick={openSlideshow}
        disabled={isSlideshowLoading}
        title='slideshow'>
        {isSlideshowLoading ? <Spinner className='text-text-brand size-6 animate-spin' /> : <Zoomin className={cn('size-6')} />}
      </button>

      <p className='bg-border-soft h-4 w-[1px]' /> */}

      <section className='flex items-center gap-4'>
        <button
          onClick={handleZoomOut}
          title={t('zoom_out')}
          disabled={zoom <= ZOOM_LEVELS[0]}
          className={cn(zoom <= ZOOM_LEVELS[0] ? 'cursor-not-allowed opacity-30' : 'hover:text-text-brand cursor-pointer')}>
          <Minus className='size-6' />
        </button>

        <Input
          showClear={false}
          value={localZoom}
          onChange={(e) => handleOnchangeZoom(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className='h-10 w-16'
          suffix={<span className='text-text-main'>%</span>}
        />

        <button
          onClick={handleZoomIn}
          title={t('zoom_in')}
          disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          className={cn(
            zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]
              ? 'cursor-not-allowed opacity-30'
              : 'hover:text-text-brand cursor-pointer',
          )}>
          <Plus className='size-6' />
        </button>
      </section>
    </section>
  );
};
