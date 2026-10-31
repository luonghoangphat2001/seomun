'use client';

import { cn } from '@/lib/utils';
import { DesignSourceType } from '@/enums/common';
import { useTranslations } from 'next-intl';

type EditorCategoryTabsProps = {
  sourceType: DesignSourceType | 'all';
  onChangeSourceType: (sourceType: DesignSourceType | 'all') => void;
};

const EditorCategoryTabs = ({ sourceType, onChangeSourceType }: EditorCategoryTabsProps) => {
  const t = useTranslations('common');
  const tabs = ['all', ...Object.values(DesignSourceType)] as const;

  return (
    <div className='grid grid-cols-1'>
      <div className='scrollbar-hide border-border-soft flex gap-4 overflow-x-auto border-b md:gap-0'>
        {tabs.map((tab) => {
          const isActive = sourceType === tab;
          return (
            <div
              key={tab}
              onClick={() => onChangeSourceType(tab)}
              className={cn(
                'body-16 min-w-fit cursor-pointer py-2 text-center transition-colors md:min-w-37.5 md:py-4',
                isActive ? 'text-text-brand border-text-brand title-16 border-b' : 'text-text-main hover:text-primary',
              )}>
              {t(tab)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditorCategoryTabs;
