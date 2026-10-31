import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, Loader2, X } from 'lucide-react';
import { forwardRef, useMemo, useState, type ComponentProps } from 'react';
import type { Matcher } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

import { APP_INPUT_ICON_SIZE_CLASSES, APP_INPUT_ROOT_SIZE_CLASSES, APP_INPUT_TEXT_SIZE_CLASSES } from '@/components/shared/app-input/constants';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

import type { AppDatePickerProps } from './types';

export const AppDatePicker = forwardRef<HTMLButtonElement, AppDatePickerProps>((props, ref) => {
  const { t } = useTranslation();

  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    placeholder,
    size = 'md',
    loading = false,
    clearable = false,
    isInvalid = false,
    disabled = false,
    required = false,
    className,
    triggerClassName,
    contentClassName,
    formatStr = 'dd/MM/yyyy',
    minDate,
    maxDate,
    disabledDates,
    calendarProps,
    ...buttonProps
  } = props;

  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue ?? null);
  const [open, setOpen] = useState(false);

  const isControlled = 'value' in props;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;
  const hasValue = Boolean(currentValue);
  const isDisabled = disabled || loading;

  const mergedDisabledDates = useMemo<ComponentProps<typeof Calendar>['disabled']>(() => {
    if (disabled) return true;

    const matchers: Matcher[] = [];

    if (minDate) {
      matchers.push({ before: minDate });
    }

    if (maxDate) {
      matchers.push({ after: maxDate });
    }

    if (Array.isArray(disabledDates)) {
      matchers.push(...disabledDates);
    } else if (disabledDates) {
      matchers.push(disabledDates);
    }

    return matchers.length > 0 ? matchers : undefined;
  }, [disabled, minDate, maxDate, disabledDates]);

  const handleValueChange = (nextValue: Date | null) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleSelect = (date: Date | undefined) => {
    handleValueChange(date ?? null);
    setOpen(false);
  };

  const handleClear = () => {
    handleValueChange(null);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDisabled) {
          setOpen(nextOpen);
        }
      }}
    >
      <div
        className={cn(
          'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 relative w-full rounded-lg border transition-colors',
          APP_INPUT_ROOT_SIZE_CLASSES[size],
          disabled && 'bg-input/50 pointer-events-none cursor-not-allowed opacity-50',
          isInvalid && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
          className,
        )}
        data-invalid={isInvalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <div className='relative h-full'>
          <PopoverTrigger asChild>
            <button
              {...buttonProps}
              ref={ref}
              type='button'
              role='combobox'
              disabled={isDisabled}
              aria-invalid={isInvalid || undefined}
              aria-required={required || undefined}
              aria-expanded={open}
              aria-haspopup='dialog'
              className={cn(
                'flex h-full w-full min-w-0 cursor-pointer items-center justify-start gap-2 rounded-[inherit] bg-transparent px-0 text-left outline-none disabled:cursor-not-allowed',
                APP_INPUT_TEXT_SIZE_CLASSES[size],
                clearable && hasValue ? 'pr-16' : 'pr-9',
                triggerClassName,
              )}
            >
              <CalendarIcon className={cn('text-muted-foreground shrink-0', APP_INPUT_ICON_SIZE_CLASSES[size])} />

              <span className={cn('min-w-0 flex-1 truncate', !hasValue && 'text-muted-foreground')}>
                {currentValue ? format(currentValue, formatStr) : (placeholder ?? t('common.message.select_date'))}
              </span>
            </button>
          </PopoverTrigger>

          {loading ? (
            <Loader2
              className={cn(
                'text-muted-foreground pointer-events-none absolute top-1/2 right-8 -translate-y-1/2 animate-spin',
                APP_INPUT_ICON_SIZE_CLASSES[size],
              )}
            />
          ) : null}

          {!loading && clearable && hasValue && !disabled ? (
            <button
              type='button'
              aria-label={t('common.action.clear')}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleClear();
              }}
              className='text-muted-foreground hover:bg-muted focus-visible:ring-ring absolute top-1/2 right-8 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 outline-none focus-visible:ring-2'
            >
              <X className={APP_INPUT_ICON_SIZE_CLASSES[size]} />
            </button>
          ) : null}

          <ChevronDown
            className={cn('text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2', APP_INPUT_ICON_SIZE_CLASSES[size])}
          />
        </div>
      </div>

      <PopoverContent className={cn('w-auto p-0', contentClassName)} align='start'>
        <Calendar
          className='rounded-lg'
          mode='single'
          selected={currentValue ?? undefined}
          onSelect={handleSelect}
          initialFocus
          disabled={mergedDisabledDates}
          startMonth={minDate ? new Date(minDate.getFullYear(), minDate.getMonth()) : calendarProps?.startMonth}
          endMonth={maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth()) : calendarProps?.endMonth}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
});

AppDatePicker.displayName = 'AppDatePicker';
