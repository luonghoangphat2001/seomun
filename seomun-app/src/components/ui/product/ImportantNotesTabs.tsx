import { IMPORTANT_NOTES_TABS } from '@/constants/product';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface ImportantNotesTabsProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const ImportantNotesTabs = ({ activeTab, onTabChange, className }: ImportantNotesTabsProps) => {
  const t = useTranslations('product');

  return (
    <div className={cn('', className)}>
      <div className='scrollbar-hide flex w-full items-center overflow-x-auto min-[520px]:grid min-[520px]:grid-cols-5'>
        {IMPORTANT_NOTES_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'body-14 sm:body-16 min-w-[90px] flex-shrink-0 cursor-pointer overflow-hidden border-b px-3 py-4 text-center whitespace-nowrap transition-colors sm:w-full',
                isActive
                  ? 'text-text-brand border-text-brand title-14 sm:title-16'
                  : 'text-text-main hover:text-primary border-border-soft',
              )}>
              {t(tab.label)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
