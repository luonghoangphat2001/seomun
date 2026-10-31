import { AppButton } from '@/components/shared/app-button';
import { cn } from '@/utils/cn';

type ShoppingGuideSectionListProps = {
  sections: Array<{ id: number; label: string }>;
  activeId: number | null;
  onSelect: (id: number) => void;
};

export function ShoppingGuideSectionList({ sections, activeId, onSelect }: ShoppingGuideSectionListProps) {
  return (
    <div className='space-y-2'>
      {sections.map((item) => (
        <AppButton
          key={item.id}
          type='button'
          variant='ghost'
          className={cn('h-auto w-full cursor-pointer justify-start px-3 py-2 text-left', activeId === item.id && 'bg-muted font-semibold')}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </AppButton>
      ))}
    </div>
  );
}
