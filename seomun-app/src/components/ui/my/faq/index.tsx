'use client';

import { useTranslations } from 'next-intl';
import { FaqFilter } from './FaqFilter';
import { FaqList } from './FaqList';
import CustomerServiceSideBar from '../../sidebar/CustomerServiceSideBar';
import { useFaqCountQuery, useFaqListQuery } from '@/apis/faq/faq.query';
import { getInitFilterFaq } from '@/apis/faq/faq.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { FaqListREQ } from '@/apis/faq/faq.request';

const MyFaqComponent = () => {
  const tSidebar = useTranslations('sidebar.items');

  // filter
  const { filter, debouncedFilter, handleFilterChange } = useFilterPaging<FaqListREQ>({
    getInitialFilter: getInitFilterFaq,
  });

  //api list
  const { data: dataFaq, isLoading } = useFaqListQuery(debouncedFilter, true);

  //api count
  const { data: dataCount } = useFaqCountQuery({ search: debouncedFilter.search }, true);

  return (
    <div className='-mt-4 space-y-4 md:mt-0'>
      <CustomerServiceSideBar isMypage />
      <div className='space-y-4 md:space-y-6'>
        <h2 className='title-24 hidden md:block'>{tSidebar('faq')}</h2>
        <FaqFilter filter={filter} handleFilterChange={handleFilterChange} />
        <FaqList
          data={dataFaq || []}
          isLoading={isLoading}
          filter={filter}
          handleFilterChange={handleFilterChange}
          dataCount={dataCount}
        />
      </div>
    </div>
  );
};

export default MyFaqComponent;
