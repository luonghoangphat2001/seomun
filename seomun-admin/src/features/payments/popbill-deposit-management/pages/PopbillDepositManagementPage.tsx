import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type SortingState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import { useBankDepositsQuery, useBankDepositSyncStatusQuery } from '../api';
import { getPopbillDepositColumns, ManualConfirmDialog, PopbillDepositSearchFilters, PopbillSyncStatus } from '../components';
import type { BankDepositRESP } from '../api';
import type { PopbillDepositSearchFilterValues } from '../schemas';
import { buildPopbillDepositListParams } from '../utils';

const routeApi = getRouteApi('/payments/popbill-deposits');

export function PopbillDepositManagementPage() {
  const { t } = useTranslation('page');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [selectedDeposit, setSelectedDeposit] = useState<BankDepositRESP | null>(null);
  const queryParams = useMemo(() => buildPopbillDepositListParams(search), [search]);

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );
  const appliedFilters = useMemo<PopbillDepositSearchFilterValues>(
    () => ({ status: search.status, bank_account_key: search.bank_account_key }),
    [search.bank_account_key, search.status],
  );
  const columns = useMemo(
    () => getPopbillDepositColumns({ t, rowOffset: (queryParams.page - 1) * queryParams.per_page, onManualConfirm: setSelectedDeposit }),
    [queryParams.page, queryParams.per_page, t],
  );

  const {
    data: depositResponse,
    isError,
    isFetching: isDepositsFetching,
    isLoading,
    refetch: refetchDeposits,
  } = useBankDepositsQuery(queryParams, {
    refetchInterval: 30_000,
  });
  const { data: syncResponse, isFetching: isSyncFetching, refetch: refetchSyncStatus } = useBankDepositSyncStatusQuery({ refetchInterval: 30_000 });

  const hasListData = depositResponse !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;
  const isRefreshing = isDepositsFetching || isSyncFetching;

  const handleApplyFilters = useCallback(
    (values: PopbillDepositSearchFilterValues) => {
      void navigate({ search: (previous) => ({ ...previous, ...values, page: undefined }) });
    },
    [navigate],
  );

  const handleResetFilters = useCallback(() => {
    void navigate({ search: (previous) => ({ per_page: previous.per_page, page: undefined }) });
  }, [navigate]);

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const nextPagination = functionalUpdate(updater, tablePagination);
      const nextPage = Math.max(nextPagination.pageIndex + 1, DEFAULT_PAGE);
      const nextPageSize = Math.max(nextPagination.pageSize, 1);
      const isPageSizeChanged = nextPageSize !== tablePagination.pageSize;
      void navigate({
        search: (previous) => ({
          ...previous,
          page: isPageSizeChanged || nextPage === DEFAULT_PAGE ? undefined : nextPage,
          per_page: nextPageSize === DEFAULT_PER_PAGE ? undefined : nextPageSize,
        }),
      });
    },
    [navigate, tablePagination],
  );

  const refresh = () => {
    void Promise.all([refetchDeposits(), refetchSyncStatus()]);
  };

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={refresh} disabled={isRefreshing} className='gap-2'>
      {isRefreshing ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : <RefreshCw className='size-4' aria-hidden='true' />}
      {t('payments.popbill_deposits.retry', 'Retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold'>{t('payments.popbill_deposits.title', 'POPBiLL Bank Deposit Management')}</h1>
        </div>
        <Button size='sm' variant='outline' className='gap-1.5' onClick={refresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : <RefreshCw className='size-4' aria-hidden='true' />}
          {t('payments.popbill_deposits.refresh', 'Refresh')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <PopbillSyncStatus syncs={syncResponse?.data ?? []} />
        <PopbillDepositSearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('payments.popbill_deposits.error.load_title', 'Unable to load bank deposits')}</h2>
              <p className='text-muted-foreground text-sm'>
                {t('payments.popbill_deposits.error.load_description', 'The request failed. Please try again.')}
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
                    {t('payments.popbill_deposits.error.refresh', 'Unable to refresh bank deposits. Showing previous data.')}
                  </p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={depositResponse?.data.bank_deposits ?? []}
              columns={columns}
              state={{ pagination: tablePagination, sorting: [] as SortingState }}
              pageInfo={{
                pageCount: depositResponse?.pagination.total_page ?? 0,
                rowCount: depositResponse?.pagination.total_item ?? 0,
              }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={() => {}}
              enableRowSelection={false}
              isLoading={isLoading}
              emptyMessage={t('payments.popbill_deposits.no_deposits', 'No bank deposits match the current filter.')}
              getRowId={(deposit) => String(deposit.id)}
            />
          </>
        )}
      </div>

      <ManualConfirmDialog deposit={selectedDeposit} onClose={() => setSelectedDeposit(null)} />
    </PageContainer>
  );
}
