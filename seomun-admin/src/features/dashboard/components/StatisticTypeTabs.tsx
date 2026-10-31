import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/utils/cn';

import type { DashboardStatisticType } from '../api';
import { getStatisticTypeOptions } from '../constants';

type StatisticTypeTabsProps = {
  value: DashboardStatisticType;
  onChange: (type: DashboardStatisticType) => void;
};

export function StatisticTypeTabs({ value, onChange }: StatisticTypeTabsProps) {
  const { t } = useTranslation();
  const options = useMemo(() => getStatisticTypeOptions(t), [t]);

  return (
    <div role='tablist' className='relative flex w-full items-center justify-between border-b border-gray-200'>
      <div className='flex min-w-0 items-center gap-6 overflow-x-auto'>
        {options.map((option) => (
          <button
            key={option.value}
            type='button'
            role='tab'
            aria-selected={value === option.value}
            aria-pressed={value === option.value}
            className={cn(
              'relative min-h-11 shrink-0 cursor-pointer px-0 py-3 text-sm whitespace-nowrap transition-colors',
              value === option.value ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-800',
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {value === option.value ? <span className='bg-primary absolute right-0 bottom-0 left-0 h-0.5' /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
