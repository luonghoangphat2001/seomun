import { CloseCircleInput } from '@/icons';
import { cn } from '@/lib/utils';
import React, { forwardRef, InputHTMLAttributes } from 'react';

type InputVariant = 'default' | 'focused' | 'error' | 'disabled';
type LabelPlacement = 'top' | 'left';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'disabled' | 'readOnly'> {
  label?: React.ReactNode;
  subLabel?: React.ReactNode;
  error?: string;
  required?: boolean;
  helperText?: string;
  helperTextClassName?: string;
  variant?: InputVariant;
  labelPlacement?: LabelPlacement;
  showClear?: boolean;
  onClear?: () => void;
  suffix?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  textLabelClassName?: string;
  containerClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  isError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      subLabel,
      error,
      required = false,
      helperText,
      helperTextClassName,
      variant = 'default',
      labelPlacement = 'top',
      showClear = true,
      onClear,
      suffix,
      className,
      inputClassName,
      labelClassName,
      textLabelClassName,
      containerClassName,
      value,
      onChange,
      readOnly,
      isError: isErrorProp,
      ...props
    },
    ref,
  ) => {
    const isError = isErrorProp || !!error;
    const isDisabled = props.disabled || variant === 'disabled';
    const isReadOnly = readOnly;

    const baseInputClass =
      'text-text-main input-15 w-full rounded-[8px] border bg-white px-3 py-2.5 transition-all duration-200 placeholder:text-gray-400 focus:outline-none';

    const variantClasses: Record<InputVariant, string> = {
      default: 'border-border-soft focus:border-border-brand focus:ring-0',
      focused: 'border-border-brand ring-0',
      error: 'border-error focus:border-error focus:ring-0',
      disabled: 'cursor-not-allowed border-border-soft bg-fill-disabled text-text-disabled',
    };

    const handleClear = () => {
      onClear?.();
      onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    };

    const renderInput = () => (
      <div className={cn('group relative w-full')}>
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          readOnly={isReadOnly}
          className={cn(
            baseInputClass,
            variantClasses[isError ? 'error' : variant],
            isDisabled && variantClasses['disabled'],
            isReadOnly && 'focus:border-border-soft cursor-default',
            showClear && 'pr-10',
            // suffix && 'pr-12',
            className,
          )}
          {...props}
        />

        <div className='absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1'>
          {showClear && value && !isDisabled && !isReadOnly && (
            <button type='button' onClick={handleClear} className='text-gray-400 transition-colors hover:text-gray-600'>
              <CloseCircleInput className='h-5 w-5' />
            </button>
          )}
          {suffix && <div className='body-14 pointer-events-none text-gray-500'>{suffix}</div>}
        </div>
      </div>
    );

    const renderLabel = () => {
      if (!label) return null;

      return (
        <div
          className={cn(
            'block',
            labelPlacement === 'top' ? 'mb-1' : 'mr-4 min-w-[90px]',
            (helperText || error) && labelPlacement == 'left' && 'mb-[22px]',
            labelClassName,
          )}>
          <label className={cn('body-16 text-text-main block', textLabelClassName)}>
            {label}
            {required && <span className='text-error ml-0.5'>*</span>}
          </label>
          {subLabel && <p className='caption-12 text-text-main mt-1'>{subLabel}</p>}
        </div>
      );
    };

    return (
      <div
        className={cn(
          'w-full',
          labelPlacement === 'left' ? 'flex items-center justify-between' : 'flex flex-col',
          containerClassName,
        )}>
        {renderLabel()}

        <div className={cn('flex w-full flex-col', inputClassName)}>
          {renderInput()}

          {(helperText || error) && (
            <p className={cn('caption-12 mt-1.5', error ? 'text-error' : 'text-text-secondary', helperTextClassName)}>
              {error || helperText}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';
