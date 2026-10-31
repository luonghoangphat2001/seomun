import { AppButton } from '@/components/shared/app-button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';
import { format, isDate, parseISO } from 'date-fns';
import { CalendarIcon, X, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DateRange } from 'react-day-picker';
import type { AppDateRangePickerProps, DateValue } from './types';
import { APP_INPUT_ICON_SIZE_CLASSES, APP_INPUT_ROOT_SIZE_CLASSES, APP_INPUT_TEXT_SIZE_CLASSES } from '../app-input/constants';

const toDate = (date?: DateValue): Date | undefined => {
  if (!date) return undefined;

  if (isDate(date)) return date as Date;
  if (typeof date === 'number') return new Date(date);
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    if (!isNaN(parsed.getTime())) return parsed;
    const d = new Date(date);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
};
export const AppDateRangePicker = ({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  required = false,
  locale,
  allowClear,
  align = 'start',
  isInvalid = false,

  size = 'md',
  ...buttonProps
}: AppDateRangePickerProps) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const internalValue = useMemo<DateRange | undefined>(() => {
    if (!value) return undefined;
    return {
      from: toDate(value.from),
      to: toDate(value.to),
    };
  }, [value]);

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return placeholder ?? t('common.message.select_date_range');
    if (!range.to) return format(range.from, 'yyyy-MM-dd', { locale });
    return `${format(range.from, 'yyyy-MM-dd', { locale })} - ${format(range.to, 'yyyy-MM-dd', { locale })}`;
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (!onChange) return;
    if (!range) {
      onChange(undefined);
      return;
    }
    const fromTime = range.from?.getTime();
    const toTime = range.to?.getTime();
    // When only the start date is selected, react-day-picker may set both from and to to the same day — only pass from, leave to undefined
    if (fromTime && toTime && range.from && range.to && range.from.getTime() === range.to.getTime()) {
      onChange({ from: fromTime, to: undefined });
      return;
    }
    onChange({
      from: fromTime,
      to: toTime,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <AppButton
          {...buttonProps}
          type='button'
          variant='outline'
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          data-invalid={isInvalid ? 'true' : undefined}
          className={cn(
            'hover:bg-background focus-visible:border-input w-full justify-between font-normal focus-visible:ring-0 focus-visible:outline-none',
            APP_INPUT_ROOT_SIZE_CLASSES[size],
            APP_INPUT_TEXT_SIZE_CLASSES[size],
            !internalValue?.from && 'text-muted-foreground hover:text-muted-foreground',
            isInvalid && 'border-destructive focus-visible:border-destructive',
            className,
          )}
          rightIcon={
            <div className='flex items-center gap-1.5'>
              {allowClear && internalValue?.from && (
                <div
                  role='button'
                  tabIndex={0}
                  aria-label={t('common.action.clear')}
                  className='hover:bg-muted rounded-full p-0.5 transition-colors'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(undefined);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      handleSelect(undefined);
                    }
                  }}
                >
                  <X className={cn('text-muted-foreground', APP_INPUT_ICON_SIZE_CLASSES[size])} />
                </div>
              )}
              {!internalValue?.from && <ChevronDown className={cn('text-muted-foreground', APP_INPUT_ICON_SIZE_CLASSES[size])} />}
            </div>
          }
        >
          <div className='flex items-center gap-2 truncate'>
            <CalendarIcon className={cn('shrink-0', APP_INPUT_ICON_SIZE_CLASSES[size])} />
            <span className='truncate'>{formatDateRange(internalValue)}</span>
          </div>
        </AppButton>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align={align} sideOffset={8}>
        <Calendar mode='range' selected={internalValue} onSelect={handleSelect} numberOfMonths={2} locale={locale} className='bg-white' />
        <div className='flex justify-end border-t px-3 py-2'>
          <AppButton type='button' size='sm' onClick={() => setOpen(false)}>
            {t('common.action.confirm')}
          </AppButton>
        </div>
      </PopoverContent>
    </Popover>
  );
};
