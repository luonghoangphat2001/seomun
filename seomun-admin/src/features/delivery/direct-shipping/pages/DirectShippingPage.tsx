import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type OnChangeFn, type PaginationState, type RowSelectionState, type SortingState } from '@tanstack/react-table';
import { AlertCircle, FileDown, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { formatDateOnly, parseDateOnly } from '@/utils/format-date';

import { buildDirectShippingListParams, useDirectShippingsQuery, useUpdateDirectShippingStatusMutation } from '../api';
import { DirectShippingDetailDialog, DirectShippingExportDialog, DirectShippingSearchFilters, getDirectShippingColumns } from '../components';
import { type DirectShippingExportExcelType, type DirectShippingStatus } from '../enums';
import { useDirectShippingExport } from '../hooks/useDirectShippingExport';
import type { DirectShippingSearchFilterValues } from '../schemas';
import type { DirectShipping } from '../types';

// === Variables ===

const routeApi = getRouteApi('/delivery/direct-shipping');

// === Component ===

export function DirectShippingPage() {
  const { t } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryParams = useMemo(() => buildDirectShippingListParams(search), [search]);

  // === State ===

  const [selectedRow, setSelectedRow] = useState<DirectShipping | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [prevQueryParams, setPrevQueryParams] = useState(queryParams);

  if (prevQueryParams !== queryParams) {
    setPrevQueryParams(queryParams);
    setRowSelection({});
  }

  // === Hooks ===

  const listQuery = useDirectShippingsQuery(queryParams);
  const updateStatusMutation = useUpdateDirectShippingStatusMutation({
    onSuccess: () => {
      toast.success(t('page.delivery.direct_shipping.toast.status_success'));
      setSelectedRow(null);
    },
    onError: () => toast.error(t('page.delivery.direct_shipping.toast.status_error')),
  });

  const columns = useMemo(() => getDirectShippingColumns(t, setSelectedRow), [t]);

  const rows = listQuery.data?.data?.items ?? [];
  const pagination = listQuery.data?.pagination;

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    [rowSelection],
  );

  const { isExporting, startExport } = useDirectShippingExport({
    filters: queryParams,
    page: queryParams.page!,
    perPage: queryParams.per_page!,
    totalCount: pagination?.total_item ?? 0,
    selectedIds,
  });

  const appliedFilters = useMemo<DirectShippingSearchFilterValues>(
    () => ({
      search_term: search.search_term ?? '',
      user_id: search.user_id !== undefined ? String(search.user_id) : '',
      status: search.status,
      date_from: parseDateOnly(search.date_from),
      date_to: parseDateOnly(search.date_to),
    }),
    [search.search_term, search.user_id, search.status, search.date_from, search.date_to],
  );

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page! - 1, pageSize: queryParams.per_page! }),
    [queryParams.page, queryParams.per_page],
  );

  // === Functions ===

  const handleApplyFilters = useCallback(
    (values: DirectShippingSearchFilterValues) => {
      const userId = values.user_id.trim();
      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          search_term: values.search_term.trim() || undefined,
          user_id: userId ? Number(userId) : undefined,
          status: values.status,
          date_from: formatDateOnly(values.date_from),
          date_to: formatDateOnly(values.date_to),
        }),
      });
    },
    [navigate],
  );

  const handleResetFilters = useCallback(() => {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: undefined,
        search_term: undefined,
        user_id: undefined,
        status: undefined,
        date_from: undefined,
        date_to: undefined,
      }),
    });
  }, [navigate]);

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      const next = functionalUpdate(updaterOrValue, tablePagination);
      const nextPage = Math.max(next.pageIndex + 1, DEFAULT_PAGE);
      const nextPageSize = Math.max(next.pageSize, 1);
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

  const handleChangeStatus = useCallback(
    (id: number, status: DirectShippingStatus) => {
      updateStatusMutation.mutate({ id, status });
    },
    [updateStatusMutation],
  );

  const handleExport = useCallback(
    (type: DirectShippingExportExcelType) => {
      startExport(type)
        .then(() => setIsExportDialogOpen(false))
        .catch(() => {});
    },
    [startExport],
  );

  // === Computed ===

  const hasData = listQuery.data !== undefined;
  const shouldShowInitialError = listQuery.isError && !hasData;
  const shouldShowRefreshError = listQuery.isError && hasData;
  const noopSorting: OnChangeFn<SortingState> = () => {};

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void listQuery.refetch()} disabled={listQuery.isFetching} className='gap-2'>
      {listQuery.isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('page.delivery.direct_shipping.retry')}
    </Button>
  );

  // === JSX return ===

  return (
    <PageContainer>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.delivery.direct_shipping.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.delivery.direct_shipping.description')}</p> */}
        </div>

        <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setIsExportDialogOpen(true)}>
          <FileDown className='size-4' />
          {t('common.export.button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <DirectShippingSearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('page.delivery.direct_shipping.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('page.delivery.direct_shipping.error.load_description')}</p>
            </div>
            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('page.delivery.direct_shipping.error.refresh')}</p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={rows}
              columns={columns}
              state={{ pagination: tablePagination, sorting: [] }}
              pageInfo={{ pageCount: pagination?.total_page ?? 0, rowCount: pagination?.total_item ?? 0 }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={noopSorting}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              isLoading={listQuery.isLoading}
              getRowId={(row) => String(row.id)}
            />
          </>
        )}
      </div>

      <DirectShippingExportDialog
        isOpen={isExportDialogOpen}
        totalCount={pagination?.total_item ?? 0}
        currentPageCount={rows.length}
        selectedCount={selectedIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />

      <DirectShippingDetailDialog
        row={selectedRow}
        isUpdating={updateStatusMutation.isPending}
        onClose={() => setSelectedRow(null)}
        onChangeStatus={handleChangeStatus}
      />
    </PageContainer>
  );
}
