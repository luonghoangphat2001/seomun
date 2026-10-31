import type { Switch } from '@/components/ui/switch';
import type { ComponentProps } from 'react';

export type AppSwitchSize = 'sm' | 'md' | 'lg';

export type AppSwitchProps = Omit<ComponentProps<typeof Switch>, 'aria-invalid' | 'size'> & {
  size?: AppSwitchSize;
  isInvalid?: boolean;
  onValueChange?: (checked: boolean) => void;
};
