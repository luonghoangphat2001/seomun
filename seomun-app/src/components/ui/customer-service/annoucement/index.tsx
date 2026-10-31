'use client';

import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { AnnouncementFilter } from './AnnouncementFilter';
import { AnnouncementList } from './AnnouncementList';
import { AnnouncementTable } from './AnnouncementTable';
import { useNoticeListQuery } from '@/apis/notice/notice.query';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { NoticeListREQ } from '@/apis/notice/notice.request';
import { getInitFilterNotice } from '@/apis/notice/notice.service';

export const Announcement = () => {
  const t = useTranslations('customer_service');
  const router = useRouter();

  // filter
  const { filter, debouncedFilter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<NoticeListREQ>({
    getInitialFilter: getInitFilterNotice,
  });

  //api list
  const { data: dataNotice, isLoading } = useNoticeListQuery(debouncedFilter);

  const toDetail = (id: number) => {
    router.push(ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT_DETAIL(id));
  };

  return (
    <section className='flex w-full flex-col gap-4 md:mt-4 md:gap-6'>
      <div className='hidden items-center justify-between md:flex'>
        <h1 className='title-24'>{t('announcement')}</h1>
      </div>
      <div className='flex flex-col gap-4'>
        <AnnouncementFilter filter={filter} handleFilterChange={handleFilterChange} />

        <AnnouncementTable
          data={dataNotice?.list || []}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          totalPage={dataNotice?.pagination.total_page || 1}
          totalItems={dataNotice?.pagination.total_item || 0}
          toDetail={toDetail}
        />

        <AnnouncementList filter={debouncedFilter} toDetail={toDetail} />
      </div>
    </section>
  );
};
