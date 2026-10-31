import { useCallback, useRef, useState, type ChangeEvent } from 'react';

import { cn } from '@/utils/cn';

import { APP_TEXTAREA_RESIZE_CLASSES, APP_TEXTAREA_SIZE_CLASSES } from './constants';
import type { AppTextareaProps } from './types';

const ESTIMATED_LINE_HEIGHT_REM = 1.5;

export function AppTextarea(textareaProps: AppTextareaProps) {
  const {
    ref,
    value: controlledValue,
    defaultValue,
    onValueChange,
    onChange,
    size = 'md',
    isInvalid = false,
    resize = 'vertical',
    minRows = 3,
    maxRows,
    disabled = false,
    readOnly = false,
    className,
    style,
    rows,
    ...props
  } = textareaProps;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isControlled = 'value' in textareaProps;
  const currentValue = isControlled ? (controlledValue ?? '') : uncontrolledValue;

  const setComposedRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const handleValueChange = (nextValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    handleValueChange(event.target.value);
    onChange?.(event);
  };

  return (
    <textarea
      {...props}
      ref={setComposedRef}
      value={currentValue}
      onChange={handleChange}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows ?? minRows}
      aria-invalid={isInvalid || undefined}
      data-invalid={isInvalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      style={{
        ...style,
        maxHeight: maxRows ? `${maxRows * ESTIMATED_LINE_HEIGHT_REM}rem` : style?.maxHeight,
      }}
      className={cn(
        'border-input bg-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 flex w-full min-w-0 rounded-lg border transition-colors outline-none',
        'disabled:bg-input/50 disabled:cursor-not-allowed disabled:opacity-50',
        readOnly && !disabled && 'bg-muted/40 border-border/80 cursor-default',
        isInvalid && 'border-destructive focus:border-destructive focus:ring-destructive/20',
        maxRows && 'overflow-y-auto',
        APP_TEXTAREA_SIZE_CLASSES[size],
        APP_TEXTAREA_RESIZE_CLASSES[resize],
        className,
      )}
    />
  );
}
