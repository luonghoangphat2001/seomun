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
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import { useShipmentSearchFiltersQuery, useShipmentsQuery, useUpdateShipmentTrackingNumberMutation } from '../api';
import {
  getShipmentColumns,
  ShipmentExportDialog,
  ShipmentSearchFilters,
  ShipmentTrackingInfoModal,
  ShipmentTrackingNumberDialog,
  type TrackingNumberForm,
} from '../components';
import type { Shipment } from '../../types';
import type { ShipmentExportExcelType } from '../../enums';
import { useShipmentExport } from '../hooks/useShipmentExport';
import { EMPTY_SHIPMENT_SEARCH_FILTER_VALUES, type ShipmentSearchFilterValues } from '../schemas';
import { buildShipmentListParams, isShipmentSortField } from '../utils';

// === Variables ===

const routeApi = getRouteApi('/delivery/shipments');

// === Component ===

export function ShipmentManagementPage() {
  const { t } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryParams = useMemo(() => buildShipmentListParams(search), [search]);

  // === State ===

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [prevQueryParams, setPrevQueryParams] = useState(queryParams);

  if (prevQueryParams !== queryParams) {
    setPrevQueryParams(queryParams);
    setRowSelection({});
  }

  // === Hooks ===

  const shipmentListQuery = useShipmentsQuery(queryParams);
  const shipmentFiltersQuery = useShipmentSearchFiltersQuery(queryParams);
  const updateTrackingNumberMutation = useUpdateShipmentTrackingNumberMutation({
    onSuccess: () => {
      toast.success(t('page.delivery.shipments.tracking_dialog.success'));
      setEditingShipment(null);
    },
    onError: () => toast.error(t('page.delivery.shipments.tracking_dialog.error')),
  });

  const columns = useMemo(() => getShipmentColumns(t, setEditingShipment, setTrackingNumber), [t]);

  const shipmentRows = shipmentListQuery.data?.data?.shipments ?? [];
  const shipmentPagination = shipmentListQuery.data?.pagination;
  const managerOptions = shipmentFiltersQuery.data?.data?.filters?.shipping_manager_options ?? [];

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    [rowSelection],
  );

  const { isExporting, startExport } = useShipmentExport({
    filters: queryParams,
    page: queryParams.page,
    perPage: queryParams.per_page,
    totalCount: shipmentPagination?.total_item ?? 0,
    selectedIds,
  });

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );

  const tableSorting = useMemo<SortingState>(
    () => (queryParams.sort_by ? [{ id: queryParams.sort_by, desc: queryParams.sort_order === SortOrder.DESC }] : []),
    [queryParams.sort_by, queryParams.sort_order],
  );

  const appliedFilters = useMemo<ShipmentSearchFilterValues>(
    () => ({
      ...EMPTY_SHIPMENT_SEARCH_FILTER_VALUES,
      search_term: search.search_term ?? '',
      order_number: search.order_number,
      customer_name: search.customer_name,
      product_name: search.product_name,
      shipping_manager_id: search.shipping_manager_id,
      shipment_status: search.shipment_status,
      shipment_type: search.shipment_type,
      shipping_method: search.shipping_method,
      shipment_date_from: search.shipment_date_from,
      shipment_date_to: search.shipment_date_to,
    }),
    [search],
  );

  // === Functions ===

  const handleApplyFilters = useCallback(
    (values: ShipmentSearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          search_term: values.search_term.trim() || undefined,
          order_number: values.order_number || undefined,
          customer_name: values.customer_name || undefined,
          product_name: values.product_name || undefined,
          shipping_manager_id: values.shipping_manager_id,
          shipment_status: values.shipment_status,
          shipment_type: values.shipment_type,
          shipping_method: values.shipping_method,
          shipment_date_from: values.shipment_date_from,
          shipment_date_to: values.shipment_date_to,
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
        order_number: undefined,
        customer_name: undefined,
        product_name: undefined,
        shipping_manager_id: undefined,
        shipment_status: undefined,
        shipment_type: undefined,
        shipping_method: undefined,
        shipment_date_from: undefined,
        shipment_date_to: undefined,
      }),
    });
  }, [navigate]);

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = functionalUpdate(updater, tableSorting);
      const nextSort = nextSorting[0];
      const nextSortBy = nextSort && isShipmentSortField(nextSort.id) ? nextSort.id : undefined;

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
    (type: ShipmentExportExcelType) => {
      startExport(type)
        .then(() => setIsExportDialogOpen(false))
        .catch(() => {});
    },
    [startExport],
  );

  const handleSaveTrackingNumber = useCallback(
    (values: TrackingNumberForm) => {
      if (!editingShipment) return;
      updateTrackingNumberMutation.mutate({
        shipment: editingShipment.id,
        tracking_number: values.tracking_number,
        carrier_name: 'Hanjin Express',
      });
    },
    [editingShipment, updateTrackingNumberMutation],
  );

  // === Computed ===

  const hasListData = shipmentListQuery.data !== undefined;
  const shouldShowInitialError = shipmentListQuery.isError && !hasListData;
  const shouldShowRefreshError = shipmentListQuery.isError && hasListData;

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button
      type='button'
      variant={variant}
      onClick={() => void shipmentListQuery.refetch()}
      disabled={shipmentListQuery.isFetching}
      className='gap-2'
    >
      {shipmentListQuery.isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('page.delivery.shipments.retry')}
    </Button>
  );

  // === JSX return ===

  return (
    <PageContainer>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.delivery.shipments.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.delivery.shipments.description')}</p> */}
        </div>

        <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setIsExportDialogOpen(true)}>
          <FileDown className='size-4' />
          {t('common.export.button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <ShipmentSearchFilters
          initialValues={appliedFilters}
          managerOptions={managerOptions}
          onSearch={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('page.delivery.shipments.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('page.delivery.shipments.error.load_description')}</p>
            </div>
            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('page.delivery.shipments.error.refresh')}</p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={shipmentRows}
              columns={columns}
              state={{ pagination: tablePagination, sorting: tableSorting }}
              pageInfo={{
                pageCount: shipmentPagination?.total_page ?? 0,
                rowCount: shipmentPagination?.total_item ?? 0,
              }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={handleSortingChange}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              isLoading={shipmentListQuery.isLoading}
              getRowId={(row) => String(row.id)}
            />
          </>
        )}
      </div>

      <ShipmentExportDialog
        isOpen={isExportDialogOpen}
        totalCount={shipmentPagination?.total_item ?? 0}
        currentPageCount={shipmentRows.length}
        selectedCount={selectedIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />

      <ShipmentTrackingNumberDialog
        shipment={editingShipment}
        isSaving={updateTrackingNumberMutation.isPending}
        onClose={() => setEditingShipment(null)}
        onSave={handleSaveTrackingNumber}
      />

      <ShipmentTrackingInfoModal trackingNumber={trackingNumber} onClose={() => setTrackingNumber(null)} />
    </PageContainer>
  );
}
