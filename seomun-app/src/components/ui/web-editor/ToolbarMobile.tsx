import { Input, Switch } from '@/components/common';
import { MAX_ZOOM, ZOOM_LEVELS } from '@/constants/web-editor';
import { useWebEditorStore } from '@/hooks';
import { Minus, Plus, Refresh, ReverseLeft, ReverseRight } from '@/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export const ToolbarMobile = () => {
  const t = useTranslations('editor');

  const {
    datas,
    activeSide,
    zoom,
    setZoom,
    undo,
    redo,
    clearCanvas,
    workSizeVisible,
    toggleWorkSize,
    trimSizeVisible,
    toggleTrimSize,
    safeAreaVisible,
    toggleSafeArea,
    isGridView,
  } = useWebEditorStore();

  const currentSide = datas[activeSide];
  const canUndo = currentSide?.past.length > 0;
  const canRedo = currentSide?.future.length > 0;

  const [localZoom, setLocalZoom] = useState(String(Math.round(zoom * 100)));

  useEffect(() => {
    setLocalZoom(String(Math.round(zoom * 100)));
  }, [zoom]);

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
    const percent = Number(localZoom);
    if (!isNaN(percent) && localZoom !== '') {
      const nextZoom = percent / 100;
      if (nextZoom >= MAX_ZOOM) {
        setZoom(MAX_ZOOM);
      } else if (nextZoom < 0.1) {
        setZoom(0.1);
      } else {
        setZoom(nextZoom);
      }
    }
    setLocalZoom(String(Math.round(zoom * 100)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className={cn('border-border-soft scrollbar-hide z-50 flex items-center overflow-x-auto border-y bg-white p-3 md:hidden')}>
      <div className='flex items-center gap-2'>
        <button
          className={cn('flex size-9 items-center justify-center', (!canUndo || isGridView) && 'opacity-30')}
          onClick={undo}
          disabled={!canUndo || isGridView}>
          <ReverseLeft className='size-5' />
        </button>
        <button
          className={cn('flex size-9 items-center justify-center', (!canRedo || isGridView) && 'opacity-30')}
          onClick={redo}
          disabled={!canRedo || isGridView}>
          <ReverseRight className='size-5' />
        </button>

        <div className='bg-border-soft h-4 w-[1px]' />

        <button
          className={cn('flex size-9 items-center justify-center', isGridView && 'opacity-30')}
          disabled={isGridView}
          onClick={clearCanvas}>
          <Refresh className='size-5' />
        </button>

        <div className='bg-border-soft h-4 w-[1px]' />
        {/* 
        <button
          className={cn('flex size-9 items-center justify-center', (isSlideshowLoading || isGridView) && 'opacity-30')}
          disabled={isSlideshowLoading || isGridView}
          onClick={openSlideshow}>
          <Zoomin className='size-5' />
        </button>

        <div className='bg-border-soft h-4 w-[1px]' /> */}

        <section className='flex items-center gap-2'>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_LEVELS[0] || isGridView}
            title={t('zoom_out')}
            className={cn(
              zoom <= ZOOM_LEVELS[0] || isGridView ? 'cursor-not-allowed opacity-30' : 'hover:text-text-brand cursor-pointer',
            )}>
            <Minus className='size-5' />
          </button>

          <Input
            showClear={false}
            value={localZoom}
            onChange={(e) => handleOnchangeZoom(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className='!caption-12 h-8 w-15'
            readOnly={isGridView}
            inputMode='numeric'
            pattern='[0-9]*'
            suffix={<span className={cn('text-text-main caption-12', isGridView && 'opacity-30')}>%</span>}
          />

          <button
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1] || isGridView}
            title={t('zoom_in')}
            className={cn(
              zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1] || isGridView
                ? 'cursor-not-allowed opacity-30'
                : 'hover:text-text-brand cursor-pointer',
            )}>
            <Plus className='size-5' />
          </button>
        </section>

        <div className='bg-border-soft h-4 w-[1px]' />

        <div className='flex items-center gap-2'>
          <Switch id='mobile-work-size-toggle' disabled={isGridView} checked={workSizeVisible} onChange={toggleWorkSize} />
          <label htmlFor='mobile-work-size-toggle' className='body-14 whitespace-nowrap'>
            {t('working_size')}
          </label>
        </div>
        <div className='flex items-center gap-2'>
          <Switch id='mobile-trim-size-toggle' disabled={isGridView} checked={trimSizeVisible} onChange={toggleTrimSize} />
          <label htmlFor='mobile-trim-size-toggle' className='body-14 whitespace-nowrap'>
            {t('cutting_size')}
          </label>
        </div>
        <div className='flex items-center gap-2'>
          <Switch id='mobile-safe-area-toggle' disabled={isGridView} checked={safeAreaVisible} onChange={toggleSafeArea} />
          <label htmlFor='mobile-safe-area-toggle' className='body-14 whitespace-nowrap'>
            {t('safe_zone')}
          </label>
        </div>

        {/* <div className='bg-border-soft h-4 w-[1px]' /> */}

        {/* <Button
          variant='ghost'
          size='sm'
          className='body-14 h-full px-1 font-normal whitespace-nowrap'
          disabled={isGridView}
          // onClick={() => setActiveTab(EditorTabType.BACKGROUND)}
        >
          {t('change_color')}
        </Button>

        <div className='bg-border-soft h-4 w-[1px]' />

        <Button
          variant='ghost'
          size='sm'
          className='body-14 h-full px-1 font-normal whitespace-nowrap'
          disabled={isGridView}
          onClick={() => {
            selectObject(null);
            setActiveTab(EditorTabType.SHAPE);
          }}
          id='insert-shape-button'>
          {t('insert_shape')}
        </Button> */}
      </div>
    </div>
  );
};
