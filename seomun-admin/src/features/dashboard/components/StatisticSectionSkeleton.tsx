import { Skeleton } from '@/components/ui/skeleton';

export function StatisticSectionSkeleton() {
  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className='h-[390px] rounded-lg' />
      ))}
    </div>
  );
}
