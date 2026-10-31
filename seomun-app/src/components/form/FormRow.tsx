import React from 'react';
import { cn } from '@/lib/utils';

export interface FormRowProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperText?: string;
  error?: string;
  labelPlacement?: 'top' | 'left';
}

export const FormRow: React.FC<FormRowProps> = ({
  label,
  children,
  required,
  icon,
  className,
  labelClassName,
  inputClassName,
  helperText,
  error,
  labelPlacement = 'left',
}) => {
  const isLeft = labelPlacement === 'left';

  return (
    <div className={cn('w-full', isLeft ? 'flex items-start justify-between' : 'flex flex-col gap-1', className)}>
      <div
        className={cn(
          'flex items-center gap-1.5',
          isLeft ? 'mt-2.5 mr-4 min-w-[94px] shrink-0' : '',
          (helperText || error) && isLeft && 'mb-[22px]',
          labelClassName,
        )}>
        <label className='body-16 text-text-main'>
          {label}
          {required && <span className='text-error ml-0.5'>*</span>}
        </label>
        {icon}
      </div>

      <div className={cn('flex w-full flex-col', inputClassName)}>
        <div className='grow'>{children}</div>
        {(helperText || error) && (
          <p className={cn('caption-12 mt-1.5', error ? 'text-error' : 'text-text-secondary')}>{error || helperText}</p>
        )}
      </div>
    </div>
  );
};
