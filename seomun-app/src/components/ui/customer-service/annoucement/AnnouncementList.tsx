import { useNoticeMobileListQuery } from '@/apis/notice/notice.query';
import { NoticeListREQ } from '@/apis/notice/notice.request';
import { NoticeRESP } from '@/apis/notice/notice.response';
import Loading from '@/components/common/loading';
import { DATE_FORMAT } from '@/constants/common';
import { Eyes2 } from '@/icons';
import { cn, formatDate } from '@/lib/utils';
import { fillNumber } from '@/lib/utils/helper';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

type AnnouncementListProps = {
  filter?: NoticeListREQ;
  toDetail: (id: number) => void;
  relatedData?: NoticeRESP[];
  isMyPage?: boolean;
};

export const AnnouncementList = ({ filter, toDetail, relatedData, isMyPage }: AnnouncementListProps) => {
  const t = useTranslations('customer_service');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  //api inifiniy list
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNoticeMobileListQuery(
    filter,
    relatedData ? false : true,
    isMyPage,
  );
  const notices = data?.pages.flatMap((page) => page.data.notices) ?? [];
  const totalItems = data?.pages[0]?.pagination?.total_item ?? notices.length;
  const dataMap = relatedData ? relatedData : notices;

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchNextPage();
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className='md:hidden'>
        <Loading />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col md:hidden', !relatedData && '-mx-4')}>
      {dataMap.map((item, index) => {
        const displayNo = fillNumber(totalItems - index);

        return (
          <button
            key={item.id}
            onClick={() => toDetail(item.id)}
            className={cn(
              'border-border-soft flex flex-col gap-2 border-b p-4 text-left transition-colors active:bg-gray-100',
              item.is_new ? 'bg-[#FDF8DB]' : 'bg-white',
            )}>
            <div className={cn('text-text-secondary flex items-center justify-between', item.is_new && 'text-text-main')}>
              <span className='body-14'>{displayNo}</span>
              <span className='body-14'>{formatDate(item.created_at, DATE_FORMAT.DATE_WITH_DOT)}</span>
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className={cn('title-14', item.is_new ? 'text-text-brand' : 'text-text-main')}>[{t(item.type)}]</span>
              <span className={cn('title-14')}>{item.title}</span>
              {item.is_new && (
                <span
                  className='title-14 ml-1.5 inline-flex shrink-0 items-center bg-clip-text text-transparent'
                  style={{ backgroundImage: 'linear-gradient(90deg, #FF3D07, #F5BF20, #F23580)' }}>
                  NEW
                </span>
              )}
            </div>
            <div className='flex items-center gap-1'>
              <Eyes2 className={cn('text-text-secondary size-4', item.is_new && 'text-text-main')} />
              <span className={cn('caption-12 text-text-secondary', item.is_new && 'text-text-main')}>
                {item.view_count.toLocaleString()}
              </span>
            </div>
          </button>
        );
      })}
      {!relatedData && hasNextPage && <div ref={loadMoreRef}>{isFetchingNextPage && <Loading />}</div>}
    </div>
  );
};
