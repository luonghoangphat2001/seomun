import { getRouteApi } from '@tanstack/react-router';
import {
  functionalUpdate,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table';
import { AlertCircle, Loader2, Printer, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';
import { useBatchPrintWorkInstructionsMutation, useBulkOrderStatusChangeMutation, useOrdersQuery } from '../api';
import type { OrderListItemRESP } from '../api/order.response';
import { OrderBulkStatusDialog } from '../components/OrderBulkStatusDialog';
import { getOrderColumns } from '../components/OrderColumn';
import { OrderDetailPanel } from '../components/OrderDetailPanel';
import { OrderSearchFilters } from '../components/OrderSearchFilters';
import { OrderSortField, type OrderStatus } from '../enums';
import type { OrderSearchFilterValues } from '../schemas';
import { buildOrderListParams, normalizeOrderQuery } from '../utils/order-list-params';

const routeApi = getRouteApi('/orders/');

export function OrderListPage() {
  const { t } = useTranslation('page');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  // === State ===

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);

  // === Derived ===

  const queryParams = useMemo(() => buildOrderListParams(search), [search]);

  const selectedOrderNumber = search.selected_order_number;

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

  const appliedFilters = useMemo<OrderSearchFilterValues>(
    () => ({
      search_term: search.search_term ?? '',
      status: search.status,
      status_group: search.status_group,
      shipping_method: search.shipping_method,
      order_date_from: search.order_date_from,
      order_date_to: search.order_date_to,
    }),
    [search.search_term, search.status, search.status_group, search.shipping_method, search.order_date_from, search.order_date_to],
  );

  const selectedOrderIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number),
    [rowSelection],
  );

  // === Hooks ===

  const { data: response, isError, isFetching, isLoading, refetch } = useOrdersQuery(queryParams);
  const batchPrintMutation = useBatchPrintWorkInstructionsMutation();
  const bulkStatusMutation = useBulkOrderStatusChangeMutation();

  const selectedOrders = useMemo(() => (response?.data?.orders ?? []).filter((order) => rowSelection[String(order.id)]), [response, rowSelection]);

  const selectedOrderNumbers = useMemo(() => selectedOrders.map((order) => order.order_number), [selectedOrders]);

  // Bulk status change applies one transition, so every selected order must start from the same status.
  const hasMixedStatuses = useMemo(() => new Set(selectedOrders.map((order) => order.status)).size > 1, [selectedOrders]);

  // === Functions ===

  const handleSelectOrder = useCallback(
    (order: OrderListItemRESP) => {
      void navigate({ search: (previous) => ({ ...previous, selected_order_number: order.order_number }) });
    },
    [navigate],
  );

  const handleBatchPrint = useCallback(() => {
    batchPrintMutation.mutate(
      { order_ids: selectedOrderIds },
      {
        onSuccess: (res) => {
          window.open(res.data.pdf_url, '_blank');
          toast.success(t('orders.list.messages.batch_print_success'));
          setRowSelection({});
        },
        onError: () => toast.error(t('orders.list.messages.batch_print_error')),
      },
    );
  }, [batchPrintMutation, selectedOrderIds, t]);

  const handleBulkStatusChange = useCallback(
    (status: OrderStatus, reason: string) => {
      bulkStatusMutation.mutate(
        { order_numbers: selectedOrderNumbers, status, reason },
        {
          onSuccess: (res) => {
            toast.success(t('orders.list.messages.bulk_status_success', { count: res.data.updated_count }));
            setRowSelection({});
            setIsBulkStatusOpen(false);
          },
          onError: () => toast.error(t('orders.list.messages.bulk_status_error')),
        },
      );
    },
    [bulkStatusMutation, selectedOrderNumbers, t],
  );

  const columns = useMemo(() => getOrderColumns({ t }), [t]);

  const handleApplyFilters = useCallback(
    (values: OrderSearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          search_term: normalizeOrderQuery(values.search_term),
          status: values.status,
          status_group: values.status_group,
          shipping_method: values.shipping_method,
          order_date_from: values.order_date_from,
          order_date_to: values.order_date_to,
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
        status: undefined,
        status_group: undefined,
        shipping_method: undefined,
        order_date_from: undefined,
        order_date_to: undefined,
      }),
    });
  }, [navigate]);

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = functionalUpdate(updater, tableSorting);
      const nextSort = nextSorting[0];
      const nextSortBy =
        nextSort && Object.values(OrderSortField).includes(nextSort.id as OrderSortField) ? (nextSort.id as OrderSortField) : undefined;

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

  // === Derived display ===

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('orders.list.retry')}
    </Button>
  );

  return (
    <PageContainer className='lg:h-full'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('orders.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('orders.list.description')}</p> */}
        </div>

        <div className='flex flex-col items-end gap-1'>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='gap-1.5'
              onClick={() => setIsBulkStatusOpen(true)}
              disabled={selectedOrderNumbers.length === 0 || hasMixedStatuses}
            >
              <RefreshCw className='size-4' />
              {t('orders.list.bulk_status.button')}
              {selectedOrderNumbers.length > 0 ? ` (${selectedOrderNumbers.length})` : null}
            </Button>

            <Button
              variant='outline'
              size='sm'
              className='gap-1.5'
              onClick={handleBatchPrint}
              disabled={selectedOrderIds.length === 0 || batchPrintMutation.isPending}
            >
              {batchPrintMutation.isPending ? <Loader2 className='size-4 animate-spin' /> : <Printer className='size-4' />}
              {t('orders.list.batch_print')}
              {selectedOrderIds.length > 0 ? ` (${selectedOrderIds.length})` : null}
            </Button>
          </div>

          {hasMixedStatuses ? <p className='text-muted-foreground text-xs'>{t('orders.list.bulk_status.mixed_statuses')}</p> : null}
        </div>
      </div>

      <Separator />

      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('orders.list.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('orders.list.error.load_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('orders.list.error.refresh')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <div className='grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)]'>
              <div className='flex min-h-0 flex-col gap-4'>
                <OrderSearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

                <div className='scrollbar-thin min-h-0 lg:overflow-y-auto [&_table]:table-fixed [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th_button:not([data-slot=checkbox])]:-ml-1 [&_th_button:not([data-slot=checkbox])]:h-auto [&_th_button:not([data-slot=checkbox])]:px-1 [&_th_button:not([data-slot=checkbox])]:whitespace-normal'>
                  <DataTable
                    data={response?.data?.orders ?? []}
                    columns={columns}
                    state={{
                      pagination: tablePagination,
                      sorting: tableSorting,
                    }}
                    pageInfo={{
                      pageCount: response?.pagination?.total_page ?? 0,
                      rowCount: response?.pagination?.total_item ?? 0,
                    }}
                    onPaginationChange={handlePaginationChange}
                    onSortingChange={handleSortingChange}
                    showPaginationSummary={false}
                    isLoading={isLoading}
                    enableRowSelection={true}
                    getRowId={(row) => String(row.id)}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    onRowClick={handleSelectOrder}
                    getRowClassName={(row) => (row.order_number === selectedOrderNumber ? 'bg-primary/10 hover:bg-primary/10' : undefined)}
                  />
                </div>
              </div>

              <div className='bg-muted/30 scrollbar-thin min-h-0 rounded-xl border p-4 lg:overflow-y-auto'>
                {selectedOrderNumber ? (
                  <OrderDetailPanel orderNumber={selectedOrderNumber} />
                ) : (
                  <div className='text-muted-foreground flex h-full min-h-64 items-center justify-center text-sm'>
                    {t('orders.list.detail_pane.empty')}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isBulkStatusOpen ? (
        <OrderBulkStatusDialog
          isOpen={isBulkStatusOpen}
          count={selectedOrderNumbers.length}
          isPending={bulkStatusMutation.isPending}
          onClose={() => setIsBulkStatusOpen(false)}
          onConfirm={handleBulkStatusChange}
        />
      ) : null}
    </PageContainer>
  );
}
