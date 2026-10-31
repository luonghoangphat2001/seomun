import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

import { METRIC_CONFIG } from '../constants';
import { formatDashboardValue, translateDashboardMetric } from '../utils';
import { TinySparkline } from './TinySparkline';

export type OperationMetricCardView = {
  key: string;
  label: string;
  value: number;
  unit: string;
  change?: number;
  trend: number[];
};

type OperationMetricCardProps = {
  metric: OperationMetricCardView;
  filterDescription: string;
};

export function OperationMetricCard({ metric, filterDescription }: OperationMetricCardProps) {
  const { t } = useTranslation();
  const config = METRIC_CONFIG[metric.key] ?? METRIC_CONFIG.default;
  const Icon = config.icon;
  const hasChange = metric.change !== undefined;
  const isPositive = (metric.change ?? 0) >= 0;
  const label = translateDashboardMetric(t, metric.key, metric.label);

  return (
    <Card className='min-h-40 overflow-hidden border-gray-200 bg-white shadow-sm'>
      <CardContent className='flex h-full flex-col justify-between p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='text-muted-foreground truncate text-sm font-medium'>{label}</p>
            <p className='mt-2 truncate text-2xl font-semibold text-gray-950'>{formatDashboardValue(metric.value, metric.unit, t)}</p>
          </div>
          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-white', config.color)}>
            <Icon className='size-5' />
          </div>
        </div>

        <div className='mt-4 space-y-2'>
          <TinySparkline values={metric.trend} color={config.lineColor} />
          <div className='flex items-center justify-between gap-2 text-xs'>
            <span className='text-muted-foreground truncate'>{filterDescription}</span>
            {hasChange && (
              <Badge
                variant='secondary'
                className={cn('shrink-0 gap-1', isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive')}
              >
                {isPositive ? <ArrowUpRight className='size-3' /> : <ArrowDownRight className='size-3' />}
                {Math.abs(metric.change ?? 0)}%
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
