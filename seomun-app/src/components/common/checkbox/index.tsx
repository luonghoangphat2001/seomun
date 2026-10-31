'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from '@/icons';

export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  labelClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className,
  required = false,
  labelClassName,
}) => {
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <label
      className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}
      onClick={handleChange}>
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-sm border transition-all',
          checked ? 'border-text-brand bg-text-brand text-white' : 'border-border-soft bg-white text-transparent',
        )}>
        <Check className='h-6 w-6' />
      </div>
      {label && (
        <span className={cn('body-14 text-text-main', required && "text-error after:ml-0.5 after:content-['*']", labelClassName)}>
          {label}
        </span>
      )}
    </label>
  );
};
