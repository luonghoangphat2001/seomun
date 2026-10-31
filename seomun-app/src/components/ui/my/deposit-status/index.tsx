'use client';

import { useTranslations } from 'next-intl';
import PageTitle from '../components/PageTitle';
import DepositStatusFilterModal from './DepositStatusFilterModal';
import DepositStatusListTable from './DepositStatusListTable';
import DepositStatusFilter from './DepositStatusFilter';
import { DEPOSIT_STATUS_PERIOD_TABS } from '@/constants/deposit-status';
import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DepositStatusPeriod } from '@/enums/deposit-status';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { formatDate } from '@/lib/utils';
import { useDepositStatusExportExcelMutation, useDepositStatusListQuery } from '@/apis/my/deposit-status/deposit-status.query';
import { DepositStatusExportExcelREQ } from '@/apis/my/deposit-status/deposit-status.request';
import { ExportExcelApi } from '@/apis/my/export-excel/export-excel.api';
import toast from 'react-hot-toast';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { DepositStatus } from '@/types/deposit-status';
import { handleFileDownload } from '@/lib/utils/file';
import { AxiosError } from 'axios';
import { ErrorRESP } from '@/types';

const DEPOSIT_STATUS_MONTHS_MAP: Record<string, 1 | 3 | 6> = {
  [DepositStatusPeriod.ONE_WEEK]: 1,
  [DepositStatusPeriod.ONE_MONTH]: 1,
  [DepositStatusPeriod.THREE_MONTHS]: 3,
  [DepositStatusPeriod.SIX_MONTHS]: 6,
};

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

const MyDepositStatus = () => {
  const t = useTranslations();
  const [tab, setTab] = useState<string>(DepositStatusPeriod.SIX_MONTHS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getDateRangeByTab(DepositStatusPeriod.SIX_MONTHS));
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const { mutateAsync: exportExcel } = useDepositStatusExportExcelMutation();

  const periodTabs = useMemo(() => DEPOSIT_STATUS_PERIOD_TABS.map((option) => ({ ...option, label: t(option.label) })), [t]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const downloadExportedFile = async (history: number) => {
    const maxAttempts = 20;
    const intervalMs = 1500;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const progressResp = await ExportExcelApi.checkProgressStatus({ history });
      const exportHistory = progressResp.data.history;

      if (exportHistory.status === 'failed') {
        throw new Error(progressResp.message || 'Export excel failed');
      }

      if (exportHistory.status === 'completed' && exportHistory.file_path) {
        const fileName = `입금현황_${formatDate(new Date(), DATE_FORMAT.DATE_WITH_DOT)}.xlsx`;
        await handleFileDownload(exportHistory.file_path, fileName);
        return;
      }

      await delay(intervalMs);
    }

    throw new Error('Export excel download timed out');
  };

  const queryParams = useMemo(
    () => ({
      page,
      per_page: pageSize,
      ...(dateRange?.from || dateRange?.to
        ? {
            start_date: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
            end_date: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
          }
        : {
            months: DEPOSIT_STATUS_MONTHS_MAP[tab],
          }),
    }),
    [dateRange, page, pageSize, tab],
  );

  const { data: depositStatusResp, isFetching } = useDepositStatusListQuery(queryParams);

  const buildExportBody = (): DepositStatusExportExcelREQ => {
    const from = dateRange?.from;
    const to = dateRange?.to;

    const baseBody: DepositStatusExportExcelREQ = {
      months: DEPOSIT_STATUS_MONTHS_MAP[tab],
    };

    if (from || to) {
      return {
        ...baseBody,
        start_date: from ? formatDate(from, DATE_FORMAT.DEFAULT) : undefined,
        end_date: to ? formatDate(to, DATE_FORMAT.DEFAULT) : undefined,
      };
    }

    return {
      ...baseBody,
    };
  };

  const handleDownloadExcel = async () => {
    if (isDownloadingExcel) return;

    setIsDownloadingExcel(true);

    try {
      const resp = await exportExcel(buildExportBody());
      await downloadExportedFile(resp.history.id);
      toast.success(t('common.success'));
    } catch (error) {
      console.error('Failed to export deposit status Excel request:', error);
      const apiError = error as AxiosError<ErrorRESP>;
      const message =
        apiError.response?.data.message ?? apiError.response?.data.errors ?? apiError.message ?? t('common.fail_create');
      toast.error(message);
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleTabChange = (value: string) => {
    setTab(value);
    setDateRange(getDateRangeByTab(value));
    setPage(PAGINATION.DEFAULT_PAGE);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(PAGINATION.DEFAULT_PAGE);
  };

  const depositStatusData: DepositStatus[] = useMemo(
    () =>
      (depositStatusResp?.data.items ?? []).map((item) => ({
        id: item.id,
        method: item.payment_method,
        date: formatDate(item.paid_at, DATE_FORMAT.DATE_WITH_DOT),
        amount: Number(item.amount),
        depositor: item.depositor,
        order_number: item.order_number,
      })),
    [depositStatusResp?.data.items],
  );

  const currentPage = depositStatusResp?.pagination?.current_page ?? 1;
  const displayPageSize = depositStatusResp?.pagination?.per_page ?? pageSize;
  const totalPage = depositStatusResp?.pagination?.total_page ?? depositStatusResp?.pagination?.last_page ?? 1;
  const totalRecords = depositStatusResp?.pagination?.total_item ?? 0;

  return (
    <main className='space-y-6'>
      <PageTitle
        title={t('sidebar.items.deposit_status')}
        extra={
          <DepositStatusFilterModal
            periodTabs={periodTabs}
            tab={tab}
            setTab={handleTabChange}
            dateRange={dateRange}
            setDateRange={handleDateRangeChange}
            onDownloadExcel={handleDownloadExcel}
            isDownloadingExcel={isDownloadingExcel}
          />
        }
      />
      <DepositStatusFilter
        periodTabs={periodTabs}
        tab={tab}
        setTab={handleTabChange}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        onDownloadExcel={handleDownloadExcel}
        isDownloadingExcel={isDownloadingExcel}
      />
      <DepositStatusListTable
        data={depositStatusData}
        currentPage={currentPage}
        totalPage={totalPage}
        totalRecords={totalRecords}
        pageSize={displayPageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(PAGINATION.DEFAULT_PAGE);
        }}
        isLoading={isFetching}
      />
    </main>
  );
};

export default MyDepositStatus;
