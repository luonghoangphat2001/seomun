import { Download } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
// import { AppInput } from '@/components/shared/app-input'; // top-n filter hidden — see JSX below
import { AppSelect } from '@/components/shared/app-select';
import { PageContainer } from '@/components/shared/PageContainer';
import { useDebounce } from '@/hooks/use-debounce';

import {
  DashboardPeriod,
  DashboardStatisticType,
  useDashboardStatisticsQuery,
  useExportDashboardStatisticsMutation,
  type DashboardStatisticsExportHistory,
} from '../api';
import { DashboardPageHeader, ExportResultDialog, StatisticsContent, StatisticTypeTabs } from '../components';
import { getPeriodOptions } from '../constants';
import { buildCustomerOptions, useDashboardCustomerOptions } from '../utils';

const DEFAULT_PRODUCT_LIMIT = 10;

export function StatisticsManagementPage() {
  const { t } = useTranslation();

  // === State ===
  const [activeType, setActiveType] = useState<DashboardStatisticType>(DashboardStatisticType.MEMBERS);
  const [period, setPeriod] = useState<DashboardPeriod>(DashboardPeriod.THIRTY_DAYS);
  const [customerIds, setCustomerIds] = useState<string[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [limit] = useState(DEFAULT_PRODUCT_LIMIT);
  // const [limitDraft, setLimitDraft] = useState(String(DEFAULT_PRODUCT_LIMIT)); // top-n filter hidden — see JSX below
  const [exportHistory, setExportHistory] = useState<DashboardStatisticsExportHistory | null>(null);

  // === Hooks ===
  const debouncedCustomerSearchTerm = useDebounce(customerSearchTerm);
  const { customers, fetchNextPage, hasNextPage, isFetchingNextPage } = useDashboardCustomerOptions(debouncedCustomerSearchTerm);
  const periodOptions = useMemo(() => getPeriodOptions(t), [t]);
  const customerOptions = useMemo(() => buildCustomerOptions(customers, t), [customers, t]);
  const isProductsTab = activeType === DashboardStatisticType.PRODUCTS;
  const isOrdersTab = activeType === DashboardStatisticType.ORDERS;
  const isInquiriesTab = activeType === DashboardStatisticType.INQUIRIES;
  const isPaymentsTab = activeType === DashboardStatisticType.PAYMENTS;
  const showCustomerFilter = isOrdersTab || isInquiriesTab || isPaymentsTab;

  const rawParams = useMemo(
    () => ({
      type: activeType,
      period,
      customer_ids: showCustomerFilter && customerIds.length ? customerIds.map(Number) : undefined,
      limit: isProductsTab ? limit : undefined,
    }),
    [activeType, period, showCustomerFilter, customerIds, isProductsTab, limit],
  );
  // Debounced so rapid filter changes coalesce into one request.
  const params = useDebounce(rawParams);
  const { data: statistics, isError, isFetching, isLoading, isPlaceholderData, refetch } = useDashboardStatisticsQuery(params);

  const { mutateAsync: exportStatistics, isPending: isExporting } = useExportDashboardStatisticsMutation();

  // === Functions ===
  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  // const commitLimit = useCallback(() => {
  //   const parsed = Math.floor(Number(limitDraft));
  //   const next = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PRODUCT_LIMIT;
  //   setLimit(next);
  //   setLimitDraft(String(next));
  // }, [limitDraft]);

  // Exports the tab currently on screen, using the same filters the table below was fetched with.
  const handleExport = useCallback(async () => {
    try {
      setExportHistory(await exportStatistics(params));
    } catch {
      toast.error(t('page.dashboard.statistics.export_error'));
    }
  }, [exportStatistics, params, t]);

  return (
    <PageContainer className='gap-8'>
      <DashboardPageHeader
        title={t('page.dashboard.statistics.title')}
        description={t('page.dashboard.statistics.description')}
        actions={
          <AppButton
            type='button'
            size='sm'
            variant='outline'
            className='w-fit gap-2'
            onClick={() => void handleExport()}
            isLoading={isExporting}
            leftIcon={<Download className='size-4' />}
          >
            {t('common.export.button')}
          </AppButton>
        }
      >
        <div className='space-y-3'>
          <StatisticTypeTabs value={activeType} onChange={setActiveType} />
          <div className='flex w-full flex-wrap gap-3 xl:max-w-3xl'>
            <AppSelect options={periodOptions} value={period} onValueChange={(value) => value && setPeriod(value)} size='sm' className='w-45' />
            {showCustomerFilter && (
              <AppSelect
                mode='multiple'
                value={customerIds}
                onValueChange={(value) => setCustomerIds(value)}
                options={customerOptions}
                placeholder={t('page.dashboard.filters.all_customers')}
                searchPlaceholder={t('page.dashboard.filters.search_customer')}
                emptyText={t('page.dashboard.filters.no_customers')}
                searchable
                onSearchValueChange={setCustomerSearchTerm}
                onReachEnd={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                isFetchingNextPage={isFetchingNextPage}
                clearable
                size='sm'
                className='min-w-60 flex-1'
              />
            )}
            {/* isProductsTab && (
              <AppInput
                type='number'
                min={1}
                value={limitDraft}
                onValueChange={setLimitDraft}
                onEnter={commitLimit}
                onBlur={commitLimit}
                size='sm'
                className='w-32'
                prefix={<span className='text-xs'>{t('page.dashboard.statistics.top_n')}</span>}
              />
            ) */}
          </div>
        </div>
      </DashboardPageHeader>

      {/* keepPreviousData would otherwise leave the previous tab's cards on screen while the new one loads. */}
      <StatisticsContent
        statistics={statistics}
        isError={isError}
        isFetching={isFetching}
        isLoading={isLoading || isPlaceholderData}
        onRetry={handleRetry}
      />

      <ExportResultDialog open={exportHistory !== null} history={exportHistory} onOpenChange={(nextOpen) => !nextOpen && setExportHistory(null)} />
    </PageContainer>
  );
}
