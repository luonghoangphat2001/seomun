import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type RowSelectionState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Loader2, RotateCcw, Send, Trash2, FileDown, FilePlus2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import { useOrdersQuery, type OrderListREQ } from '../../api';
import { useBulkGenerateCashReceiptsMutation, useBulkStatusCashReceiptsMutation, useDeleteCashReceiptMutation, useCashReceiptsQuery } from '../api';
import { CashReceiptActionDialog } from '../components/CashReceiptActionDialog';
import { getCashReceiptColumns } from '../components/CashReceiptColumns';
import { getOriginalOrderColumns } from '../components/OriginalOrderColumns';
import { CashReceiptSearchFilters } from '../components/CashReceiptSearchFilters';
import { CashReceiptIssueStatus, CashReceiptTab } from '../enums';
import { useCashReceiptExport } from '../hooks/useCashReceiptExport';
import type { CashReceiptSearchFilterValues } from '../schemas';
import { buildCashReceiptListParams } from '../utils';

const routeApi = getRouteApi('/orders/cash-receipts');
type OpenDialog = 'create' | 'delete' | 'issue' | 'pending' | 'archive' | null;

export function CashReceiptListPage() {
  // === Hooks ===
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryParams = useMemo(() => buildCashReceiptListParams(search), [search]);
  const activeTab = search.tab ?? CashReceiptTab.GENERATED;

  // Generated tab = cash-receipt transactions (GET /admin/cash-receipts).
  // Original tab = real order list (GET /admin/orders) — pick rows → order id → create receipt.
  const generatedQuery = useCashReceiptsQuery(queryParams, { enabled: activeTab === CashReceiptTab.GENERATED });
  const orderParams = useMemo<OrderListREQ>(
    () => ({
      page: queryParams.page,
      per_page: queryParams.per_page,
      order_number: queryParams.order_number,
      order_date_from: queryParams.date_from,
      order_date_to: queryParams.date_to,
      cash_receipt_status_is_null: 1,
    }),
    [queryParams.page, queryParams.per_page, queryParams.order_number, queryParams.date_from, queryParams.date_to],
  );
  const originalQuery = useOrdersQuery(orderParams, { enabled: activeTab === CashReceiptTab.ORIGINAL });
  const currentQuery = activeTab === CashReceiptTab.GENERATED ? generatedQuery : originalQuery;

  const generatedItems = useMemo(() => generatedQuery.data?.data?.items ?? [], [generatedQuery.data]);
  const originalItems = useMemo(() => originalQuery.data?.data?.orders ?? [], [originalQuery.data]);

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );

  const appliedFilters = useMemo<CashReceiptSearchFilterValues>(
    () => ({
      date_from: search.date_from,
      date_to: search.date_to,
      issue_status: search.issue_status,
      is_generated: search.is_generated,
      order_code: search.order_code,
      order_number: search.order_number,
    }),
    [search.date_from, search.date_to, search.issue_status, search.is_generated, search.order_code, search.order_number],
  );

  // === State ===
  const [originalSelection, setOriginalSelection] = useState<RowSelectionState>({});
  const [generatedSelection, setGeneratedSelection] = useState<RowSelectionState>({});
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createNote, setCreateNote] = useState('');

  // === Hooks (state-dependent) ===
  const selectedOrders = useMemo(() => originalItems.filter((order) => originalSelection[String(order.id)]), [originalItems, originalSelection]);
  const selectedOrderIds = useMemo(() => selectedOrders.map((order) => Number(order.id)), [selectedOrders]);
  const selectedOrderNumbers = useMemo(() => selectedOrders.map((order) => order.order_number), [selectedOrders]);

  const selectedGeneratedReceipts = useMemo(
    () => generatedItems.filter((receipt) => generatedSelection[String(receipt.id)]),
    [generatedItems, generatedSelection],
  );
  const selectedGeneratedReceiptIds = useMemo(() => selectedGeneratedReceipts.map((receipt) => receipt.id), [selectedGeneratedReceipts]);
  const selectedPendingReceiptIds = useMemo(
    () => selectedGeneratedReceipts.filter((receipt) => receipt.cash_receipt_status === CashReceiptIssueStatus.PENDING).map((receipt) => receipt.id),
    [selectedGeneratedReceipts],
  );
  const selectedIssuedReceiptIds = useMemo(
    () => selectedGeneratedReceipts.filter((receipt) => receipt.cash_receipt_status === CashReceiptIssueStatus.ISSUED).map((receipt) => receipt.id),
    [selectedGeneratedReceipts],
  );

  const generateMutation = useBulkGenerateCashReceiptsMutation();
  const { isExporting, startExport } = useCashReceiptExport({ params: queryParams });
  const statusMutation = useBulkStatusCashReceiptsMutation();
  const deleteMutation = useDeleteCashReceiptMutation();

  // === Functions ===
  const handleIssue = useCallback((id: string) => {
    setGeneratedSelection({ [id]: true });
    setOpenDialog('issue');
  }, []);
  const handlePending = useCallback((id: string) => {
    setGeneratedSelection({ [id]: true });
    setOpenDialog('pending');
  }, []);
  const handleRequestDelete = useCallback((id: string) => {
    setDeleteTargetId(id);
    setOpenDialog('delete');
  }, []);
  const handleConfirmDelete = useCallback(() => {
    if (!deleteTargetId) return;
    setBusyId(deleteTargetId);
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => toast.success(t('orders.cash_receipts.messages.archive_success')),
      onError: () => toast.error(t('orders.cash_receipts.messages.archive_error')),
      onSettled: () => {
        setBusyId(null);
        setOpenDialog(null);
        setDeleteTargetId(null);
      },
    });
  }, [deleteMutation, deleteTargetId, t]);

  const handleCreate = useCallback(() => {
    generateMutation.mutate(
      { order_ids: selectedOrderIds, notes: createNote.trim() || undefined },
      {
        onSuccess: (res) => {
          const { created_count, skipped_count, skipped } = res.data;
          if (created_count > 0) {
            toast.success(t('orders.cash_receipts.messages.create_success', { count: created_count }));
          }
          if (skipped_count > 0) {
            const reasons = [...new Set(skipped.map((item) => item.reason))].join(', ');
            toast.error(t('orders.cash_receipts.messages.create_skipped', { count: skipped_count, reasons }));
          }
          setOriginalSelection({});
          setOpenDialog(null);
          setCreateNote('');
        },
        onError: () => toast.error(t('orders.cash_receipts.messages.create_error')),
      },
    );
  }, [generateMutation, selectedOrderIds, createNote, t]);

  const handleBulkIssue = useCallback(() => {
    statusMutation.mutate(
      { ids: selectedPendingReceiptIds, status: CashReceiptIssueStatus.ISSUED },
      {
        onSuccess: (res) => {
          toast.success(t('orders.cash_receipts.messages.bulk_issue_success', { count: res.data.updated_count }));
          setGeneratedSelection({});
          setOpenDialog(null);
        },
        onError: () => toast.error(t('orders.cash_receipts.messages.bulk_issue_error')),
      },
    );
  }, [statusMutation, selectedPendingReceiptIds, t]);

  const handleBulkPending = useCallback(() => {
    statusMutation.mutate(
      { ids: selectedIssuedReceiptIds, status: CashReceiptIssueStatus.PENDING },
      {
        onSuccess: (res) => {
          toast.success(t('orders.cash_receipts.messages.bulk_pending_success', { count: res.data.updated_count }));
          setGeneratedSelection({});
          setOpenDialog(null);
        },
        onError: () => toast.error(t('orders.cash_receipts.messages.bulk_pending_error')),
      },
    );
  }, [statusMutation, selectedIssuedReceiptIds, t]);

  const handleBulkArchive = useCallback(() => {
    statusMutation.mutate(
      { ids: selectedGeneratedReceiptIds, status: CashReceiptIssueStatus.DELETED },
      {
        onSuccess: (res) => {
          toast.success(t('orders.cash_receipts.messages.bulk_archive_success', { count: res.data.updated_count }));
          setGeneratedSelection({});
          setOpenDialog(null);
        },
        onError: () => toast.error(t('orders.cash_receipts.messages.bulk_archive_error')),
      },
    );
  }, [statusMutation, selectedGeneratedReceiptIds, t]);

  const handleExport = useCallback(() => {
    if (isExporting) return;
    void startExport();
  }, [isExporting, startExport]);

  const originalColumns = useMemo(() => getOriginalOrderColumns({ t }), [t]);
  const generatedColumns = useMemo(
    () => getCashReceiptColumns({ t, onIssue: handleIssue, onPending: handlePending, onDelete: handleRequestDelete, busyId }),
    [t, handleIssue, handlePending, handleRequestDelete, busyId],
  );

  const handleSwitchTab = useCallback(
    (tab: CashReceiptTab) => {
      setOriginalSelection({});
      setGeneratedSelection({});
      void navigate({ search: () => ({ tab }) });
    },
    [navigate],
  );
  const handleApplyFilters = useCallback(
    (values: CashReceiptSearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          ...values,
          order_code: activeTab === CashReceiptTab.ORIGINAL ? undefined : values.order_code,
          issue_status: activeTab === CashReceiptTab.ORIGINAL ? undefined : values.issue_status,
          is_generated: activeTab === CashReceiptTab.ORIGINAL ? values.is_generated : undefined,
          page: undefined,
        }),
      });
    },
    [activeTab, navigate],
  );
  const handleResetFilters = useCallback(() => {
    void navigate({
      search: (previous) => ({ tab: previous.tab, per_page: previous.per_page, sort_by: previous.sort_by, sort_order: previous.sort_order }),
    });
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

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void currentQuery.refetch()} disabled={currentQuery.isFetching} className='gap-2'>
      {currentQuery.isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('orders.cash_receipts.retry')}
    </Button>
  );

  // === Render ===
  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('orders.cash_receipts.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('orders.cash_receipts.description')}</p> */}
        </div>
        {activeTab === CashReceiptTab.GENERATED ? (
          <div className='flex flex-wrap justify-end gap-2'>
            <Button variant='outline' size='sm' className='gap-1.5' onClick={handleExport}>
              <FileDown className='size-4' />
              {tCommon('export.button')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='gap-1.5'
              onClick={() => setOpenDialog('issue')}
              disabled={selectedPendingReceiptIds.length === 0}
            >
              <Send className='size-4' />
              {t('orders.cash_receipts.actions.issue')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='gap-1.5'
              onClick={() => setOpenDialog('pending')}
              disabled={selectedIssuedReceiptIds.length === 0}
            >
              <RotateCcw className='size-3.5' />
              {t('orders.cash_receipts.actions.pending')}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              className='gap-1.5'
              onClick={() => setOpenDialog('archive')}
              disabled={selectedGeneratedReceiptIds.length === 0}
            >
              <Trash2 className='size-4' />
              {t('orders.cash_receipts.actions.archive')}
            </Button>
          </div>
        ) : activeTab === CashReceiptTab.ORIGINAL ? (
          <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setOpenDialog('create')} disabled={generateMutation.isPending}>
            <FilePlus2 className='size-4' />
            {t('orders.cash_receipts.actions.create')}
          </Button>
        ) : null}
      </div>
      <Separator />

      <div className='space-y-4'>
        <div className='inline-flex gap-2 rounded-lg border p-1'>
          <Button
            variant={activeTab === CashReceiptTab.ORIGINAL ? 'default' : 'ghost'}
            size='sm'
            onClick={() => handleSwitchTab(CashReceiptTab.ORIGINAL)}
          >
            {t('orders.cash_receipts.tabs.original')}
          </Button>
          <Button
            variant={activeTab === CashReceiptTab.GENERATED ? 'default' : 'ghost'}
            size='sm'
            onClick={() => handleSwitchTab(CashReceiptTab.GENERATED)}
          >
            {t('orders.cash_receipts.tabs.generated')}
          </Button>
        </div>

        <CashReceiptSearchFilters mode={activeTab} initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {currentQuery.isError && !currentQuery.data ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('orders.cash_receipts.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('orders.cash_receipts.error.load_description')}</p>
            </div>
            {renderRetryButton()}
          </div>
        ) : (
          <>
            {currentQuery.isError && currentQuery.data ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('orders.cash_receipts.error.refresh')}</p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            {activeTab === CashReceiptTab.GENERATED ? (
              <DataTable
                data={generatedItems}
                columns={generatedColumns}
                state={{ pagination: tablePagination, sorting: [] }}
                pageInfo={{ pageCount: generatedQuery.data?.pagination?.total_page ?? 0, rowCount: generatedQuery.data?.pagination?.total_item ?? 0 }}
                onPaginationChange={handlePaginationChange}
                onSortingChange={() => {}}
                isLoading={generatedQuery.isLoading}
                getRowId={(row) => String(row.id)}
                enableRowSelection
                rowSelection={generatedSelection}
                onRowSelectionChange={setGeneratedSelection}
              />
            ) : (
              <DataTable
                data={originalItems}
                columns={originalColumns}
                state={{ pagination: tablePagination, sorting: [] }}
                pageInfo={{ pageCount: originalQuery.data?.pagination?.total_page ?? 0, rowCount: originalQuery.data?.pagination?.total_item ?? 0 }}
                onPaginationChange={handlePaginationChange}
                onSortingChange={() => {}}
                isLoading={originalQuery.isLoading}
                getRowId={(row) => String(row.id)}
                enableRowSelection
                rowSelection={originalSelection}
                onRowSelectionChange={setOriginalSelection}
              />
            )}
          </>
        )}
      </div>

      <CashReceiptActionDialog
        isOpen={openDialog === 'create'}
        title={t('orders.cash_receipts.create_dialog.title')}
        description={t('orders.cash_receipts.create_dialog.description')}
        confirmText={t('orders.cash_receipts.create_dialog.confirm')}
        isPending={generateMutation.isPending}
        items={selectedOrderNumbers}
        note={createNote}
        onNoteChange={setCreateNote}
        onClose={() => {
          setOpenDialog(null);
          setCreateNote('');
        }}
        onConfirm={() => void handleCreate()}
      />

      <CashReceiptActionDialog
        isOpen={openDialog === 'delete'}
        title={t('orders.cash_receipts.archive_dialog.title')}
        description={t('orders.cash_receipts.archive_dialog.description')}
        confirmText={t('orders.cash_receipts.archive_dialog.confirm')}
        variant='destructive'
        isPending={deleteMutation.isPending}
        onClose={() => {
          setOpenDialog(null);
          setDeleteTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <CashReceiptActionDialog
        isOpen={openDialog === 'issue'}
        title={t('orders.cash_receipts.issue_dialog.title')}
        description={t('orders.cash_receipts.issue_dialog.description')}
        confirmText={t('orders.cash_receipts.issue_dialog.confirm')}
        isPending={statusMutation.isPending}
        onClose={() => setOpenDialog(null)}
        onConfirm={() => void handleBulkIssue()}
      />

      <CashReceiptActionDialog
        isOpen={openDialog === 'pending'}
        title={t('orders.cash_receipts.pending_dialog.title')}
        description={t('orders.cash_receipts.pending_dialog.description')}
        confirmText={t('orders.cash_receipts.pending_dialog.confirm')}
        isPending={statusMutation.isPending}
        onClose={() => setOpenDialog(null)}
        onConfirm={() => void handleBulkPending()}
      />

      <CashReceiptActionDialog
        isOpen={openDialog === 'archive'}
        title={t('orders.cash_receipts.archive_dialog.title')}
        description={t('orders.cash_receipts.archive_dialog.description')}
        confirmText={t('orders.cash_receipts.archive_dialog.confirm')}
        variant='destructive'
        isPending={statusMutation.isPending}
        onClose={() => setOpenDialog(null)}
        onConfirm={() => void handleBulkArchive()}
      />
    </PageContainer>
  );
}
