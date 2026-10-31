'use client';

import { Collapse } from '@/components/common';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { FaqFilter } from './FaqFilter';
import { useFaqCountQuery, useFaqListQuery } from '@/apis/faq/faq.query';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { FaqListREQ } from '@/apis/faq/faq.request';
import { getInitFilterFaq } from '@/apis/faq/faq.service';
import { FaqCategory } from '@/enums/faq';
import Loading from '@/components/common/loading';

export const FaqList = () => {
  const t = useTranslations();
  const categoryTabs = useMemo(() => {
    return [{ value: undefined, label: 'all' }, ...Object.values(FaqCategory).map((value) => ({ value, label: value }))];
  }, []);
  const badgeClass = 'title-16 md:title-18 flex size-8 shrink-0 items-center justify-center rounded-full text-white md:size-12';

  // filter
  const { filter, debouncedFilter, handleFilterChange } = useFilterPaging<FaqListREQ>({
    getInitialFilter: getInitFilterFaq,
  });

  //api list
  const { data: dataFaq, isLoading } = useFaqListQuery(debouncedFilter);

  //api count
  const { data: dataCount } = useFaqCountQuery({ search: debouncedFilter.search });

  const collapseItems = useMemo(() => {
    if (!dataFaq) return [];

    return dataFaq.map((item) => ({
      key: item.id,
      label: (
        <div className='flex flex-col gap-1.5 md:flex-row md:items-center md:gap-6'>
          <div className={cn(badgeClass, 'bg-background-gray text-white')}>Q</div>
          <div className='flex items-center gap-1 md:gap-3'>
            <span className='title-16 md:title-18'>[{t(`faq.${item.category}`)}]</span>
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
  }, [dataFaq, t]);

  return (
    <section className='md: mt-4 flex w-full max-w-[1156px] flex-col gap-4 md:gap-6'>
      <div className='hidden h-8 items-center justify-between md:flex'>
        <h1 className='title-24 text-text-main'>{t('customer_service.faq')}</h1>
      </div>

      <FaqFilter filter={filter} handleFilterChange={handleFilterChange} />

      <div className='flex flex-col overflow-hidden'>
        <div className='grid grid-cols-1'>
          <div className='scrollbar-hide border-border-soft flex overflow-x-auto border-b bg-white'>
            {categoryTabs.map((tab, index) => {
              const isActive = filter.category === tab.value;
              return (
                <button
                  key={index}
                  type='button'
                  onClick={() => handleFilterChange({ category: tab.value })}
                  className={cn(
                    'body-14 md:body-16 relative flex flex-1 cursor-pointer items-center justify-center px-3 py-4 whitespace-nowrap transition-all',
                    isActive
                      ? 'bg-primary-50 text-text-brand title-14 md:title-16'
                      : 'hover:text-text-secondary hover:bg-gray-50',
                  )}>
                  {tab.value ? t(`faq.${tab.label}`) : t('common.entire')}{' '}
                  {tab.value && dataCount ? `(${dataCount[tab.value]})` : ''}
                  {isActive && <div className='bg-text-brand absolute bottom-0 left-0 h-0.5 w-full' />}
                </button>
              );
            })}
          </div>
        </div>
        {isLoading && <Loading displayText />}
        <div className={cn('border-border-soft flex flex-col border-b bg-white', isLoading && 'border-none')}>
          {!isLoading && collapseItems.length === 0 ? (
            <div className='text-text-third flex justify-center py-10'>{t('common.no_result')}</div>
          ) : (
            <Collapse
              accordion
              // key={activeTab}
              items={collapseItems}
              defaultActiveKey={collapseItems[0]?.key}
              className='gap-0 border-none'
              itemClassName='border-gray-200 last:border-none'
              headerClassName='px-4 py-6 hover:bg-gray-50 transition-colors'
              contentClassName='px-4 py-4 md:py-6 bg-fill-light'
              iconClassname='hidden md:block size-8'
            />
          )}
        </div>
      </div>
    </section>
  );
};
