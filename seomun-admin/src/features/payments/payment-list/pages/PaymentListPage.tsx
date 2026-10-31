import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type RowSelectionState, type SortingState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import { usePaymentsQuery } from '../api';
import { getPaymentColumns } from '../components/PaymentColumns';
import { PaymentExportDialog } from '../components/PaymentExportDialog';
import { PaymentSearchFilters } from '../components/PaymentSearchFilters';
import type { PaymentExportExcelType } from '../enums';
import { usePaymentExport } from '../hooks/usePaymentExport';
import type { PaymentSearchFilterValues } from '../schemas';
import { buildPaymentListParams, isPaymentSortField } from '../utils';

const routeApi = getRouteApi('/payments/');

export function PaymentListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryParams = useMemo(() => buildPaymentListParams(search), [search]);

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );

  const tableSorting = useMemo<SortingState>(
    () => (queryParams.sort_by ? [{ id: queryParams.sort_by, desc: queryParams.sort_order === SortOrder.DESC }] : []),
    [queryParams.sort_by, queryParams.sort_order],
  );

  const appliedFilters = useMemo<PaymentSearchFilterValues>(
    () => ({
      search_term: search.search_term,
      order_date_from: search.order_date_from,
      order_date_to: search.order_date_to,
      status: search.status,
      start_date: search.start_date,
      end_date: search.end_date,
    }),
    [search],
  );

  const columns = useMemo(
    () => getPaymentColumns({ t, rowOffset: (queryParams.page - 1) * queryParams.per_page }),
    [t, queryParams.page, queryParams.per_page],
  );
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data: response, isError, isFetching, isLoading, refetch } = usePaymentsQuery(queryParams);

  const selectedTransactionIds = useMemo(() => Object.keys(rowSelection).filter((id) => rowSelection[id]), [rowSelection]);

  const { isExporting, startExport } = usePaymentExport({
    filters: queryParams,
    page: queryParams.page,
    perPage: queryParams.per_page,
    totalCount: response?.pagination?.total_item ?? 0,
    selectedIds: selectedTransactionIds,
  });

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleApplyFilters = useCallback(
    (values: PaymentSearchFilterValues) => {
      void navigate({ search: (prev) => ({ ...prev, ...values, page: undefined }) });
    },
    [navigate],
  );

  const handleResetFilters = useCallback(() => {
    void navigate({
      search: (prev) => ({ per_page: prev.per_page, sort_by: prev.sort_by, sort_order: prev.sort_order, page: undefined }),
    });
  }, [navigate]);

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = functionalUpdate(updater, tableSorting);
      const nextSort = nextSorting[0];
      const nextSortBy = nextSort && isPaymentSortField(nextSort.id) ? nextSort.id : undefined;
      void navigate({
        search: (prev) => ({
          ...prev,
          page: undefined,
          sort_by: nextSortBy,
          sort_order: nextSortBy ? (nextSort.desc ? SortOrder.DESC : SortOrder.ASC) : undefined,
        }),
      });
    },
    [navigate, tableSorting],
  );

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

  const handleExport = useCallback(
    (type: PaymentExportExcelType) => {
      startExport(type)
        .then(() => setIsExportDialogOpen(false))
        .catch(() => {});
    },
    [startExport],
  );

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('payments.list.retry', 'Retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('payments.list.title', 'Payment History')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>
            {t('payments.list.description', 'Search, sort, and export payment transaction records.')}
          </p> */}
        </div>
        <Button size='sm' variant='outline' className='gap-1.5' onClick={() => setIsExportDialogOpen(true)}>
          <Download className='size-4' />
          {tCommon('export.button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <PaymentSearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('payments.list.error.load_title', 'Unable to load payments')}</h2>
              <p className='text-muted-foreground text-sm'>{t('payments.list.error.load_description', 'The request failed. Please try again.')}</p>
            </div>
            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('payments.list.error.refresh', 'Unable to refresh payment list. Showing previous data.')}</p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data?.payments ?? []}
              columns={columns}
              state={{ pagination: tablePagination, sorting: tableSorting }}
              pageInfo={{
                pageCount: response?.pagination?.total_page ?? 0,
                rowCount: response?.pagination?.total_item ?? 0,
              }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={handleSortingChange}
              isLoading={isLoading}
              getRowId={(row) => row.transaction_id}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </>
        )}
      </div>

      <PaymentExportDialog
        isOpen={isExportDialogOpen}
        totalCount={response?.pagination?.total_item ?? 0}
        currentPageCount={response?.data?.payments?.length ?? 0}
        selectedCount={selectedTransactionIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />
    </PageContainer>
  );
}
