'use client';

import { FaqListREQ } from '@/apis/faq/faq.request';
import { Input, Select } from '@/components/common';
import { Search } from '@/icons';
import { useTranslations } from 'next-intl';

type FaqFilterProps = {
  filter: FaqListREQ;
  handleFilterChange: (filter: FaqListREQ) => void;
};

export const FaqFilter = ({ filter, handleFilterChange }: FaqFilterProps) => {
  const t = useTranslations();

  return (
    <div className='flex flex-wrap gap-3'>
      {/* <Select
        placeholder={t('customer_service.view_all')}
        options={[{ value: '', label: t('common.entire') }]}
        className='w-20 md:w-32'
      /> */}
      <Input
        placeholder={t('placeholder.enter_search_term')}
        value={filter.search || ''}
        onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
        suffix={<Search className='size-5' />}
        containerClassName='md:max-w-80 flex-1'
      />
    </div>
  );
};
