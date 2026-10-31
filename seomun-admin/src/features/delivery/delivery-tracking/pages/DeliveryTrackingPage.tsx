import { getRouteApi } from '@tanstack/react-router';
import {
  functionalUpdate,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table';
import { AlertCircle, Loader2, FileDown } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import { type DeliveryTrackingExportExcelType } from '../../enums';
import type { DeliveryTracking } from '../../types';
import { useDeliveryTrackingsQuery } from '../api';
import { getTrackingColumns, TrackingDetailDialog, TrackingExportDialog, TrackingSearchFilters } from '../components';
import { useDeliveryTrackingExport } from '../hooks/useDeliveryTrackingExport';
import { EMPTY_TRACKING_SEARCH_FILTER_VALUES, type TrackingSearchFilterValues } from '../schemas';
import { buildTrackingListParams, isTrackingSortField } from '../utils';

const routeApi = getRouteApi('/delivery/tracking');

export function DeliveryTrackingPage() {
  const { t } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [selectedTracking, setSelectedTracking] = useState<DeliveryTracking | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const queryParams = useMemo(() => buildTrackingListParams(search), [search]);
  const trackingListQuery = useDeliveryTrackingsQuery(queryParams);
  const trackingRows = trackingListQuery.data?.data?.delivery_trackings ?? [];
  const trackingPagination = trackingListQuery.data?.pagination;

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number),
    [rowSelection],
  );

  const { isExporting, startExport } = useDeliveryTrackingExport({
    filters: queryParams,
    page: queryParams.page,
    perPage: queryParams.per_page,
    totalCount: trackingPagination?.total_item ?? 0,
    selectedIds,
  });

  const columns = useMemo(() => getTrackingColumns(t, setSelectedTracking), [t]);

  const tablePagination = useMemo<PaginationState>(
    () => ({
      pageIndex: queryParams.page - 1,
      pageSize: queryParams.per_page,
    }),
    [queryParams.page, queryParams.per_page],
  );

  const tableSorting = useMemo<SortingState>(
    () => (queryParams.sort_by ? [{ id: queryParams.sort_by, desc: queryParams.sort_order === SortOrder.DESC }] : []),
    [queryParams.sort_by, queryParams.sort_order],
  );

  const appliedFilters = useMemo<TrackingSearchFilterValues>(
    () => ({
      ...EMPTY_TRACKING_SEARCH_FILTER_VALUES,
      search_term: search.search_term ?? '',
      delivery_status: search.delivery_status,
      invoice_number: search.invoice_number,
      order_number: search.order_number,
      customer_name: search.customer_name,
      product_name: search.product_name,
      waybill_registration_date_from: search.waybill_registration_date_from,
      waybill_registration_date_to: search.waybill_registration_date_to,
    }),
    [
      search.customer_name,
      search.delivery_status,
      search.invoice_number,
      search.order_number,
      search.product_name,
      search.search_term,
      search.waybill_registration_date_from,
      search.waybill_registration_date_to,
    ],
  );

  const handleApplyFilters = useCallback(
    (values: TrackingSearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          search_term: values.search_term.trim() || undefined,
          delivery_status: values.delivery_status,
          invoice_number: values.invoice_number?.trim() || undefined,
          order_number: values.order_number?.trim() || undefined,
          customer_name: values.customer_name?.trim() || undefined,
          product_name: values.product_name?.trim() || undefined,
          waybill_registration_date_from: values.waybill_registration_date_from,
          waybill_registration_date_to: values.waybill_registration_date_to,
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
        delivery_status: undefined,
        invoice_number: undefined,
        order_number: undefined,
        customer_name: undefined,
        product_name: undefined,
        waybill_registration_date_from: undefined,
        waybill_registration_date_to: undefined,
      }),
    });
  }, [navigate]);

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = functionalUpdate(updater, tableSorting);
      const nextSort = nextSorting[0];
      const nextSortBy = nextSort && isTrackingSortField(nextSort.id) ? nextSort.id : undefined;

      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          sort_by: nextSortBy,
          sort_order: nextSortBy ? (nextSort.desc ? SortOrder.DESC : SortOrder.ASC) : undefined,
        }),
      });
    },
    [navigate, tableSorting],
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      const nextPagination = functionalUpdate(updaterOrValue, tablePagination);
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

  const handleExport = useCallback(
    (type: DeliveryTrackingExportExcelType) => {
      startExport(type)
        .then(() => setIsExportDialogOpen(false))
        .catch(() => {});
    },
    [startExport],
  );

  const renderLoadingState = () => (
    <div className='text-muted-foreground flex items-center gap-2 text-sm'>
      <Loader2 className='size-4 animate-spin' />
      {t('common.message.loading')}
    </div>
  );

  return (
    <PageContainer>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.delivery.tracking.title')}</h1>
          <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.delivery.tracking.description')}</p>
        </div>

        <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setIsExportDialogOpen(true)}>
          <FileDown className='size-4' />
          {t('common.export.button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <TrackingSearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {trackingListQuery.isError ? (
          <div className='bg-card flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <AlertCircle className='text-destructive size-6' />
            <p className='text-muted-foreground text-sm'>{trackingListQuery.error.message}</p>
          </div>
        ) : !trackingListQuery.isLoading && trackingRows.length === 0 ? (
          <div className='bg-card flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <AlertCircle className='text-muted-foreground size-6' />
            <p className='text-muted-foreground text-sm'>{t('table.empty')}</p>
            <Button variant='outline' size='sm' onClick={handleResetFilters}>
              {t('common.action.reset')}
            </Button>
          </div>
        ) : (
          <DataTable
            data={trackingRows}
            columns={columns}
            state={{
              pagination: tablePagination,
              sorting: tableSorting,
            }}
            pageInfo={{
              pageCount: trackingPagination?.total_page ?? 0,
              rowCount: trackingPagination?.total_item ?? 0,
            }}
            onPaginationChange={handlePaginationChange}
            onSortingChange={handleSortingChange}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            isLoading={trackingListQuery.isLoading}
            emptyMessage={renderLoadingState()}
            getRowId={(row) => String(row.id)}
          />
        )}
      </div>

      <TrackingDetailDialog rowData={selectedTracking} onClose={() => setSelectedTracking(null)} />

      <TrackingExportDialog
        isOpen={isExportDialogOpen}
        totalCount={trackingPagination?.total_item ?? 0}
        currentPageCount={trackingRows.length}
        selectedCount={selectedIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />
    </PageContainer>
  );
}
