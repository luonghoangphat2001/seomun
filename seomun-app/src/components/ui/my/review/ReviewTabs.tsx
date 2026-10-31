'use client';

import { REVIEW_TABS } from '@/constants/review';
import { MY_REVIEW_TAB } from '@/enums/review';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type ReviewTabsProps = {
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  totalOrders?: number;
  totalReviews?: number;
};

const ReviewTabs = ({ activeTab, onTabChange, className, totalOrders, totalReviews }: ReviewTabsProps) => {
  const t = useTranslations();

  return (
    <div className={cn('', className)}>
      <div className='scrollbar-hide grid w-full grid-cols-2 items-center overflow-x-auto'>
        {REVIEW_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <div
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                'body-16 min-w-[90px] flex-shrink-0 cursor-pointer overflow-hidden border-b px-3 py-4 text-center whitespace-nowrap transition-colors sm:w-full',
                isActive
                  ? 'text-text-brand border-text-brand title-16 bg-primary-50 border-b-2'
                  : 'text-text-main hover:text-primary border-border-soft',
              )}>
              {t(tab.label)}
              {tab.value === MY_REVIEW_TAB.ORDER_LIST && ` (${totalOrders || 0})`}
              {tab.value === MY_REVIEW_TAB.MY_REVIEW && ` (${totalReviews || 0})`}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewTabs;
