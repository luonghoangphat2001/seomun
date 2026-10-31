import { Skeleton } from '@/components/ui/skeleton';

type MetricCardSkeletonProps = {
  count?: number;
};

export function MetricCardSkeleton({ count = 6 }: MetricCardSkeletonProps) {
  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6'>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className='h-40 rounded-lg' />
      ))}
    </div>
  );
}
