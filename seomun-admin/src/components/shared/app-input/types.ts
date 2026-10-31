import type { ComponentProps, ReactNode } from 'react';

export type AppInputSize = 'sm' | 'md' | 'lg';

export type AppInputProps = Omit<ComponentProps<'input'>, 'size' | 'prefix' | 'value' | 'defaultValue' | 'onChange' | 'aria-invalid'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  size?: AppInputSize;
  isLoading?: boolean;
  clearable?: boolean;
  isInvalid?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  inputClassName?: string;
};
