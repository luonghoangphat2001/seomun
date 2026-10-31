'use client';

import { FaqListREQ } from '@/apis/faq/faq.request';
import { FaqRESP } from '@/apis/faq/faq.response';
import { Collapse } from '@/components/common';
import Loading from '@/components/common/loading';
import { FaqCategory } from '@/enums/faq';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type FaqListProps = {
  data: FaqRESP[];
  isLoading: boolean;
  filter: FaqListREQ;
  handleFilterChange: (filter: FaqListREQ) => void;
  dataCount?: Record<FaqCategory, number>;
};

export const FaqList = ({ data, isLoading, filter, handleFilterChange, dataCount }: FaqListProps) => {
  const t = useTranslations('faq');
  const tCommon = useTranslations('common');

  const categoryTabs = useMemo(() => {
    return [{ value: undefined, label: 'all' }, ...Object.values(FaqCategory).map((value) => ({ value, label: value }))];
  }, []);

  const badgeClass = 'title-16 md:title-18 flex size-8 shrink-0 items-center justify-center rounded-full md:size-12';

  const collapseItems = data.map((item) => ({
    key: item.id,
    label: (
      <div className='flex flex-col gap-1.5 md:flex-row md:items-center md:gap-6'>
        <div className={cn(badgeClass, 'bg-background-gray text-white')}>Q</div>
        <div className='flex items-center gap-1 md:gap-3'>
          <span className='title-16 md:title-18'>[{t(`${item.category}`)}]</span>
          <span className='body-16 md:body-18'>{item.question}</span>
        </div>
      </div>
    ),
    children: (
      <div className='flex flex-col gap-1.5 md:flex-row md:gap-6'>
        <div className={cn(badgeClass, 'bg-[#11C730] text-white')}>A</div>
        <div className='body-14 md:body-18 md:pt-2 md:pr-14'>{item.answer}</div>
      </div>
    ),
  }));

  return (
    <div className='flex flex-col overflow-hidden'>
      <div className='grid grid-cols-1'>
        <div className='scrollbar-hide border-border-soft flex overflow-x-auto border-b bg-white'>
          {categoryTabs.map((cat, index) => {
            const isActive = filter.category === cat.value;
            return (
              <button
                key={index}
                onClick={() => handleFilterChange({ category: cat.value })}
                className={cn(
                  'body-14 md:body-16 relative flex flex-1 items-center justify-center px-3 py-4 whitespace-nowrap transition-all',
                  isActive ? 'bg-primary-50 text-text-brand title-14 md:title-16' : 'hover:text-text-secondary hover:bg-gray-50',
                )}>
                {cat.value ? t(cat.label) : tCommon('entire')} {cat.value && dataCount ? `(${dataCount[cat.value]})` : ''}
                {isActive && <div className='bg-text-brand absolute bottom-0 left-0 h-0.5 w-full' />}
              </button>
            );
          })}
        </div>
      </div>
      {isLoading && <Loading displayText />}
      <div className={cn('border-border-soft flex flex-col border-b bg-white', isLoading && 'border-none')}>
        {!isLoading && collapseItems.length === 0 ? (
          <div className='text-text-third flex justify-center py-10'>{tCommon('no_result')}</div>
        ) : (
          <Collapse
            accordion
            items={collapseItems}
            className='gap-0 border-none'
            itemClassName='border-gray-200 last:border-none'
            headerClassName='px-4 py-4 hover:bg-gray-50 transition-colors'
            contentClassName='px-4 py-4 md:py-6 bg-fill-light'
            iconClassname='hidden md:block size-8'
          />
        )}
      </div>
    </div>
  );
};
