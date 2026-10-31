import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/cn';

import { APP_SWITCH_PRIMITIVE_SIZE, APP_SWITCH_SIZE_CLASSES } from './constants';
import type { AppSwitchProps } from './types';

export function AppSwitch({ size = 'md', disabled = false, isInvalid = false, className, onCheckedChange, onValueChange, ...props }: AppSwitchProps) {
  const handleCheckedChange: AppSwitchProps['onCheckedChange'] = (checked) => {
    onCheckedChange?.(checked);
    onValueChange?.(checked === true);
  };

  return (
    <Switch
      {...props}
      size={APP_SWITCH_PRIMITIVE_SIZE[size]}
      disabled={disabled}
      aria-invalid={isInvalid || undefined}
      data-invalid={isInvalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      onCheckedChange={handleCheckedChange}
      className={cn(APP_SWITCH_SIZE_CLASSES[size], isInvalid && 'aria-invalid:ring-0', className)}
    />
  );
}
