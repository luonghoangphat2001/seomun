import { cn } from '@/lib/utils';

export const TitleCell = ({ title, isNew }: { title: string; isNew: boolean }) => (
  <div className='flex items-center gap-3'>
    <span className={cn('truncate', isNew && 'font-semibold')}>{title}</span>
    {isNew && (
      <span
        className='title-14 inline-flex shrink-0 items-center bg-clip-text text-transparent'
        style={{ backgroundImage: 'linear-gradient(90deg, #FF3D07, #F5BF20, #F23580)' }}>
        NEW
      </span>
    )}
  </div>
);
