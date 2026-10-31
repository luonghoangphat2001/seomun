import type { RadioGroup } from '@/components/ui/radio-group';
import type { ComponentProps, ReactNode } from 'react';

export type AppRadioGroupSize = 'sm' | 'md' | 'lg';
export type AppRadioGroupOrientation = 'vertical' | 'horizontal';

export type AppRadioGroupOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type AppRadioGroupProps = Omit<
  ComponentProps<typeof RadioGroup>,
  'value' | 'defaultValue' | 'onValueChange' | 'aria-invalid' | 'orientation'
> & {
  options: AppRadioGroupOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: AppRadioGroupSize;
  isInvalid?: boolean;
  orientation?: AppRadioGroupOrientation;
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  itemClassName?: string;
  radioClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
};
