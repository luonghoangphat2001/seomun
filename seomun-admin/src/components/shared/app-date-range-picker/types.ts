// import type { FocusEventHandler } from 'react';
// import type { Locale } from 'react-day-picker';

// export type DateValue = Date | string | number;

// export type AppDateRangeValue = {
//   from?: DateValue;
//   to?: DateValue;
// };

// export type AppDateRangePickerProps = {
//   value?: AppDateRangeValue;
//   onChange?: (range: { from?: number; to?: number } | undefined) => void;
//   placeholder?: string;
//   className?: string;
//   disabled?: boolean;
//   required?: boolean;
//   isInvalid?: boolean;
//   locale?: Locale;
//   allowClear?: boolean;
//   align?: 'start' | 'center' | 'end';
//   id?: string;
//   name?: string;
//   onBlur?: FocusEventHandler<HTMLButtonElement>;
//   'aria-labelledby'?: string;
//   'aria-describedby'?: string;
// };
import type { ComponentPropsWithoutRef } from 'react';
import type { Locale } from 'react-day-picker';

export type DateValue = Date | string | number;
export type AppDateRangePickerSize = 'sm' | 'md' | 'lg';
export type AppDateRangeValue = {
  from?: DateValue;
  to?: DateValue;
};

export type AppDateRangePickerProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'disabled' | 'required'
> & {
  value?: AppDateRangeValue;
  onChange?: (range: { from?: number; to?: number } | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isInvalid?: boolean;
  locale?: Locale;
  allowClear?: boolean;
  align?: 'start' | 'center' | 'end';
  size?: AppDateRangePickerSize;
};
