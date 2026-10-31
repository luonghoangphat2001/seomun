import { cn } from '@/utils/cn';

import type { AppMessageProps } from './types';

export function AppMessage({ className, children, message, ...props }: AppMessageProps) {
  const content = message ?? children;

  if (!content) return null;

  return (
    <p className={cn('text-destructive text-xs font-medium', className)} {...props}>
      {content}
    </p>
  );
}
