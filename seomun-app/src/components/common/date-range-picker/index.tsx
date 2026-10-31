'use client';

import { DATE_FORMAT } from '@/constants/common';
import { Calendar as CalendarIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';
import { DateRange, DayPicker } from 'react-day-picker';
import { createPortal } from 'react-dom';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
}) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // DayPicker is usually around 320px tall
      const upward = spaceBelow < 340 && spaceAbove > spaceBelow;
      const dropdownWidth = dropdownRef.current?.offsetWidth ?? 0;

      const style: React.CSSProperties = {
        position: 'fixed',
        left: Math.max(8, Math.min(rect.left, window.innerWidth - dropdownWidth - 8)),
        zIndex: 9999,
      };

      if (upward) {
        style.bottom = window.innerHeight - rect.top + 4;
      } else {
        style.top = rect.bottom + 4;
      }

      setDropdownStyle(style);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleSelect = (range: DateRange | undefined) => {
    if (onChange) onChange(range);
  };

  const displayText = value?.from
    ? value.to
      ? `${format(value.from, DATE_FORMAT.DEFAULT)} ~ ${format(value.to, DATE_FORMAT.DEFAULT)}`
      : format(value.from, DATE_FORMAT.DEFAULT)
    : (placeholder ?? t('placeholder.date_range'));

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      <button
        type='button'
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 transition-all',
          isOpen ? 'border-text-brand' : 'border-border-soft',
          disabled && 'bg-fill-disabled cursor-not-allowed text-gray-400',
          !value?.from && 'text-gray-400',
        )}>
        <span className='body-14 truncate'>{displayText}</span>
        <CalendarIcon className='h-5 w-5 text-gray-400' />
      </button>

      {isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className='border-border-soft absolute z-50 rounded-lg border bg-white p-3 shadow-lg'>
            <DayPicker
              mode='range'
              numberOfMonths={2}
              selected={value}
              onSelect={handleSelect}
              locale={locale === 'en' ? enUS : ko}
              className='rdp-custom'
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
