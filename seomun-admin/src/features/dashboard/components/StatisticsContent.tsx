import { useTranslation } from 'react-i18next';

import { cn } from '@/utils/cn';

import type { DashboardStatisticsRESP } from '../api';
import { ErrorState } from './ErrorState';
import { StatisticSectionCard } from './StatisticSectionCard';
import { StatisticSectionSkeleton } from './StatisticSectionSkeleton';

type StatisticsContentProps = {
  statistics?: DashboardStatisticsRESP;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  onRetry: () => void;
};

export function StatisticsContent({ statistics, isError, isFetching, isLoading, onRetry }: StatisticsContentProps) {
  const { t } = useTranslation();

  if (isError && !statistics) {
    return <ErrorState title={t('page.dashboard.statistics.error_title')} isFetching={isFetching} onRetry={onRetry} />;
  }

  if (isLoading) {
    return <StatisticSectionSkeleton />;
  }

  if (!statistics?.sections.length) {
    return (
      <div className='bg-card flex min-h-64 flex-col items-center justify-center rounded-lg border px-6 py-10 text-center shadow-sm'>
        <h2 className='text-lg font-semibold'>{t('page.dashboard.statistics.empty_title')}</h2>
        <p className='text-muted-foreground mt-1 text-sm'>{t('page.dashboard.statistics.empty_description')}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', statistics.sections.length > 1 && 'xl:grid-cols-2')}>
      {statistics.sections.map((section) => (
        <StatisticSectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}
