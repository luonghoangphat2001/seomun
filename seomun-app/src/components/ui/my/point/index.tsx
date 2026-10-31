'use client';

import { usePointSummaryQuery, usePointTransactionsQuery } from '@/apis/points/points.query';
import { PointTransactionCategory } from '@/apis/points/points.request';
import { PointTransactionRESP } from '@/apis/points/points.response';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { DEPOSIT_STATUS_PERIOD_TABS } from '@/constants/deposit-status';
import { DepositStatusPeriod } from '@/enums/deposit-status';
import { formatDate } from '@/lib/utils';
import { getDateRangeByTab } from '@/lib/utils/format';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import PageTitle from '../components/PageTitle';
import PointFilter from './PointFilter';
import PointFilterModal from './PointFilterModal';
import PointHistoryListCard from './PointHistoryListCard';
import PointHistoryListTable from './PointHistoryListTable';
import PointInfo from './PointInfo';
import { PointHistory } from '@/types/point';

const MyPoint = () => {
  const t = useTranslations();
  const [tab, setTab] = useState<string>(DepositStatusPeriod.SIX_MONTHS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState<PointTransactionCategory | 'all'>('all');
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);

  const periodTabs = useMemo(() => DEPOSIT_STATUS_PERIOD_TABS.map((option) => ({ ...option, label: t(option.label) })), [t]);
  const handleTabChange = (value: string) => {
    setTab(value);
    setDateRange(getDateRangeByTab(value));
    setPage(PAGINATION.DEFAULT_PAGE);
  };

  const transactionParams = useMemo(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    () => ({
      page,
      per_page: pageSize,
      category: category === 'all' ? undefined : category,
      start_date: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
      end_date: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
      search: searchValue.trim() || undefined,
    }),
    [category, dateRange?.from, dateRange?.to, page, pageSize, searchValue],
  );

  const { data: transactionsResp, isFetching: isTransactionsFetching } = usePointTransactionsQuery(transactionParams);
  const { data: summaryResp } = usePointSummaryQuery();

  const pointHistoryData: PointHistory[] = useMemo(
    () =>
      (transactionsResp?.transactions ?? []).map((item: PointTransactionRESP): PointHistory => ({
        id: item.id,
        date: formatDate(item.created_at, DATE_FORMAT.DATE_WITH_DOT),
        type: item.type_label,
        earned: item.type === 'earn' ? item.amount : 0,
        used: item.type === 'use' ? item.amount : 0,
        balance: item.balance_after,
        expired: item.type === 'expire' ? item.amount : 0,
        expireDate: formatDate(item.created_at, DATE_FORMAT.DATE_WITH_DOT),
        earnOrderNo: item.order_number || '-',
        useOrderNo: item.order_number || '-',
      })),
    [transactionsResp?.transactions],
  );

  return (
    <main className='space-y-4 md:space-y-6'>
      <PageTitle title={t('sidebar.items.point')} />
      <PointInfo />
      <PointFilter
        periodTabs={periodTabs}
        tab={tab}
        setTab={handleTabChange}
        category={category}
        setCategory={(value) => {
          setCategory(value);
          setPage(PAGINATION.DEFAULT_PAGE);
        }}
        dateRange={dateRange}
        setDateRange={setDateRange}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <PageTitle
        containerClassName='pt-2 md:hidden'
        title={t('my.point_usage_history')}
        titleClassName='title-16!'
        extra={
          <PointFilterModal
            periodTabs={periodTabs}
            tab={tab}
            setTab={handleTabChange}
            category={category}
            setCategory={(value) => {
              setCategory(value);
              setPage(PAGINATION.DEFAULT_PAGE);
            }}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
        }
      />
      <PointHistoryListTable
        data={pointHistoryData}
        currentPage={transactionsResp?.pagination?.current_page ?? page}
        totalPage={transactionsResp?.pagination?.last_page ?? 1}
        totalRecords={transactionsResp?.pagination?.total ?? pointHistoryData.length}
        pageSize={transactionsResp?.pagination?.per_page ?? pageSize}
        isLoading={isTransactionsFetching}
        summaryResp={summaryResp}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(PAGINATION.DEFAULT_PAGE);
        }}
      />
      <PointHistoryListCard data={pointHistoryData} />
    </main>
  );
};

export default MyPoint;
