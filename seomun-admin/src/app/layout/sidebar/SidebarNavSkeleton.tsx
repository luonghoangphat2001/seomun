import { SidebarContent } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function SidebarNavSkeleton() {
  return (
    <SidebarContent className='py-2'>
      <div className='flex flex-col gap-1 px-2'>
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className='h-8 w-full' />
        ))}
      </div>
    </SidebarContent>
  );
}
