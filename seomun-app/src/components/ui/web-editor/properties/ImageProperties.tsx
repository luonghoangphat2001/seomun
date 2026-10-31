'use client';

import { Button } from '@/components/common';
import { ImageObject } from '@/types';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';

interface ImagePropertiesProps {
  object: ImageObject;
  updateImage: (id: string, updates: Partial<ImageObject>) => void;
}

const DEFAULT_FILTERS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
};

export const ImageProperties = ({ object, updateImage }: ImagePropertiesProps) => {
  const t = useTranslations('editor');

  const [localFilters, setLocalFilters] = useState(object.filters || DEFAULT_FILTERS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalFilters(object.filters || DEFAULT_FILTERS);
  }, [object.filters]);

  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const throttledUpdate = (filters: ImageObject['filters']) => {
    if (throttleTimerRef.current) return;

    throttleTimerRef.current = setTimeout(() => {
      updateImage(object.id, { filters });
      throttleTimerRef.current = null;
    }, 32);
  };

  const handleFilterChange = (key: keyof typeof DEFAULT_FILTERS, value: number) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    throttledUpdate(newFilters);
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    updateImage(object.id, { filters: DEFAULT_FILTERS });
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Filters Section */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h4 className='title-14 text-text-main font-semibold'>{t('filters')}</h4>
          <Button variant='outline' size='sm' onClick={handleReset} className='h-8 px-2 text-xs'>
            {t('reset')}
          </Button>
        </div>

        {/* Brightness */}
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <label className='body-14 text-text-main font-medium'>{t('brightness')}</label>
            <span className='body-14 text-gray-500'>{localFilters.brightness}</span>
          </div>
          <input
            type='range'
            min={-100}
            max={100}
            value={localFilters.brightness}
            onChange={(e) => handleFilterChange('brightness', Number(e.target.value))}
            className='accent-primary-500 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200'
          />
        </div>

        {/* Contrast */}
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <label className='body-14 text-text-main font-medium'>{t('contrast')}</label>
            <span className='body-14 text-gray-500'>{localFilters.contrast}</span>
          </div>
          <input
            type='range'
            min={-100}
            max={100}
            value={localFilters.contrast}
            onChange={(e) => handleFilterChange('contrast', Number(e.target.value))}
            className='accent-primary-500 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200'
          />
        </div>

        {/* Saturation */}
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <label className='body-14 text-text-main font-medium'>{t('saturation')}</label>
            <span className='body-14 text-gray-500'>{localFilters.saturation}</span>
          </div>
          <input
            type='range'
            min={-100}
            max={100}
            value={localFilters.saturation}
            onChange={(e) => handleFilterChange('saturation', Number(e.target.value))}
            className='accent-primary-500 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200'
          />
        </div>

        {/* Blur */}
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <label className='body-14 text-text-main font-medium'>{t('blur')}</label>
            <span className='body-14 text-gray-500'>{localFilters.blur}</span>
          </div>
          <input
            type='range'
            min={0}
            max={20}
            step={0.5}
            value={localFilters.blur}
            onChange={(e) => handleFilterChange('blur', Number(e.target.value))}
            className='accent-primary-500 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200'
          />
        </div>
      </div>

      {/* Info Section */}
      <div className='border-border-soft flex flex-col gap-3 border-t pt-6'>
        <h4 className='title-14 text-text-main font-semibold'>{t('image_info')}</h4>
        <div className='flex flex-col gap-1'>
          <p className='body-14 text-gray-500'>
            {t('original_size')}: {object.originalWidth} × {object.originalHeight} px
          </p>
        </div>
      </div>
    </div>
  );
};
