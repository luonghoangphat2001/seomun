'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type RadioValue = string | number | boolean;

export interface RadioProps {
  label?: React.ReactNode;
  value: RadioValue;
  name?: string;
  checked?: boolean;
  onChange?: (value?: RadioValue) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  labelClassName?: string;
  allowUncheck?: boolean;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  value,
  name,
  checked = false,
  onChange,
  disabled = false,
  className,
  required = false,
  labelClassName,
  allowUncheck = false,
}) => {
  const handleChange = (event: React.MouseEvent<HTMLLabelElement>) => {
    event.preventDefault();

    if (disabled) return;

    if (allowUncheck && checked) {
      onChange?.(undefined);
      return;
    }

    onChange?.(value);
  };

  return (
    <label
      className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}
      onClick={handleChange}>
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border transition-all',
          checked ? 'border-text-brand bg-white' : 'border-border-soft bg-white',
        )}>
        {checked && <div className='bg-text-brand h-2.5 w-2.5 rounded-full' />}
      </div>
      {label && (
        <span
          className={cn(
            'body-14 text-text-main select-none',
            required && "text-error after:ml-0.5 after:content-['*']",
            labelClassName,
          )}>
          {label}
        </span>
      )}
      <input
        type='radio'
        name={name}
        value={String(value)}
        checked={checked}
        onChange={() => {}}
        className='hidden'
        disabled={disabled}
      />
    </label>
  );
};

export interface RadioGroupProps {
  children: React.ReactNode;
  label?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  labelPlacement?: 'top' | 'left';
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  labelPlacement = 'top',
  className,
  labelClassName,
  containerClassName,
}) => {
  const renderLabel = () =>
    label && (
      <label
        className={cn('body-16 text-text-main block', labelPlacement === 'top' ? 'mb-2' : 'mr-4 min-w-[90px]', labelClassName)}>
        {label}
        {required && <span className='text-error ml-0.5'>*</span>}
      </label>
    );

  return (
    <div className={cn('w-full', labelPlacement === 'left' ? 'flex items-start' : 'flex flex-col', containerClassName)}>
      {renderLabel()}

      <div className='flex flex-1 flex-col'>
        <div className={cn('flex flex-wrap gap-x-6 gap-y-2', className)}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === Radio) {
              const radioProps = child.props as RadioProps;
              return React.cloneElement(child, {
                checked: radioProps.value === value,
                onChange: (val: string | number) => onChange?.(val),
              } as RadioProps);
            }
            return child;
          })}
        </div>

        {(helperText || error) && (
          <p className={cn('caption-12 mt-1.5', error ? 'text-error' : 'text-text-secondary')}>{error || helperText}</p>
        )}
      </div>
    </div>
  );
};
