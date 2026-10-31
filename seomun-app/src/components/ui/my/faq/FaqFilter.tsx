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
    <div className='flex flex-wrap gap-4'>
      <Input
        placeholder={t('placeholder.enter_search_term')}
        suffix={<Search className='text-text-secondary h-5 w-5' />}
        containerClassName='md:max-w-80 flex-1'
        value={filter.search || ''}
        onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
      />
    </div>
  );
};
