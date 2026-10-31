'use client';

import { AnnouncementFilter } from '@/components/ui/customer-service/annoucement/AnnouncementFilter';
import { AnnouncementList } from '@/components/ui/customer-service/annoucement/AnnouncementList';
import { AnnouncementTable } from '@/components/ui/customer-service/annoucement/AnnouncementTable';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import CustomerServiceSideBar from '../../sidebar/CustomerServiceSideBar';
import { getInitFilterNotice } from '@/apis/notice/notice.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { NoticeListREQ } from '@/apis/notice/notice.request';
import { useNoticeListQuery } from '@/apis/notice/notice.query';

export const MyNotice = () => {
  const t = useTranslations('customer_service');
  const tSidebar = useTranslations('sidebar.items');
  const router = useRouter();

  // filter
  const { filter, debouncedFilter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<NoticeListREQ>({
    getInitialFilter: getInitFilterNotice,
  });

  //api list
  const { data: dataNotice, isLoading } = useNoticeListQuery(debouncedFilter, true);

  const toDetail = (id: number) => {
    router.push(ROUTES.MY_PAGE.NOTICE_DETAIL(id));
  };

  return (
    <section className='-mt-4 flex w-full flex-col gap-4 md:mt-0 md:gap-6'>
      <div className='hidden items-center justify-between md:flex'>
        <h1 className='title-24'>{tSidebar('notice')}</h1>
      </div>
      <CustomerServiceSideBar isMypage />
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

        <AnnouncementList filter={debouncedFilter} toDetail={toDetail} isMyPage />
      </div>
    </section>
  );
};
