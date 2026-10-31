import { getStatusStyle } from '../utils/production-tools.utils';

type SummaryCardProps = {
  title: string;
  count: number;
  status: string;
};

export function SummaryCard({ title, count, status }: SummaryCardProps) {
  return (
    <div className='bg-card rounded-xl border p-5 shadow-sm transition hover:shadow-md'>
      <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>{title}</div>
      <div className='mt-4 flex items-end justify-between gap-3'>
        <span className='text-3xl font-bold tracking-tight'>{count}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(status)}`}>{title}</span>
      </div>
    </div>
  );
}
