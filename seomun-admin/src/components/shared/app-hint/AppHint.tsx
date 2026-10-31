import { cn } from '@/utils/cn';

import type { AppHintProps } from './types';

export function AppHint({ className, children, hint, ...props }: AppHintProps) {
  const content = hint ?? children;

  if (!content) return null;

  return (
    <p className={cn('text-muted-foreground text-xs', className)} {...props}>
      {content}
    </p>
  );
}
