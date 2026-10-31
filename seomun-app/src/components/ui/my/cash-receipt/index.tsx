'use client';

import { useCashReceiptExportExcelMutation, useCashReceiptListQuery } from '@/apis/my/cash-receipt/cash-receipt.query';
import { ExportExcelApi } from '@/apis/my/export-excel/export-excel.api';
import { CASH_RECEIPT_PERIOD_TABS } from '@/constants/cash-receipt';
import { CashReceiptPeriod } from '@/enums/cash-receipt';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { formatDate, handleFileDownload } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { endOfDay, startOfDay, subMonths, subYears } from 'date-fns';
import toast from 'react-hot-toast';
import PageTitle from '../components/PageTitle';
import CashReceiptFilter from './CashReceiptFilter';
import CashReceiptFilterModal from './CashReceiptFilterModal';
import CashReceiptListCard from './CashReceiptListCard';
import CashReceiptListTable from './CashReceiptListTable';
import { CashReceipt } from '@/types/cash-receipt';

const getDateRangeByTab = (value: string): DateRange | undefined => {
  const today = new Date();

  switch (value) {
    case CashReceiptPeriod.SIX_MONTHS:
      return { from: startOfDay(subMonths(today, 6)), to: endOfDay(today) };
    case CashReceiptPeriod.ONE_YEAR:
      return { from: startOfDay(subYears(today, 1)), to: endOfDay(today) };
    case CashReceiptPeriod.TWO_YEARS:
      return { from: startOfDay(subYears(today, 2)), to: endOfDay(today) };
    case CashReceiptPeriod.THREE_YEARS:
      return { from: startOfDay(subYears(today, 3)), to: endOfDay(today) };
    default:
      return undefined;
  }
};

const MyCashReceipt = () => {
  const t = useTranslations();
  const [tab, setTab] = useState<string>(CashReceiptPeriod.SIX_MONTHS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getDateRangeByTab(CashReceiptPeriod.SIX_MONTHS));
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(15);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const periodTabs = useMemo(() => CASH_RECEIPT_PERIOD_TABS.map((option) => ({ ...option, label: t(option.label) })), [t]);

  const queryParams = useMemo(
    () => ({
      page,
      per_page: pageSize,
      start_date: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
      end_date: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
    }),
    [dateRange, page, pageSize],
  );

  const { data: cashReceiptResp, isFetching } = useCashReceiptListQuery(queryParams);
  const { mutateAsync: exportExcel } = useCashReceiptExportExcelMutation();

  const cashReceiptData = useMemo<CashReceipt[]>(
    () =>
      (cashReceiptResp?.items ?? []).map((item, index) => ({
        id: (page - 1) * pageSize + index + 1,
        issueDate: formatDate(item.issued_at, DATE_FORMAT.DATE_WITH_DOT),
        approvalNumber: item.document_number,
        orderAmount: Number(item.order_amount),
        shippingFee: Number(item.shipping_fee),
        discountAmount: 0,
        totalAmount: Number(item.total_amount),
        supplyPrice: Number(item.supply_amount),
        vat: Number(item.tax_amount),
      })),
    [cashReceiptResp?.items, page, pageSize],
  );

  const totalPage = cashReceiptResp?.pagination?.total_page ?? 1;
  const totalRecords = cashReceiptResp?.pagination?.total_item ?? cashReceiptData.length;
  const excelFileName = `현금영수증-${formatDate(new Date(), DATE_FORMAT.DATE_WITH_DOT)}.xlsx`;

  const downloadExportedFile = async (historyId: number) => {
    const maxAttempts = 20;
    const intervalMs = 1500;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const progressResponse = await ExportExcelApi.checkProgressStatus({ history: historyId });
      const history = progressResponse.data.history;

      if (history.status === 'failed') {
        throw new Error('Cash receipt Excel export failed');
      }

      if (history.status === 'completed' && history.file_path) {
        await handleFileDownload(history.file_path, excelFileName);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Cash receipt Excel export timed out');
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

  const handleDownloadExcel = async () => {
    if (isDownloadingExcel) return;

    setIsDownloadingExcel(true);

    try {
      const response = await exportExcel({
        start_date: dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
        end_date: dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
      });

      const { history } = response;

      if (history.status === 'completed' && history.file_path) {
        await handleFileDownload(history.file_path, excelFileName);
      } else {
        await downloadExportedFile(history.id);
      }

      toast.success(t('common.success'));
    } catch (error) {
      console.error('Failed to download cash receipt Excel file:', error);
      toast.error(t('common.fail_create'));
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  return (
    <main className='space-y-2 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.cash_receipt')}
        extra={
          <CashReceiptFilterModal
            periodTabs={periodTabs}
            tab={tab}
            setTab={handleTabChange}
            dateRange={dateRange}
            setDateRange={handleDateRangeChange}
          />
        }
      />
      <CashReceiptFilter
        periodTabs={periodTabs}
        tab={tab}
        setTab={handleTabChange}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        onDownloadExcel={handleDownloadExcel}
        isDownloadingExcel={isDownloadingExcel}
      />
      <CashReceiptListTable
        data={cashReceiptData}
        currentPage={cashReceiptResp?.pagination?.current_page ?? page}
        totalPage={totalPage}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(PAGINATION.DEFAULT_PAGE);
        }}
        isLoading={isFetching}
      />
      <CashReceiptListCard data={cashReceiptData} />
    </main>
  );
};

export default MyCashReceipt;
