import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type SortingState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import { useSettlementReportsQuery } from '../api';
import { getSettlementReportColumns } from '../components/SettlementReportColumns';
import { SettlementReportExportDialog } from '../components/SettlementReportExportButton';
import { SettlementReportSearchFilters } from '../components/SettlementReportSearchFilters';
import type { SettlementReportSearchFilterValues } from '../schemas';
import { buildSettlementReportListParams } from '../utils';

const routeApi = getRouteApi('/payments/settlement-report');

export function SettlementReportListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const queryParams = useMemo(() => buildSettlementReportListParams(search), [search]);

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );

  const appliedFilters = useMemo<SettlementReportSearchFilterValues>(() => ({ start_date: search.start_date, end_date: search.end_date }), [search]);

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const { data: response, isError, isFetching, isLoading, refetch } = useSettlementReportsQuery(queryParams);

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const columns = useMemo(
    () =>
      getSettlementReportColumns({
        t,
        pageIndex: tablePagination.pageIndex,
        pageSize: tablePagination.pageSize,
      }),
    [t, tablePagination.pageIndex, tablePagination.pageSize],
  );

  const handleApplyFilters = useCallback(
    (values: SettlementReportSearchFilterValues) => {
      void navigate({ search: (prev) => ({ ...prev, ...values, page: undefined }) });
    },
    [navigate],
  );

  const handleResetFilters = useCallback(() => {
    void navigate({ search: (prev) => ({ per_page: prev.per_page, page: undefined }) });
  }, [navigate]);

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const nextPagination = functionalUpdate(updater, tablePagination);
      const nextPage = Math.max(nextPagination.pageIndex + 1, DEFAULT_PAGE);
      const nextPageSize = Math.max(nextPagination.pageSize, 1);
      const isPageSizeChanged = nextPageSize !== tablePagination.pageSize;
      void navigate({
        search: (prev) => ({
          ...prev,
          page: isPageSizeChanged || nextPage === DEFAULT_PAGE ? undefined : nextPage,
          per_page: nextPageSize === DEFAULT_PER_PAGE ? undefined : nextPageSize,
        }),
      });
    },
    [navigate, tablePagination],
  );

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('payments.settlement_report.retry', 'Retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('payments.settlement_report.title', 'Settlement Report')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>
            {t('payments.settlement_report.description', 'Review settlement records and export reports by date range.')}
          </p> */}
        </div>
        <Button size='sm' variant='outline' className='gap-1.5' onClick={() => setIsExportDialogOpen(true)}>
          <Download className='size-4' />
          {tCommon('export.button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <SettlementReportSearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('payments.settlement_report.error.load_title', 'Unable to load settlement report')}</h2>
              <p className='text-muted-foreground text-sm'>
                {t('payments.settlement_report.error.load_description', 'The request failed. Please try again.')}
              </p>
            </div>
            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>
                    {t('payments.settlement_report.error.refresh', 'Unable to refresh settlement report. Showing previous data.')}
                  </p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data?.reports ?? []}
              columns={columns}
              state={{ pagination: tablePagination, sorting: [] as SortingState }}
              pageInfo={{
                pageCount: response?.pagination?.total_page ?? 0,
                rowCount: response?.pagination?.total_item ?? 0,
              }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={() => {}}
              enableRowSelection={false}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
      <SettlementReportExportDialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        filters={{ start_date: queryParams.start_date, end_date: queryParams.end_date }}
      />
    </PageContainer>
  );
}
