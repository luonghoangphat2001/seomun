import { NoticeListREQ } from '@/apis/notice/notice.request';
import { Input, Tabs } from '@/components/common';
import { NoticeCategory } from '@/enums/notice';
import { Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type AnnouncementFilterProps = {
  filter: NoticeListREQ;
  handleFilterChange: (filter: NoticeListREQ) => void;
};

export const AnnouncementFilter = ({ filter, handleFilterChange }: AnnouncementFilterProps) => {
  const t = useTranslations('customer_service');
  const categoryOptions = useMemo(() => Object.values(NoticeCategory).map((value) => ({ value, label: t(value) })), [t]);

  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
      <Tabs
        options={categoryOptions}
        value={filter.type || NoticeCategory.ALL}
        onChange={(value) => handleFilterChange({ type: value })}
        className='w-full justify-start overflow-x-auto md:w-auto'
        tabClassName='shrink-0 whitespace-nowrap'
      />
      <Input
        placeholder={t('enter_search_term')}
        value={filter.search || ''}
        onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
        suffix={<Search className='size-5' />}
        containerClassName='md:max-w-80 md:flex-1'
      />
    </div>
  );
};
