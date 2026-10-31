'use client';

import { Button, Select } from '@/components/common';
import type { ProductSize } from '@/apis/product/product.response';
import type { DesignWebEditor } from '@/types/design';
import { useWebEditorStore } from '@/hooks';
import { Lock, Ruler } from '@/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

const UNITS = [{ label: 'mm', value: 'mm' }];

interface BannerSizeSelectorProps {
  sizeOptions: ProductSize[];
  webEditor?: DesignWebEditor | null;
}

export const BannerSizeSelector = ({ sizeOptions, webEditor }: BannerSizeSelectorProps) => {
  const t = useTranslations();
  const {
    selectedTemplateId,
    templates,
    selectedSizeOptionId,
    canvasSize,
    bleedPx,
    customSizeMm,
    setCustomSize,
    setSelectedSizeOptionId,
  } = useWebEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState('90');
  const [customHeight, setCustomHeight] = useState('50');
  const [unit, setUnit] = useState('mm');
  const [locked, setLocked] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
  const defaultSizeOption = sizeOptions[0];
  const selectedSizeOption =
    sizeOptions.find((option) => option.id === selectedSizeOptionId) ?? (selectedTemplate ? undefined : defaultSizeOption);
  const dpi = webEditor?.dpi || selectedTemplate?.web_editor?.dpi || 200;
  const triggerLabel = customSizeMm
    ? `${customSizeMm.width}x${customSizeMm.height}mm`
    : selectedTemplate
      ? `${selectedTemplate.size_option.cutting_width}x${selectedTemplate.size_option.cutting_height}mm`
      : selectedSizeOption
        ? selectedSizeOption.name + 'mm'
        : '-';

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('.banner-size-selector-options')) return;
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleWidthChange = (value: string) => {
    setSelectedSizeOptionId(null);
    setCustomWidth(value);
    if (locked && Number(customWidth) > 0) {
      setCustomHeight(String(Math.round(Number(value) * (Number(customHeight) / Number(customWidth)))));
    }
  };

  const handleHeightChange = (value: string) => {
    setSelectedSizeOptionId(null);
    setCustomHeight(value);
    if (locked && Number(customHeight) > 0) {
      setCustomWidth(String(Math.round(Number(value) * (Number(customWidth) / Number(customHeight)))));
    }
  };

  const handleApply = () => {
    const width = Number(customWidth);
    const height = Number(customHeight);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;

    setCustomSize({ width, height, dpi });
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      const trimWidthPx = canvasSize.width - bleedPx * 2;
      const trimHeightPx = canvasSize.height - bleedPx * 2;
      const width = customSizeMm?.width ?? selectedSizeOption?.cutting_width ?? (trimWidthPx * 25.4) / dpi;
      const height = customSizeMm?.height ?? selectedSizeOption?.cutting_height ?? (trimHeightPx * 25.4) / dpi;
      setCustomWidth(String(Math.round(width * 100) / 100));
      setCustomHeight(String(Math.round(height * 100) / 100));
    }
    setIsOpen((previous) => !previous);
  };

  const handleSizeOptionSelect = (value: string | number) => {
    const sizeOption = sizeOptions.find((item) => item.id === Number(value));
    if (!sizeOption) return;

    const width = sizeOption.cutting_width;
    const height = sizeOption.cutting_height;
    setSelectedSizeOptionId(sizeOption.id);
    setCustomWidth(String(width));
    setCustomHeight(String(height));
  };

  return (
    <div ref={wrapperRef} className='relative w-[150px]'>
      <button
        onClick={handleToggle}
        className={cn(
          'border-border-soft body-14 flex h-9 w-full items-center justify-between rounded border bg-white px-3 transition-colors hover:bg-gray-50',
          isOpen && 'border-primary',
        )}>
        <span className='truncate'>{triggerLabel}</span>
        <svg
          width='16'
          height='16'
          viewBox='0 0 16 16'
          fill='none'
          className={cn('text-text-secondary shrink-0 transition-transform', isOpen && 'rotate-180')}>
          <path d='M4 6L8 10L12 6' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </button>

      {isOpen && (
        <div className='border-border-soft absolute top-full left-0 z-50 mt-1 w-[300px] space-y-6 rounded-xl border bg-white p-6 shadow-lg'>
          <Select
            options={sizeOptions.map((sizeOption) => ({ label: sizeOption.name + 'mm', value: String(sizeOption.id) }))}
            value={String(selectedSizeOption?.id ?? '')}
            onChange={handleSizeOptionSelect}
            selectClassname='h-11'
            optionsClassname='banner-size-selector-options'
          />

          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Ruler className='text-text-secondary size-4' />
              <span className='body-14'>{t('common.direct_input')}</span>
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='number'
                min='0.01'
                value={customWidth}
                onChange={(event) => handleWidthChange(event.target.value)}
                className='border-border-soft button-13 focus:border-primary h-9 w-full rounded border px-2 text-center outline-none'
              />
              <button
                type='button'
                onClick={() => setLocked((value) => !value)}
                className={cn('shrink-0 transition-colors', locked ? 'text-primary' : 'text-text-secondary')}>
                <Lock className='size-4' />
              </button>
              <input
                type='number'
                min='0.01'
                value={customHeight}
                onChange={(event) => handleHeightChange(event.target.value)}
                className='border-border-soft button-13 focus:border-primary h-9 w-full rounded border px-2 text-center outline-none'
              />
              <div className='w-[72px] shrink-0'>
                <Select
                  options={UNITS}
                  value={unit}
                  onChange={(value) => setUnit(value as string)}
                  selectClassname='h-9 body-14'
                  optionsClassname='banner-size-selector-options'
                />
              </div>
            </div>
          </div>

          <Button variant='primary' className='h-9 w-full' onClick={handleApply}>
            {t('common.apply')}
          </Button>
        </div>
      )}
    </div>
  );
};
