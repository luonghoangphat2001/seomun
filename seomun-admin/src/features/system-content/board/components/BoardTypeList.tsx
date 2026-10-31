import { AppButton } from '@/components/shared/app-button';
import { cn } from '@/utils/cn';

import type { BoardType } from '../enum';

export type BoardTypeListItem = {
  boardType: BoardType;
  label: string;
  noticeEnabled: boolean;
};

export type BoardTypeListSection = {
  label: string;
  items: BoardTypeListItem[];
};

type BoardTypeListProps = {
  sections: BoardTypeListSection[];
  activeType?: BoardType;
  onSelect: (boardType: BoardType) => void;
};

export function BoardTypeList({ sections, activeType, onSelect }: BoardTypeListProps) {
  return (
    <div className='bg-card scrollbar-slim min-h-0 overflow-y-auto rounded-xl border p-3'>
      <div className='space-y-4'>
        {sections.map((section) => (
          <div key={section.label} className='space-y-1'>
            <p className='text-muted-foreground px-3 text-xs font-medium tracking-wide'>{section.label}</p>

            <div className='space-y-1'>
              {section.items.map((item) => (
                <AppButton
                  key={item.boardType}
                  type='button'
                  variant='ghost'
                  className={cn(
                    'h-auto w-full cursor-pointer justify-start gap-2 px-3 py-2 text-left',
                    activeType === item.boardType && 'bg-muted font-semibold',
                  )}
                  onClick={() => onSelect(item.boardType)}
                >
                  <span
                    className={cn('size-1.5 shrink-0 rounded-full', item.noticeEnabled ? 'bg-green-500' : 'bg-muted-foreground/30')}
                    aria-hidden='true'
                  />
                  <span className='flex-1 truncate pl-1'>{item.label}</span>
                </AppButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
