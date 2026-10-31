import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

type TinySparklineProps = {
  values: number[];
  color: string;
};

export function TinySparkline({ values, color }: TinySparklineProps) {
  const { t } = useTranslation();
  const data = useMemo(() => values.map((value, index) => ({ index, value })), [values]);

  if (!values.length) return null;

  return (
    <div className='h-10 w-full' role='img' aria-label={t('page.dashboard.trend_chart_label')}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Line type='linear' dataKey='value' stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
