'use client';

import { ColorPicker, Input, Radio, RadioGroup, Select, Textarea } from '@/components/common';
import { FONT_FAMILIES, FONT_SIZES, FONT_WEIGHTS } from '@/constants/web-editor';
import { TextObject } from '@/types';
import { useTranslations } from 'next-intl';

interface TextPropertiesProps {
  object: TextObject;
  updateText: (id: string, updates: Partial<TextObject>) => void;
}

export const TextProperties = ({ object, updateText }: TextPropertiesProps) => {
  const t = useTranslations('editor');

  const handleChange = (updates: Partial<TextObject>) => {
    updateText(object.id, updates);
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Content */}
      <div className='flex flex-col gap-2'>
        <label className='body-14 text-text-main font-medium'>{t('content')}</label>
        <Textarea value={object.content} onChange={(e) => handleChange({ content: e.target.value })} rows={3} />
      </div>

      {/* Font Family */}
      <div className='flex flex-col gap-2'>
        <label className='body-14 text-text-main font-medium'>{t('font_family')}</label>
        <Select
          value={object.fontFamily}
          onChange={(value) => handleChange({ fontFamily: value as string })}
          options={FONT_FAMILIES.map((font) => ({ label: font, value: font }))}
        />
      </div>

      {/* Font Size & Weight */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='body-14 text-text-main font-medium'>{t('font_size')}</label>
          <Select
            value={object.fontSize}
            onChange={(value) => handleChange({ fontSize: value as number })}
            options={FONT_SIZES.map((size) => ({ label: `${size}px`, value: size }))}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='body-14 text-text-main font-medium'>{t('font_weight')}</label>
          <Select
            value={object.fontWeight}
            onChange={(value) => handleChange({ fontWeight: value as TextObject['fontWeight'] })}
            options={FONT_WEIGHTS.map((w) => ({ label: w.label, value: w.value }))}
          />
        </div>
      </div>

      {/* Color */}
      <ColorPicker label={t('change_color')} value={object.color} onChange={(color) => handleChange({ color })} />

      {/* Alignment */}
      <div className='flex flex-col gap-2'>
        <label className='body-14 text-text-main font-medium'>{t('alignment')}</label>
        <RadioGroup
          value={object.align}
          onChange={(value) => handleChange({ align: value as TextObject['align'] })}
          className='flex items-center gap-6'>
          <Radio value='left' label={t('left')} />
          <Radio value='center' label={t('center')} />
          <Radio value='right' label={t('right')} />
        </RadioGroup>
      </div>

      {/* Line Height & Letter Spacing */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='body-14 text-text-main font-medium'>{t('line_height')}</label>
          <Input
            type='number'
            value={object.lineHeight}
            onChange={(e) => handleChange({ lineHeight: Number(e.target.value) })}
            step={0.1}
            min={0.5}
            max={3}
            showClear={false}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='body-14 text-text-main font-medium'>{t('letter_spacing')}</label>
          <Input
            type='number'
            value={object.letterSpacing}
            onChange={(e) => handleChange({ letterSpacing: Number(e.target.value) })}
            step={0.5}
            min={-10}
            max={20}
            showClear={false}
          />
        </div>
      </div>
    </div>
  );
};
