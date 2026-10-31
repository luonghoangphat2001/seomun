import type { ComponentProps, ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';

export type AppFieldLabelProps = Omit<ComponentProps<typeof Label>, 'children'> & {
  label?: ReactNode;
  children?: ReactNode;
  required?: boolean;
};

export function AppFieldLabel({ label, children, required = false, className, ...props }: AppFieldLabelProps) {
  const content = children ?? label;

  if (content === null || content === undefined || content === false) {
    return null;
  }

  return (
    <Label className={cn('leading-5', className)} {...props}>
      <span>{content}</span>
      {required ? (
        <span className='text-destructive' aria-hidden='true'>
          *
        </span>
      ) : null}
    </Label>
  );
}
