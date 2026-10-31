import type { Button } from '@/components/ui/button';
import type { ComponentProps, ReactNode } from 'react';

export type AppButtonProps = Omit<ComponentProps<typeof Button>, 'asChild'> & {
  isLoading?: boolean;
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};
