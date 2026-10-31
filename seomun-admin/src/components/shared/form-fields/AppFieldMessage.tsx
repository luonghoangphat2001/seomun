import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type AppFieldMessageVariant = 'description' | 'error';

export type AppFieldMessageProps = Omit<ComponentProps<'p'>, 'children'> & {
  message?: ReactNode;
  children?: ReactNode;
  variant?: AppFieldMessageVariant;
};

export function AppFieldMessage({ message, children, variant = 'description', className, ...props }: AppFieldMessageProps) {
  const content = children ?? message;

  if (content === null || content === undefined || content === false) {
    return null;
  }

  return (
    <p
      className={cn('text-xs leading-5', variant === 'description' && 'text-muted-foreground', variant === 'error' && 'text-destructive', className)}
      {...props}
    >
      {content}
    </p>
  );
}
