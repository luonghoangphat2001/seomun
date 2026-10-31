import { getRouteApi, useNavigate as useGlobalNavigate } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type SortingState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal/AppDialogModal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import { useDeleteUserLimitMutation, useUserLimitListQuery } from '../api/post-payment-limit.query';
import { getPostPaymentLimitColumns } from '../components/PostPaymentLimitColumns';
import { PostPaymentLimitDialog } from '../components/PostPaymentLimitDialog';
import { PostPaymentLimitSearchFilters } from '../components/PostPaymentLimitSearchFilters';
import { UserLimitDetailDialog } from '../components/UserLimitDetailDialog';
import type { UserLimitRESP } from '../api/post-payment-limit.response';
import type { PostPaymentLimitSearchFilterValues } from '../schemas';
import { buildUserLimitListParams } from '../utils';

const routeApi = getRouteApi('/payments/limits');

export function PostPaymentLimitListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMsg } = useTranslation('message');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const globalNavigate = useGlobalNavigate();

  const queryParams = useMemo(() => buildUserLimitListParams(search), [search]);

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );

  const tableSorting = useMemo<SortingState>(() => [], []);

  const appliedFilters = useMemo<PostPaymentLimitSearchFilterValues>(() => ({ name: search.name, status: search.status }), [search]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserLimitRESP | null>(null);
  const [detailTargetId, setDetailTargetId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserLimitRESP | null>(null);

  const { data: response, isError, isFetching, isLoading, refetch } = useUserLimitListQuery(queryParams);
  const deleteMutation = useDeleteUserLimitMutation();

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleApplyFilters = useCallback(
    (values: PostPaymentLimitSearchFilterValues) => {
      void navigate({ search: (prev) => ({ ...prev, ...values, page: undefined }) });
    },
    [navigate],
  );

  const handleResetFilters = useCallback(() => {
    void navigate({ search: { per_page: queryParams.per_page === DEFAULT_PER_PAGE ? undefined : queryParams.per_page } });
  }, [navigate, queryParams.per_page]);

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const next = functionalUpdate(updater, tablePagination);
      const nextPage = Math.max(next.pageIndex + 1, DEFAULT_PAGE);
      const nextPageSize = Math.max(next.pageSize, 1);
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

  const handleViewDetail = useCallback((row: UserLimitRESP) => setDetailTargetId(row.id), []);

  const handleEdit = useCallback((row: UserLimitRESP) => setEditTarget(row), []);

  const handleDelete = useCallback((row: UserLimitRESP) => setDeleteTarget(row), []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(tMsg('post_payment_limit.delete.success', 'Limit deleted.'));
        setDeleteTarget(null);
      },
      onError: () => toast.error(tMsg('post_payment_limit.delete.error', 'Failed to delete limit.')),
    });
  }, [deleteMutation, deleteTarget, tMsg]);

  const handleViewPaymentHistory = useCallback(
    (row: UserLimitRESP) => {
      // Navigate to payment list pre-filtered by this customer
      void globalNavigate({
        to: '/payments' as never,
        search: { customer_name: row.customer?.name } as never,
      });
    },
    [globalNavigate],
  );

  const columns = useMemo(
    () =>
      getPostPaymentLimitColumns({
        t,
        tCommon,
        onViewDetail: handleViewDetail,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onViewPaymentHistory: handleViewPaymentHistory,
      }),
    [t, tCommon, handleViewDetail, handleEdit, handleDelete, handleViewPaymentHistory],
  );

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('post_payment_limit.retry', 'Retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('post_payment_limit.title', 'Postpaid Limits')}</h1>
          <p className='text-muted-foreground mt-0.5 text-sm'>
            {t('post_payment_limit.description', 'Manage postpaid credit limits assigned to users.')}
          </p>
        </div>
        <Button size='sm' className='gap-1.5' onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='size-4' />
          {t('post_payment_limit.add_button', 'Add Limit')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <PostPaymentLimitSearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('post_payment_limit.error.load_title', 'Unable to load limits')}</h2>
              <p className='text-muted-foreground text-sm'>
                {t('post_payment_limit.error.load_description', 'The request failed. Please try again.')}
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
                  <p className='text-sm font-medium'>{t('post_payment_limit.error.refresh', 'Unable to refresh list. Showing previous data.')}</p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data?.limit ?? []}
              columns={columns}
              enableRowSelection={false}
              state={{ pagination: tablePagination, sorting: tableSorting }}
              pageInfo={{
                pageCount: response?.pagination?.total_page ?? 0,
                rowCount: response?.pagination?.total_item ?? 0,
              }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={() => {}}
              isLoading={isLoading}
              getRowId={(row) => String(row.id)}
            />
          </>
        )}
      </div>

      <PostPaymentLimitDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />

      <PostPaymentLimitDialog editId={editTarget?.id} open={editTarget !== null} onClose={() => setEditTarget(null)} />

      <UserLimitDetailDialog id={detailTargetId} onClose={() => setDetailTargetId(null)} />

      <AppDialogModal
        isOpen={deleteTarget !== null}
        setIsOpen={(open) => !open && setDeleteTarget(null)}
        title={t('post_payment_limit.confirm_delete_title', 'Delete Limit')}
        onOk={handleDeleteConfirm}
        okText={tCommon('action.delete')}
        cancelText={tCommon('action.cancel')}
        confirmLoading={deleteMutation.isPending}
        width={480}
      >
        <p className='py-3 text-sm text-gray-600'>
          {deleteTarget?.customer?.name
            ? t('post_payment_limit.confirm_delete_with_name', {
                name: deleteTarget.customer.name,
                defaultValue: `Are you sure you want to delete the limit for "${deleteTarget.customer.name}"?`,
              })
            : t('post_payment_limit.confirm_delete', 'Delete this limit?')}
        </p>
      </AppDialogModal>
    </PageContainer>
  );
}
