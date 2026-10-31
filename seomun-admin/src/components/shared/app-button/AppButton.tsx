import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import type { AppButtonProps } from './types';

export function AppButton({ isLoading = false, loadingText, leftIcon, rightIcon, children, disabled, type = 'button', ...props }: AppButtonProps) {
  const isDisabled = disabled || isLoading;
  const content = isLoading && loadingText ? loadingText : children;

  return (
    <Button {...props} type={type} disabled={isDisabled} aria-busy={isLoading || undefined} data-loading={isLoading ? 'true' : undefined}>
      {isLoading ? <Spinner className='size-4' /> : leftIcon}

      {content ? <span className='inline-flex min-w-0 items-center truncate'>{content}</span> : null}

      {!isLoading ? rightIcon : null}
    </Button>
  );
}
