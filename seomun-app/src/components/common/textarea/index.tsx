import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextareaVariant = 'default' | 'focused' | 'error' | 'disabled';
type LabelPlacement = 'top' | 'left';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'disabled' | 'readOnly'> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  variant?: TextareaVariant;
  labelPlacement?: LabelPlacement;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  isError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      required = false,
      helperText,
      variant = 'default',
      labelPlacement = 'top',
      className,
      labelClassName,
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

    const baseTextareaClass =
      'text-text-main input-15 w-full rounded-[8px] border bg-white px-3 py-2.5 transition-all duration-200 placeholder:text-gray-400 focus:outline-none min-h-[120px]';

    const variantClasses: Record<TextareaVariant, string> = {
      default: 'border-border-soft focus:border-border-brand focus:ring-0',
      focused: 'border-border-brand ring-0',
      error: 'border-error focus:border-error focus:ring-0',
      disabled: 'cursor-not-allowed border-border-soft bg-fill-disabled text-text-disabled',
    };

    const renderTextarea = () => (
      <div className='group relative w-full'>
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          readOnly={isReadOnly}
          className={cn(
            baseTextareaClass,
            variantClasses[isError ? 'error' : variant],
            isDisabled && variantClasses['disabled'],
            isReadOnly && 'focus:border-border-soft cursor-default',
            className,
          )}
          {...props}
        />
      </div>
    );

    const renderLabel = () =>
      label && (
        <label
          className={cn(
            'body-16 text-text-main block',
            labelPlacement === 'top' ? 'mb-1' : 'mr-4 min-w-[90px]',
            (helperText || error) && labelPlacement == 'left' && 'mb-[22px]',
            labelClassName,
          )}>
          {label}
          {required && <span className='text-error ml-0.5'>*</span>}
        </label>
      );

    return (
      <div className={cn('w-full', labelPlacement === 'left' ? 'flex items-center' : 'flex flex-col', containerClassName)}>
        {renderLabel()}

        <div className='flex w-full flex-col'>
          {renderTextarea()}

          {(helperText || error) && (
            <p className={cn('caption-12 mt-1.5', error ? 'text-error' : 'text-text-secondary')}>{error || helperText}</p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
