'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  inputClassName?: string;
}

export const OtpInput = ({ length = 6, value, onChange, className, inputClassName }: OtpInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, val: string) => {
    if (val && !/^\d+$/.test(val)) return;

    if (val.length > 1) {
      const pasted = val.slice(0, length - index).split('');
      const newOtp = [...value];
      pasted.forEach((char, i) => {
        if (index + i < length) {
          newOtp[index + i] = char;
        }
      });
      onChange(newOtp);
      const nextIndex = Math.min(index + pasted.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...value];
    newOtp[index] = val;
    onChange(newOtp);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className={cn('flex justify-center gap-2', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type='text'
          inputMode='numeric'
          maxLength={length}
          value={value[index] || ''}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(index, e)}
          className={cn(
            'text-text-main border-border-soft focus:border-brand focus:ring-brand h-12 w-11 rounded-lg border text-center text-xl font-medium ring-1 ring-transparent transition-colors outline-none focus:ring-1 sm:h-14 sm:w-12',
            inputClassName,
          )}
        />
      ))}
    </div>
  );
};
