'use client';

import { Button, ColorPicker } from '@/components/common';
import { useWebEditorStore } from '@/hooks';
import { Plus } from '@/icons';
import { fileToBase64 } from '@/lib/utils/file';
import { useTranslations } from 'next-intl';
import React, { useRef } from 'react';

export const BackgroundTab = () => {
  const t = useTranslations('editor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSide = useWebEditorStore((state) => state.activeSide);
  const datas = useWebEditorStore((state) => state.datas);
  const updateBackground = useWebEditorStore((state) => state.updateBackground);

  const background = datas[activeSide]?.background;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      updateBackground({ backgroundImage: base64, backgroundSize: 'cover' });
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      e.target.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Background Color Section */}
      <div className='flex flex-col gap-4'>
        <h3 className='title-16 text-text-main font-semibold'>{t('add_background_color')}</h3>
        <ColorPicker
          value={background?.backgroundColor || '#ffffff'}
          onChange={(color) => updateBackground({ backgroundColor: color })}
          label={t('change_color')}
        />
      </div>

      <div className='border-border-soft border-t' />

      {/* Background Image Section */}
      <div className='flex flex-col gap-4'>
        <h3 className='title-16 text-text-main font-semibold'>{t('add_background_image')}</h3>

        <div className='flex flex-col gap-3'>
          <input type='file' ref={fileInputRef} onChange={handleImageUpload} accept='image/*' className='hidden' />

          <Button
            variant='outline'
            fullWidth
            onClick={handleButtonClick}
            className='flex h-10 gap-2'
            leftIcon={<Plus className='size-5' />}>
            {t('add_photo')}
          </Button>

          {background?.backgroundImage && (
            <div className='flex flex-col gap-2'>
              <div
                className='border-border-soft aspect-video w-full rounded-lg border bg-gray-50 bg-contain bg-center bg-no-repeat'
                style={{ backgroundImage: `url(${background.backgroundImage})` }}
              />
              <Button
                variant='outline'
                fullWidth
                onClick={() => updateBackground({ backgroundImage: undefined })}
                className='text-error border-error hover:bg-error/5 h-10'>
                {t('delete')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
