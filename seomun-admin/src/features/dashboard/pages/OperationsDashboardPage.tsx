import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSelect } from '@/components/shared/app-select';
import { PageContainer } from '@/components/shared/PageContainer';
import { useDebounce } from '@/hooks/use-debounce';

import { DashboardGroupBy, DashboardPeriod, useDashboardOperationsQuery, type DashboardOperationsREQ } from '../api';
import {
  DashboardPageHeader,
  ErrorState,
  MetricCardSkeleton,
  OperationMetricCard,
  OverviewLineChart,
  type OperationMetricCardView,
} from '../components';
import { getPeriodOptions } from '../constants';

export function OperationsDashboardPage() {
  const { t } = useTranslation();

  // === State ===
  const [period, setPeriod] = useState<DashboardPeriod>(DashboardPeriod.THIRTY_DAYS);
  const [groupBy, setGroupBy] = useState<DashboardGroupBy>(DashboardGroupBy.DAILY);

  // === Hooks ===
  const periodOptions = useMemo(() => getPeriodOptions(t), [t]);

  const rawParams = useMemo<DashboardOperationsREQ>(() => ({ period }), [period]);
  // Debounced so rapid filter changes coalesce into one request.
  const params = useDebounce(rawParams);
  const { data, isError, isFetching, isLoading, refetch } = useDashboardOperationsQuery(params);

  const filterDescription = String(periodOptions.find((option) => option.value === period)?.label ?? period);

  const metricCards = useMemo<OperationMetricCardView[]>(() => {
    const metric = data?.metric;
    if (!metric) return [];

    const daily = data?.graph_data?.daily;
    const trend = (key: 'sales' | 'members' | 'orders' | 'payments' | 'reviews') => {
      const rawPoints = daily?.[key]?.data ?? [];
      // API inconsistency: `data` is sometimes a date-keyed object instead of an array.
      const points = Array.isArray(rawPoints) ? rawPoints : Object.values(rawPoints);
      if (key === 'sales') return points.map((point) => point.total_amount ?? 0);
      return points.map((point) => point.total ?? 0);
    };

    return [
      {
        key: 'members',
        label: metric.members.label,
        value: metric.members.current,
        unit: metric.members.unit,
        change: metric.members.change,
        trend: trend('members'),
      },
      {
        key: 'sales',
        label: metric.sales.label,
        value: metric.sales.current,
        unit: metric.sales.unit,
        change: metric.sales.change,
        trend: trend('sales'),
      },
      {
        key: 'orders',
        label: metric.orders.label,
        value: metric.orders.current,
        unit: metric.orders.unit,
        change: metric.orders.change,
        trend: trend('orders'),
      },
      {
        key: 'payment_success',
        label: metric.payments.success.label,
        value: metric.payments.success.current,
        unit: metric.payments.success.unit,
        change: metric.payments.success.change,
        trend: trend('payments'),
      },
      {
        key: 'outstanding',
        label: metric.payments.outstanding.label,
        value: metric.payments.outstanding.current,
        unit: metric.payments.outstanding.unit,
        trend: [],
      },
      {
        key: 'reviews',
        label: metric.reviews.label,
        value: metric.reviews.current,
        unit: metric.reviews.unit,
        change: metric.reviews.change,
        trend: trend('reviews'),
      },
    ];
  }, [data]);

  // === Functions ===
  const handleSelectGroupBy = useCallback((value: DashboardGroupBy) => {
    setGroupBy(value);
  }, []);

  return (
    <PageContainer className='gap-8'>
      <DashboardPageHeader
        title={t('page.dashboard.operations.title')}
        description={t('page.dashboard.operations.description')}
        actions={
          <div className='grid w-full gap-3 sm:grid-cols-[180px] xl:max-w-2xl'>
            <AppSelect options={periodOptions} value={period} onValueChange={(value) => value && setPeriod(value)} size='sm' />
          </div>
        }
      />

      {isError && !data ? (
        <ErrorState title={t('page.dashboard.operations.error_title')} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : (
        <>
          {isLoading ? (
            <MetricCardSkeleton />
          ) : (
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6'>
              {metricCards.map((metric) => (
                <OperationMetricCard key={metric.key} metric={metric} filterDescription={filterDescription} />
              ))}
            </div>
          )}

          <div className='w-full'>
            <OverviewLineChart graph={data?.graph_data} isLoading={isLoading} selectedUnit={groupBy} onSelectUnit={handleSelectGroupBy} />
            {/* <NotificationsList data={data?.notifications_hot} isLoading={isLoading} /> */}
          </div>
        </>
      )}
    </PageContainer>
  );
}
