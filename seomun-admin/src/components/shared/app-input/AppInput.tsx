import { Loader2, X } from 'lucide-react';
import { useCallback, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';

import { cn } from '@/utils/cn';

import {
  APP_INPUT_AFFIX_ICON_SIZE_CLASSES,
  APP_INPUT_ICON_SIZE_CLASSES,
  APP_INPUT_ROOT_SIZE_CLASSES,
  APP_INPUT_TEXT_SIZE_CLASSES,
} from './constants';
import type { AppInputProps } from './types';

export function AppInput(inputProps: AppInputProps) {
  const {
    ref,
    value: controlledValue,
    defaultValue,
    onValueChange,
    onChange,
    onEnter,
    onClear,
    size = 'md',
    isLoading = false,
    clearable = false,
    isInvalid = false,
    disabled = false,
    readOnly = false,
    prefix,
    suffix,
    inputClassName,
    className,
    onKeyDown,
    ...props
  } = inputProps;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = 'value' in inputProps;
  const currentValue = isControlled ? (controlledValue ?? '') : uncontrolledValue;
  const hasValue = currentValue.length > 0;

  const setComposedRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;

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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleValueChange(event.target.value);
    onChange?.(event);
  };

  const handleClear = () => {
    if (disabled || readOnly) {
      return;
    }

    handleValueChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    if (!event.defaultPrevented && event.key === 'Enter') {
      onEnter?.(event);
    }
  };

  return (
    <div
      className={cn(
        'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 flex w-full min-w-0 items-center rounded-lg border transition-colors',
        APP_INPUT_ROOT_SIZE_CLASSES[size],
        disabled && 'bg-input/50 pointer-events-none cursor-not-allowed opacity-50',
        readOnly && !disabled && 'bg-muted/40 border-border/80',
        isInvalid && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
        className,
      )}
      data-loading={isLoading ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={isInvalid ? 'true' : undefined}
    >
      {prefix ? (
        <div className={cn('text-muted-foreground flex shrink-0 items-center [&>svg]:shrink-0', APP_INPUT_AFFIX_ICON_SIZE_CLASSES[size])}>
          {prefix}
        </div>
      ) : null}

      <input
        {...props}
        ref={setComposedRef}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={isInvalid || undefined}
        className={cn(
          'placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed',
          readOnly && 'cursor-default',
          APP_INPUT_TEXT_SIZE_CLASSES[size],
          inputClassName,
        )}
      />

      <div className='flex shrink-0 items-center gap-1.5'>
        {suffix ? (
          <div className={cn('text-muted-foreground flex items-center [&>svg]:shrink-0', APP_INPUT_AFFIX_ICON_SIZE_CLASSES[size])}>{suffix}</div>
        ) : null}

        {isLoading ? <Loader2 className={cn('text-muted-foreground animate-spin', APP_INPUT_ICON_SIZE_CLASSES[size])} /> : null}

        {!isLoading && !disabled && !readOnly && clearable && hasValue ? (
          <button
            type='button'
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            disabled={disabled}
            aria-label='Clear input'
            className='text-muted-foreground hover:bg-muted focus-visible:ring-ring rounded-full p-0.5 outline-none focus-visible:ring-2'
          >
            <X className={APP_INPUT_ICON_SIZE_CLASSES[size]} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
