import { ArrowDownRight, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/utils/cn';

import type { DashboardStatisticSection } from '../api';
import {
  dashboardCompactFormatter,
  dashboardNumberFormatter,
  formatDashboardValue,
  translateDashboardBreakdownLabel,
  translateDashboardChartLabel,
  translateDashboardSectionDescription,
  translateDashboardSectionTitle,
  translateDashboardStatLabel,
  translateDashboardTrendLabel,
} from '../utils';
import { BreakdownList } from './BreakdownList';

type StatisticSectionCardProps = {
  section: DashboardStatisticSection;
};

type ChartSeries = { key: string; axis: 'left' | 'right' };

const SINGLE_SERIES_COLOR = '#f59e0b';
const TICK_MAX_LENGTH = 10;

const truncateTick = (value: string) => (value.length > TICK_MAX_LENGTH ? `${value.slice(0, TICK_MAX_LENGTH)}…` : value);

export function StatisticSectionCard({ section }: StatisticSectionCardProps) {
  const { t } = useTranslation();
  const hasChange = section.change_rate !== undefined;
  const isPositive = (section.change_rate ?? 0) >= 0;
  const title = translateDashboardSectionTitle(t, section.id, section.title);
  const description = translateDashboardSectionDescription(t, section.id, section.description);

  const chart = useMemo(() => {
    if (section.multiSeries) {
      const { keys, rows, chartType } = section.multiSeries;
      const config = Object.fromEntries(
        keys.map(({ key, label, color }) => [key, { label: translateDashboardBreakdownLabel(t, label), color }]),
      ) as ChartConfig;
      const series: ChartSeries[] = keys.map(({ key, axis }) => ({ key, axis: axis ?? 'left' }));
      const hasRightAxis = series.some((entry) => entry.axis === 'right');

      return { config, rows, series, showLegend: true, type: chartType ?? ('line' as const), hasRightAxis };
    }

    if (section.chart.length > 0) {
      const rows = section.chart.map((point) => {
        const label = translateDashboardTrendLabel(t, point.label);
        return { label: /^\d{4}-\d{2}-\d{2}$/.test(label) ? label.slice(5) : label, value: point.value };
      });
      const config = { value: { label: translateDashboardChartLabel(t, section.unit), color: SINGLE_SERIES_COLOR } } satisfies ChartConfig;
      const series: ChartSeries[] = [{ key: 'value', axis: 'left' }];

      return { config, rows, series, showLegend: false, type: 'line' as const, hasRightAxis: false };
    }

    return null;
  }, [section.multiSeries, section.chart, section.unit, title, t]);

  // Some sections are a headline number and nothing else (e.g. payment revenue) — no empty body for those.
  const hasBody = chart !== null || section.breakdown.length > 0 || Boolean(section.extra_stats?.length);

  return (
    <Card className='overflow-hidden border-gray-200 bg-white shadow-sm'>
      <CardHeader className={cn('bg-linear-to-r from-gray-50 to-white pb-4', hasBody && 'border-b border-gray-100')}>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <CardTitle className='flex items-center gap-2 text-lg font-bold text-gray-900'>
              <BarChart3 className='text-primary size-5' />
              <span className='truncate'>{title}</span>
            </CardTitle>
            <p className='text-muted-foreground mt-2 text-sm'>{description}</p>
          </div>
          {/* The headline number lives up here so the header's empty right side carries it instead of the chart column. */}
          <div className='flex shrink-0 flex-col items-end gap-1'>
            <p className='text-muted-foreground text-sm font-medium'>
              {section.total_label
                ? translateDashboardStatLabel(t, section.total_label.key, section.total_label.fallback)
                : t('page.dashboard.statistics.total')}
            </p>

            <p className='text-2xl font-semibold whitespace-nowrap text-gray-950'>{formatDashboardValue(section.total, section.unit, t)}</p>

            {hasChange && (
              <Badge
                variant='secondary'
                className={cn('mt-0.5 shrink-0 gap-1', isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive')}
              >
                {isPositive ? <ArrowUpRight className='size-3' /> : <ArrowDownRight className='size-3' />}
                {Math.abs(section.change_rate ?? 0)}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {hasBody && (
        <CardContent className='p-5'>
          {/* Long breakdown lists (e.g. order statuses) stack below the chart instead of squeezing into a side column. */}
          <div
            className={cn(
              'grid gap-5',
              section.breakdown.length > 0 && section.breakdown.length <= 8 && 'lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]',
            )}
          >
            <div className='min-w-0 space-y-4'>
              {section.extra_stats?.length ? (
                <div className='flex flex-wrap gap-2'>
                  {section.extra_stats.map((stat) => (
                    <Badge key={stat.key} variant='outline' className='text-muted-foreground gap-1 font-normal'>
                      {translateDashboardStatLabel(t, stat.key, stat.label)}: {formatDashboardValue(stat.value, stat.unit, t)}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {chart?.type === 'bar' && (
                <ChartContainer config={chart.config} className='h-64 w-full'>
                  <BarChart data={chart.rows} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    {/* Category names are arbitrarily long (product titles), so every tick is clipped and angled. */}
                    <XAxis
                      dataKey='label'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval={0}
                      angle={-30}
                      textAnchor='end'
                      height={72}
                      tickFormatter={(value) => truncateTick(String(value))}
                    />
                    <YAxis
                      yAxisId='left'
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      allowDecimals={false}
                      tickFormatter={(value) => dashboardCompactFormatter.format(Number(value))}
                    />
                    {chart.hasRightAxis && (
                      <YAxis
                        yAxisId='right'
                        orientation='right'
                        tickLine={false}
                        axisLine={false}
                        width={48}
                        allowDecimals={false}
                        tickFormatter={(value) => dashboardCompactFormatter.format(Number(value))}
                      />
                    )}
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {chart.series.map(({ key, axis }) => (
                      <Bar key={key} yAxisId={axis} dataKey={key} fill={`var(--color-${key})`} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ChartContainer>
              )}

              {chart?.type === 'line' && (
                <ChartContainer config={chart.config} className='h-48 w-full'>
                  <LineChart data={chart.rows} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
                    {/* Whole numbers with thousand separators (e.g. 800,000); no fractional ticks. */}
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      allowDecimals={false}
                      tickFormatter={(value) => dashboardNumberFormatter.format(Number(value))}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {chart.showLegend && <ChartLegend content={<ChartLegendContent />} />}
                    {chart.series.map(({ key }) => (
                      <Line key={key} type='linear' dataKey={key} stroke={`var(--color-${key})`} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ChartContainer>
              )}
            </div>

            {section.breakdown.length > 0 && (
              <div className='rounded-lg border border-gray-100 bg-gray-50/60 p-4'>
                <BreakdownList items={section.breakdown} />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
