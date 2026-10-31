'use client';

import { OrderHistoryListREQ } from '@/apis/my/order/order.request';
import { useOrderHistoryExportExcelMutation, useOrderHistoryListQuery } from '@/apis/my/order/order.query';
import { ExportExcelApi } from '@/apis/my/export-excel/export-excel.api';
import { getDateRangeByOrderPeriod, getInitFilterOrderHistory, getOrderActionFilter } from '@/apis/my/order/order.service';
import { useTranslations } from 'next-intl';
import OrderFilter from '../components/OrderFilter';
import OrderFilterModal from '../components/OrderFilterModal';
import OrderTable from '../components/OrderTable';
import PageTitle from '../components/PageTitle';
import { Button } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { PeriodFilter } from '@/enums/common';
import { useDebounce } from '@/hooks';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { Download } from '@/icons';
import { formatDate, handleFileDownload } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import toast from 'react-hot-toast';

type OrderHistoryFilter = OrderHistoryListREQ & {
  dateRange?: DateRange;
};

const MyOrderComponent = () => {
  const tSidebar = useTranslations('sidebar.items');
  const t = useTranslations();
  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<OrderHistoryFilter>({
    getInitialFilter: (params) => {
      const initialFilter = getInitFilterOrderHistory(params);
      const defaultDateRange = getDateRangeByOrderPeriod(PeriodFilter.SIX_MONTHS);
      const dateRange =
        initialFilter.date_from || initialFilter.date_to
          ? {
              from: initialFilter.date_from ? new Date(initialFilter.date_from) : undefined,
              to: initialFilter.date_to ? new Date(initialFilter.date_to) : undefined,
            }
          : defaultDateRange;

      return {
        ...initialFilter,
        date_from: initialFilter.date_from || (dateRange?.from ? formatDate(dateRange.from, DATE_FORMAT.DEFAULT) : undefined),
        date_to: initialFilter.date_to || (dateRange?.to ? formatDate(dateRange.to, DATE_FORMAT.DEFAULT) : undefined),
        dateRange,
      };
    },
  });
  const [actionTab, setActionTab] = useState<string>(() => getOrderActionFilter(filter.filter_label));
  const [periodTab, setPeriodTab] = useState<string>(PeriodFilter.SIX_MONTHS);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const requestFilter = useMemo(() => {
    const { dateRange: _, ...rest } = filter;

    return rest;
  }, [filter]);
  const debouncedFilter = useDebounce(requestFilter, 300);
  const { data: orderHistoryData, isLoading } = useOrderHistoryListQuery(debouncedFilter);
  const { mutateAsync: exportExcel } = useOrderHistoryExportExcelMutation();
  const excelFileName = `주문배송조회_${formatDate(new Date(), DATE_FORMAT.DATE_WITH_DOT)}.xlsx`;

  const downloadExportedFile = async (historyId: number) => {
    const maxAttempts = 20;
    const intervalMs = 1500;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const progressResponse = await ExportExcelApi.checkProgressStatus({ history: historyId });
      const history = progressResponse.data.history;

      if (history.status === 'failed') {
        throw new Error('Order history Excel export failed');
      }

      if (history.status === 'completed' && history.file_path) {
        await handleFileDownload(history.file_path, excelFileName);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Order history Excel export timed out');
  };

  const handleDownloadExcel = async () => {
    setIsDownloadingExcel(true);

    try {
      const response = await exportExcel(requestFilter);
      const { history } = response;

      if (history.status === 'completed' && history.file_path) {
        await handleFileDownload(history.file_path, excelFileName);
        return;
      }

      await downloadExportedFile(history.id);
    } catch (error) {
      console.error('Failed to download order history Excel file:', error);
      toast.error(t('common.fail_create'));
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  return (
    <div className='space-y-4 md:space-y-6'>
      <PageTitle title={tSidebar('order_tracking')} />
      <OrderFilter
        actionTab={actionTab}
        setActionTab={setActionTab}
        periodTab={periodTab}
        setPeriodTab={setPeriodTab}
        filter={filter}
        handleFilterChange={handleFilterChange}
        onDownloadExcel={handleDownloadExcel}
        isDownloadingExcel={isDownloadingExcel}
      />
      <div className='flex justify-between md:hidden'>
        <OrderFilterModal
          actionTab={actionTab}
          periodTab={periodTab}
          filter={filter}
          onApply={(nextActionTab, nextPeriodTab, nextFilter) => {
            setActionTab(nextActionTab);
            setPeriodTab(nextPeriodTab);
            handleFilterChange(nextFilter);
          }}
        />
        <Button rightIcon={<Download />} size='sm' onClick={handleDownloadExcel} loading={isDownloadingExcel}>
          {t('common.excel_download')}
        </Button>
      </div>
      <OrderTable
        orders={orderHistoryData?.list ?? []}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
        totalPage={orderHistoryData?.pagination.total_page || 1}
        totalRecord={orderHistoryData?.pagination.total_item || 0}
      />
    </div>
  );
};

export default MyOrderComponent;
