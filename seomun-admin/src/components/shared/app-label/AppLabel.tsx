import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';

import type { AppLabelProps } from './types';

export function AppLabel({ className, children, label, required = false, ...props }: AppLabelProps) {
  return (
    <Label className={cn('text-muted-foreground text-xs font-medium tracking-wider', className)} {...props}>
      {label ?? children}
      {required ? <span className='text-destructive ml-1'>*</span> : null}
    </Label>
  );
}
