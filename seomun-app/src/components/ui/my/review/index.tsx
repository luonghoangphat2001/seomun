'use client';

import { useReviewListQuery, useReviewUnreviewedListQuery } from '@/apis/my/review/review.query';
import { DEPOSIT_STATUS_PERIOD_TABS } from '@/constants/deposit-status';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { DepositStatusPeriod } from '@/enums/deposit-status';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { ModalHandle } from '@/components/common';
import PageTitle from '../components/PageTitle';
import ReviewFilter from './ReviewFilter';
import ReviewTabs from './ReviewTabs';
import OrderTableList from './OrderTableList';
import ReviewList, { MyReviewListItem } from './ReviewList';
import ReviewCaution from './ReviewCaution';
import OrderCardList from './OrderCardList';
import ReviewFilterModal from './ReviewFilterModal';
import { MY_REVIEW_TAB } from '@/enums/review';
import { ReviewModal } from '../order/detail/review-modal/ReviewModal';
import { ReviewUnreviewedOrderItemRESP } from '@/apis/my/review/review.response';

const getDateRangeByTab = (value: string): DateRange | undefined => {
  const today = new Date();

  switch (value) {
    case DepositStatusPeriod.ONE_WEEK:
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case DepositStatusPeriod.ONE_MONTH:
      return { from: startOfDay(subMonths(today, 1)), to: endOfDay(today) };
    case DepositStatusPeriod.THREE_MONTHS:
      return { from: startOfDay(subMonths(today, 3)), to: endOfDay(today) };
    case DepositStatusPeriod.SIX_MONTHS:
      return { from: startOfDay(subMonths(today, 6)), to: endOfDay(today) };
    default:
      return undefined;
  }
};

const MyReview = () => {
  const t = useTranslations();
  const reviewModalRef = useRef<ModalHandle>(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState<ReviewUnreviewedOrderItemRESP | null>(null);
  const [periodTab, setPeriodTab] = useState<string>(DepositStatusPeriod.SIX_MONTHS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getDateRangeByTab(DepositStatusPeriod.SIX_MONTHS));
  const [activeTab, setActiveTab] = useState<string>(MY_REVIEW_TAB.ORDER_LIST);
  const [reviewPage, setReviewPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [unreviewedPage, setUnreviewedPage] = useState(PAGINATION.DEFAULT_PAGE);
  const reviewPageSize = 15;
  const unreviewedPageSize = 20;

  const periodTabs = useMemo(() => DEPOSIT_STATUS_PERIOD_TABS.map((option) => ({ ...option, label: t(option.label) })), [t]);
  const reviewQueryParams = useMemo(
    () => ({
      page: reviewPage,
      per_page: reviewPageSize,
    }),
    [reviewPage],
  );
  const unreviewedQueryParams = useMemo(
    () => ({
      page: unreviewedPage,
      per_page: unreviewedPageSize,
    }),
    [unreviewedPage],
  );

  const { data: reviewResp } = useReviewListQuery(reviewQueryParams, {
    enabled: activeTab === MY_REVIEW_TAB.MY_REVIEW,
  });
  const { data: unreviewedResp } = useReviewUnreviewedListQuery(unreviewedQueryParams, {
    enabled: activeTab === MY_REVIEW_TAB.ORDER_LIST,
  });

  const reviewData = useMemo<MyReviewListItem[]>(
    () =>
      (reviewResp?.reviews ?? []).map((item) => ({
        id: item.id,
        name: item.user?.name || item.user?.email || '-',
        date: formatDate(item.created_at, DATE_FORMAT.DATE_WITH_DOT),
        rating: item.rating,
        content: item.content,
        images: item.images,
        tags: item.hashtags,
      })),
    [reviewResp?.reviews],
  );

  const unreviewedData = unreviewedResp?.order_items ?? [];

  const totalReviews = reviewResp?.pagination?.total_item ?? reviewData.length;
  const currentReviewPage = reviewResp?.pagination?.current_page ?? reviewPage;
  const totalReviewPage = reviewResp?.pagination?.total_page ?? 1;
  const totalOrders = unreviewedResp?.pagination?.total ?? unreviewedData.length;
  const currentOrderPage = unreviewedResp?.pagination?.current_page ?? unreviewedPage;
  const totalOrderPage = unreviewedResp?.pagination?.last_page ?? 1;

  const openReviewModal = (item?: ReviewUnreviewedOrderItemRESP) => {
    setSelectedReviewItem(item ?? null);
    reviewModalRef.current?.open();
  };

  return (
    <main className='space-y-4 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.write_review')}
        extra={
          <ReviewFilterModal
            periodTabs={periodTabs}
            tab={periodTab}
            setTab={setPeriodTab}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        }
      />
      <ReviewFilter
        periodTabs={periodTabs}
        tab={periodTab}
        setTab={setPeriodTab}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      {/* <div className='relative h-66 w-full overflow-hidden rounded-2xl'>
        <Image src='/images/checker-background.png' alt='board' fill className='object-cover' sizes='100vw' />
      </div> */}
      <ReviewTabs activeTab={activeTab} onTabChange={setActiveTab} totalOrders={totalOrders} totalReviews={totalReviews} />

      {activeTab === MY_REVIEW_TAB.ORDER_LIST && (
        <>
          <OrderTableList
            data={unreviewedData}
            currentPage={currentOrderPage}
            totalPage={totalOrderPage}
            totalRecords={totalOrders}
            pageSize={unreviewedPageSize}
            onPageChange={setUnreviewedPage}
            onWriteReview={openReviewModal}
          />
          <OrderCardList
            data={unreviewedData}
            currentPage={currentOrderPage}
            totalPage={totalOrderPage}
            onPageChange={setUnreviewedPage}
            onWriteReview={openReviewModal}
          />
          <ReviewCaution />
        </>
      )}
      {activeTab === MY_REVIEW_TAB.MY_REVIEW && (
        <ReviewList data={reviewData} currentPage={currentReviewPage} totalPage={totalReviewPage} onPageChange={setReviewPage} />
      )}
      <ReviewModal ref={reviewModalRef} detail={selectedReviewItem} />
    </main>
  );
};

export default MyReview;
