import type { Checkbox } from '@/components/ui/checkbox';
import type { ComponentProps } from 'react';

export type AppCheckboxSize = 'sm' | 'md' | 'lg';

export type AppCheckboxProps = Omit<ComponentProps<typeof Checkbox>, 'aria-invalid'> & {
  size?: AppCheckboxSize;
  isInvalid?: boolean;
  onValueChange?: (checked: boolean) => void;
};
