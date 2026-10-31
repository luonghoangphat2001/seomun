import type { ComponentPropsWithoutRef } from 'react';

import type { Calendar } from '@/components/ui/calendar';

export type AppDatePickerSize = 'sm' | 'md' | 'lg';

export type AppDatePickerProps = Omit<ComponentPropsWithoutRef<'button'>, 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'disabled'> & {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  placeholder?: string;
  size?: AppDatePickerSize;
  loading?: boolean;
  clearable?: boolean;
  isInvalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  formatStr?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: ComponentPropsWithoutRef<typeof Calendar>['disabled'];
  triggerClassName?: string;
  contentClassName?: string;
  calendarProps?: Omit<ComponentPropsWithoutRef<typeof Calendar>, 'mode' | 'selected' | 'onSelect'>;
};
