'use client';

import { ChevDown } from '@/icons';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  label: React.ReactNode;
  value: string | number;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  onDropdownScroll?: React.UIEventHandler<HTMLUListElement>;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  selectClassname?: string;
  labelClassname?: string;
  optionsClassname?: string;
  required?: boolean;
  labelPlacement?: 'top' | 'left';
  isError?: boolean;
  renderSelectedValue?: (option: SelectOption) => React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = '선택',
  error,
  disabled = false,
  readOnly = false,
  className,
  onDropdownScroll,
  selectClassname,
  labelClassname,
  optionsClassname,
  required = false,
  labelPlacement = 'top',
  isError,
  renderSelectedValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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
      const upward = spaceBelow < 250 && spaceAbove > spaceBelow;

      const style: React.CSSProperties = {
        position: 'fixed',
        left: rect.left,
        width: rect.width,
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

  const handleToggle = () => {
    if (!disabled && !readOnly) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string | number) => {
    if (onChange) onChange(optionValue);
    setIsOpen(false);
  };

  const isLeftPlacement = labelPlacement === 'left';

  return (
    <div className={cn('flex w-full flex-col gap-1.5', isLeftPlacement && 'flex-row items-center gap-4', className)}>
      {label && (
        <label
          className={cn(
            'body-16 text-text-main',
            isLeftPlacement && 'min-w-[80px] shrink-0',
            error && isLeftPlacement && 'mb-[22px]',
            labelClassname,
          )}>
          {label}
          {required && <span className='text-error ml-0.5'>*</span>}
        </label>
      )}

      <div className='relative w-full' ref={containerRef}>
        <button
          type='button'
          disabled={disabled || readOnly}
          onClick={handleToggle}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-[8px] border bg-white px-3 transition-all',
            selectClassname,
            isOpen ? 'border-text-brand' : 'border-border-soft',
            (error || isError) && 'border-error',
            disabled && 'bg-fill-disabled cursor-not-allowed text-gray-400',
            readOnly && 'cursor-not-allowed',
            !selectedOption && 'text-gray-400',
          )}>
          <span className={cn('input-15 truncate', optionsClassname)}>
            {selectedOption ? (renderSelectedValue ? renderSelectedValue(selectedOption) : selectedOption.label) : placeholder}
          </span>
          <ChevDown className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>

        {isOpen &&
          !disabled &&
          !readOnly &&
          createPortal(
            <ul
              ref={dropdownRef}
              data-lenis-prevent
              onScroll={onDropdownScroll}
              style={dropdownStyle}
              className={cn('border-border-soft max-h-60 overflow-auto rounded-[4px] border bg-white py-1 shadow-lg')}>
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'hover:bg-fill-soft body-14 cursor-pointer px-3 py-2 transition-colors',
                    optionsClassname,
                    option.value === value && 'text-text-brand bg-fill-brand/10 font-medium',
                  )}>
                  {option.label}
                </li>
              ))}
            </ul>,
            document.body,
          )}

        {error && <p className='text-error caption-12 mt-1'>{error}</p>}
      </div>
    </div>
  );
};
