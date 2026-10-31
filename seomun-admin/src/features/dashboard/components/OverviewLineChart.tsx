import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { AppSelect } from '@/components/shared/app-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

import { DashboardGroupBy } from '../enums';
import type { OperationGraphData, OperationGraphMetricKey } from '../api';
import { getGroupByOptions } from '../constants';
import { dashboardNumberFormatter, translateDashboardMetric } from '../utils';

type OverviewLineChartProps = {
  graph?: OperationGraphData;
  isLoading?: boolean;
  selectedUnit: DashboardGroupBy;
  onSelectUnit: (value: DashboardGroupBy) => void;
};

const SERIES: { key: OperationGraphMetricKey; labelKey: string; color: string }[] = [
  { key: 'sales', labelKey: 'sales', color: '#f97316' },
  { key: 'orders', labelKey: 'orders', color: '#6366f1' },
  { key: 'members', labelKey: 'members', color: '#06b6d4' },
  { key: 'payments', labelKey: 'payment_success', color: '#10b981' },
];

function toPoints(graph: OperationGraphData, unit: DashboardGroupBy, key: OperationGraphMetricKey) {
  const bucket = unit === DashboardGroupBy.WEEKLY ? graph.weekly?.[key] : graph.daily?.[key];
  const rawArr = bucket?.data ?? [];
  // API inconsistency: `data` is sometimes a date-keyed object instead of an array.
  const arr = Array.isArray(rawArr) ? rawArr : Object.values(rawArr);
  return arr.map((p) => ({
    label: p.date.slice(5, 10),
    sortKey: p.week ?? p.date,
    value: p.total ?? 0,
  }));
}

export function OverviewLineChart({ graph, isLoading, selectedUnit, onSelectUnit }: OverviewLineChartProps) {
  const { t } = useTranslation();
  const groupByOptions = useMemo(() => getGroupByOptions(t), [t]);

  const chartConfig = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        SERIES.map(({ key, labelKey, color }) => [key, { label: translateDashboardMetric(t, labelKey, labelKey), color }]),
      ) as ChartConfig,
    [t],
  );

  const rows = useMemo(() => {
    if (!graph) return [];

    const byLabel = new Map<string, { row: Record<string, number | string>; sortKey: string | number }>();
    for (const { key } of SERIES) {
      for (const point of toPoints(graph, selectedUnit, key)) {
        const entry = byLabel.get(point.label) ?? {
          row: { label: point.label, ...Object.fromEntries(SERIES.map((s) => [s.key, 0])) },
          sortKey: point.sortKey,
        };
        entry.row[key] = point.value;
        byLabel.set(point.label, entry);
      }
    }
    return [...byLabel.values()].sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0)).map((entry) => entry.row);
  }, [graph, selectedUnit]);

  if (isLoading) {
    return <Skeleton className='h-[430px] rounded-lg' />;
  }

  if (!rows.length) return null;

  return (
    <Card className='overflow-hidden border-gray-200 bg-white shadow-sm'>
      <CardHeader className='border-b border-gray-100 bg-linear-to-r from-gray-50 to-white pb-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle className='flex items-center gap-2 text-lg font-bold text-gray-900'>
            <TrendingUp className='text-primary size-5' />
            {t('page.dashboard.operations.overview_title')}
          </CardTitle>
          <AppSelect
            options={groupByOptions}
            className='w-full sm:w-36'
            value={selectedUnit}
            onValueChange={(value) => value && onSelectUnit(value)}
          />
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        <ChartContainer config={chartConfig} className='h-[340px] w-full'>
          <LineChart data={rows} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
            {/* Whole-number counts with thousand separators; no fractional ticks. */}
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              allowDecimals={false}
              tickFormatter={(value) => dashboardNumberFormatter.format(Number(value))}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {SERIES.map(({ key }) => (
              <Line key={key} type='linear' dataKey={key} stroke={`var(--color-${key})`} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
