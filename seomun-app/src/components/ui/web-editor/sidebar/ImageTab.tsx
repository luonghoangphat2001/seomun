'use client';

import { Button } from '@/components/common';
import { useWebEditorStore } from '@/hooks';
import { Plus } from '@/icons';
import { fileToBase64, loadImage } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import toast from 'react-hot-toast';

export const ImageTab = () => {
  const t = useTranslations('editor');
  const tCommon = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addImage } = useWebEditorStore();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const img = await loadImage(base64);
      addImage(base64, img.width, img.height);
    } catch (error) {
      console.error('Failed to load image:', error);
      toast.error(tCommon('error'));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className='flex h-full items-center justify-center'>
      <input type='file' ref={fileInputRef} onChange={handleImageUpload} accept='image/*' className='hidden' />
      <Button
        variant='outline'
        size='md'
        onClick={() => fileInputRef.current?.click()}
        leftIcon={<Plus className='size-6' />}
        className='body-16'>
        {t('add_photo')}
      </Button>
    </div>
  );
};
