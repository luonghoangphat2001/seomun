import { cn } from '@/lib/utils';

interface MemberTypeCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export const MemberTypeCard: React.FC<MemberTypeCardProps> = ({ icon: Icon, title, description, selected, onClick }) => {
  return (
    <div
      className={cn(
        'border-border-soft bg-fill-light text-text-main flex flex-col gap-3 rounded-[12px] border p-6 transition-all',
        selected ? 'border-text-brand bg-fill-brand-soft text-text-brand' : 'hover:bg-fill-brand-soft/30 cursor-pointer',
      )}
      onClick={onClick}>
      <Icon className={cn('mx-auto size-8', selected ? 'text-text-brand' : 'text-text-main')} />
      <div className='flex flex-col items-center gap-1 text-center'>
        <p className='body-14'>{title}</p>
        <span className='caption-12'>{description}</span>
      </div>
    </div>
  );
};
