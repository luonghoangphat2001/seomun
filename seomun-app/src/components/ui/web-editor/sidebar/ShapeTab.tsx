'use client';

import { SHAPES } from '@/constants/web-editor';
import { EditorTabType } from '@/enums/editor';
import { useWebEditorStore } from '@/hooks';
import { ChevronLeft } from '@/icons';
import { useTranslations } from 'next-intl';

export const ShapeTab = () => {
  const t = useTranslations('editor');
  const addShape = useWebEditorStore((state) => state.addShape);
  const setActiveTab = useWebEditorStore((state) => state.setActiveTab);

  return (
    <div className='flex h-full flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <button onClick={() => setActiveTab(EditorTabType.TEMPLATE)} className=''>
          <ChevronLeft className='size-5' />
        </button>
        <h2 className='title-20'>{t('insert_shape')}</h2>
      </div>

      {/* Shapes Grid */}
      <div className='grid grid-cols-3 gap-4'>
        {SHAPES.map((shape, index) => (
          <button
            key={`${shape.type}-${index}`}
            onClick={() => addShape(shape.type)}
            className='group flex aspect-square items-center justify-center rounded-lg transition-all active:scale-95'>
            <shape.icon className='size-full text-gray-200 transition-colors group-hover:text-gray-300' />
          </button>
        ))}
      </div>
    </div>
  );
};
