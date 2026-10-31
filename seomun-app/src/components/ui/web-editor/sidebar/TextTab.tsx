'use client';

import { Button } from '@/components/common';
import { useWebEditorStore } from '@/hooks';
import { Plus } from '@/icons';
import { useTranslations } from 'next-intl';

export const TextTab = () => {
  const t = useTranslations('editor');

  const { addText } = useWebEditorStore();

  const handleAddTextBox = () => {
    addText();
  };

  return (
    <div className='flex h-full items-center justify-center'>
      <Button variant='outline' size='md' onClick={handleAddTextBox} leftIcon={<Plus className='size-6' />} className='body-16'>
        {t('add_text')}
      </Button>
    </div>
  );
};
