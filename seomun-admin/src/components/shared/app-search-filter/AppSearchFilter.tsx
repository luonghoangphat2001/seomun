import { RotateCcw, Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { AppFieldLabel } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type AppSearchFilterProps = {
  children: ReactNode;
  onReset: () => void;
  onSearch: () => void;
  actions?: ReactNode;
  className?: string;
};

/** One-row search filter, reset/search sit at the end of the row. */
export function AppSearchFilter({ children, onReset, onSearch, actions, className }: AppSearchFilterProps) {
  const { t } = useTranslation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-wrap items-end gap-3', className)}>
      {children}

      <div className='ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onReset} className='gap-2'>
          <RotateCcw className='size-4' />
          {t('common.action.reset')}
        </Button>
        {actions}
        <Button type='submit' className='gap-2'>
          <Search className='size-4' />
          {t('common.action.search')}
        </Button>
      </div>
    </form>
  );
}

type AppSearchFilterFieldProps = {
  children: ReactNode;
  label?: string;
  htmlFor?: string;
  wide?: boolean;
  className?: string;
};

export function AppSearchFilterField({ children, label, htmlFor, wide = false, className }: AppSearchFilterFieldProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-40 sm:flex-1',
        wide ? 'sm:max-w-96 sm:min-w-56 sm:flex-[1.5]' : 'sm:max-w-72',
        className,
      )}
    >
      {label ? <AppFieldLabel htmlFor={htmlFor} label={label} /> : null}
      {children}
    </div>
  );
}
