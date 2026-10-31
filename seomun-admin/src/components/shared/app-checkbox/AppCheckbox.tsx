import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/cn';

import { APP_CHECKBOX_CONTROL_SIZE_CLASSES } from './constants';
import type { AppCheckboxProps } from './types';

export function AppCheckbox({
  size = 'md',
  disabled = false,
  isInvalid = false,
  className,
  onCheckedChange,
  onValueChange,
  ...props
}: AppCheckboxProps) {
  const handleCheckedChange: AppCheckboxProps['onCheckedChange'] = (checked) => {
    onCheckedChange?.(checked);
    onValueChange?.(checked === true);
  };

  return (
    <Checkbox
      {...props}
      disabled={disabled}
      aria-invalid={isInvalid || undefined}
      data-invalid={isInvalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      onCheckedChange={handleCheckedChange}
      className={cn(
        APP_CHECKBOX_CONTROL_SIZE_CLASSES[size],
        isInvalid &&
          'border-destructive aria-invalid:border-destructive data-[state=checked]:border-destructive data-[state=checked]:bg-destructive aria-invalid:ring-0',
        className,
      )}
    />
  );
}
