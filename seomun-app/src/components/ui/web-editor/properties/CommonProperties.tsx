'use client';

import { Button, Input } from '@/components/common';
import { useWebEditorStore } from '@/hooks';
import { CanvasObject } from '@/types';
import { useTranslations } from 'next-intl';

interface CommonPropertiesProps {
  object: CanvasObject;
  onUpdate: (updates: Partial<CanvasObject>) => void;
  onDelete: () => void;
}

export const CommonProperties = ({ object, onUpdate, onDelete }: CommonPropertiesProps) => {
  const t = useTranslations('editor');
  const { reorderObject, duplicateObject } = useWebEditorStore();

  return (
    <div className='border-border-soft flex flex-col gap-6 border-t pt-6'>
      {/* Transform */}
      <div className='flex flex-col gap-4'>
        <h4 className='title-14 text-text-main font-semibold'>{t('transform')}</h4>

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='body-14 text-text-main font-medium'>{t('x_position')}</label>
            <Input
              type='number'
              value={Math.round(object.position.x)}
              onChange={(e) => onUpdate({ position: { ...object.position, x: Number(e.target.value) } })}
              showClear={false}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='body-14 text-text-main font-medium'>{t('y_position')}</label>
            <Input
              type='number'
              value={Math.round(object.position.y)}
              onChange={(e) => onUpdate({ position: { ...object.position, y: Number(e.target.value) } })}
              showClear={false}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='body-14 text-text-main font-medium'>{t('width')}</label>
            <Input
              type='number'
              value={Math.round(object.size.width)}
              onChange={(e) => onUpdate({ size: { ...object.size, width: Number(e.target.value) } })}
              min={1}
              showClear={false}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='body-14 text-text-main font-medium'>{t('height')}</label>
            <Input
              type='number'
              value={Math.round(object.size.height)}
              onChange={(e) => onUpdate({ size: { ...object.size, height: Number(e.target.value) } })}
              min={1}
              showClear={false}
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='body-14 text-text-main font-medium'>{t('rotation')}</label>
          <div className='flex items-center gap-4'>
            <input
              type='range'
              min={0}
              max={360}
              value={Math.round(object.rotation)}
              onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
              className='accent-primary-500 h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200'
            />
            <span className='body-14 w-10 text-right text-gray-500'>{Math.round(object.rotation)}°</span>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='body-14 text-text-main font-medium'>{t('opacity')}</label>
          <div className='flex items-center gap-4'>
            <input
              type='range'
              min={0}
              max={100}
              value={Math.round(object.opacity * 100)}
              onChange={(e) => onUpdate({ opacity: Number(e.target.value) / 100 })}
              className='accent-primary-500 h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200'
            />
            <span className='body-14 w-10 text-right text-gray-500'>{Math.round(object.opacity * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Layers */}
      <div className='border-border-soft flex flex-col gap-4 border-t pt-6'>
        <div className='flex items-center justify-between'>
          <h4 className='title-14 text-text-main font-semibold'>{t('layer')}</h4>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' size='sm' onClick={() => reorderObject(object.id, 'top')} className='h-10'>
            {t('bring_to_front')}
          </Button>
          <Button variant='outline' size='sm' onClick={() => reorderObject(object.id, 'bottom')} className='h-10'>
            {t('send_to_back')}
          </Button>
          <Button variant='outline' size='sm' onClick={() => reorderObject(object.id, 'up')} className='h-10'>
            {t('bring_forward')}
          </Button>
          <Button variant='outline' size='sm' onClick={() => reorderObject(object.id, 'down')} className='h-10'>
            {t('send_backward')}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className='flex flex-col gap-2 pt-2'>
        <Button variant='secondary' fullWidth onClick={() => duplicateObject(object.id)} className='h-11'>
          {t('duplicate')}
        </Button>
        <Button variant='outline' fullWidth onClick={onDelete} className='text-error border-error hover:bg-error/10 h-11 border'>
          {t('delete')}
        </Button>
      </div>
    </div>
  );
};
