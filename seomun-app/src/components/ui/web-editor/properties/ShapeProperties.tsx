'use client';

import { ColorPicker } from '@/components/common';
import { ShapeObject } from '@/types';
import { useTranslations } from 'next-intl';

interface ShapePropertiesProps {
  object: ShapeObject;
  updateShape: (id: string, updates: Partial<ShapeObject>) => void;
}

export const ShapeProperties = ({ object, updateShape }: ShapePropertiesProps) => {
  const t = useTranslations('editor');

  const handleChange = (updates: Partial<ShapeObject>) => {
    updateShape(object.id, updates);
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Fill Color */}
      <ColorPicker label={t('fill_color')} value={object.fill} onChange={(color) => handleChange({ fill: color })} />

      {/* Stroke Color */}
      <ColorPicker label={t('stroke_color')} value={object.stroke} onChange={(color) => handleChange({ stroke: color })} />

      {/* Stroke Width */}
      <div className='flex flex-col gap-2'>
        <label className='body-14 text-text-main font-medium'>{t('stroke_width')}</label>
        <div className='flex items-center gap-4'>
          <input
            type='range'
            min={0}
            max={20}
            value={object.strokeWidth}
            onChange={(e) => handleChange({ strokeWidth: Number(e.target.value) })}
            className='accent-primary-500 h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200'
          />
          <span className='body-14 w-8 text-right text-gray-500'>{object.strokeWidth}</span>
        </div>
      </div>

      {/* Corner Radius (Rectangle only) */}
      {object.shapeType === 'rectangle' && (
        <div className='flex flex-col gap-2'>
          <label className='body-14 text-text-main font-medium'>{t('corner_radius')}</label>
          <div className='flex items-center gap-4'>
            <input
              type='range'
              min={0}
              max={100}
              value={object.cornerRadius || 0}
              onChange={(e) => handleChange({ cornerRadius: Number(e.target.value) })}
              className='accent-primary-500 h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200'
            />
            <span className='body-14 w-8 text-right text-gray-500'>{object.cornerRadius || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};
