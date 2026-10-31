'use client';

import { Button, Switch } from '@/components/common';
import { EditorTabType } from '@/enums/editor';
import { useWebEditorStore } from '@/hooks';
import { useTranslations } from 'next-intl';

export const Togglebar = () => {
  const t = useTranslations('editor');
  const {
    workSizeVisible,
    trimSizeVisible,
    safeAreaVisible,
    toggleWorkSize,
    toggleTrimSize,
    toggleSafeArea,
    setActiveTab,
    selectObject,
  } = useWebEditorStore();

  return (
    <section className='absolute top-10 left-10 z-10 hidden items-center gap-4 md:flex md:max-xl:items-start'>
      <div className='border-border-soft flex items-center gap-x-6 gap-y-3 rounded-[12px] border bg-white p-3 md:max-xl:flex-col md:max-xl:items-start'>
        <div className='flex items-center gap-2'>
          <Switch id='work-size-toggle' checked={workSizeVisible} onChange={toggleWorkSize} />
          <label htmlFor='work-size-toggle' className='input-15 cursor-pointer whitespace-nowrap'>
            {t('working_size')}
          </label>
        </div>
        <div className='bg-border-soft h-4 w-[1px] md:max-xl:h-[1px] md:max-xl:w-full' />
        <div className='flex items-center gap-2'>
          <Switch id='trim-size-toggle' checked={trimSizeVisible} onChange={toggleTrimSize} />
          <label htmlFor='trim-size-toggle' className='input-15 cursor-pointer whitespace-nowrap'>
            {t('cutting_size')}
          </label>
        </div>
        <div className='bg-border-soft h-4 w-[1px] md:max-xl:h-[1px] md:max-xl:w-full' />
        <div className='flex items-center gap-2'>
          <Switch id='safe-area-toggle' checked={safeAreaVisible} onChange={toggleSafeArea} />
          <label htmlFor='safe-area-toggle' className='input-15 cursor-pointer whitespace-nowrap'>
            {t('safe_zone')}
          </label>
        </div>
      </div>
      {/* <div className='border-border-soft flex items-center gap-x-4 gap-y-2 rounded-[12px] border bg-white px-3 py-1 md:max-xl:flex-col md:max-xl:items-start'>
        <Button
          variant='ghost'
          size='sm'
          className='input-15 px-1 font-normal whitespace-nowrap'
          // onClick={() => setActiveTab(EditorTabType.BACKGROUND)}
        >
          {t('change_color')}
        </Button>
        <div className='bg-border-soft h-4 w-[1px] md:max-xl:h-[1px] md:max-xl:w-full' />
        <Button
          variant='ghost'
          size='sm'
          className='input-15 px-1 font-normal whitespace-nowrap'
          onClick={() => {
            selectObject(null);
            setActiveTab(EditorTabType.SHAPE);
          }}
          id='insert-shape-button'>
          {t('insert_shape')}
        </Button>
      </div> */}
    </section>
  );
};
