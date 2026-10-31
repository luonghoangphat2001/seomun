import { getRouteApi } from '@tanstack/react-router';
import { AlertCircle, AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useListPageState } from '@/hooks/useListPageState';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatDateOnly, parseDate } from '@/utils/format-date';

import { useCouponsQuery, useDeleteCouponMutation, useUpdateCouponStatusMutation } from '../api/coupon.query';
import type { Coupon } from '../api/coupon.response';
import { getCouponColumns } from '../components/CouponColumns';
import { CouponFormDialog } from '../components/CouponFormDialog';
import { CouponIssueDialog } from '../components/CouponIssueDialog';
import { CouponSearchFilters } from '../components/CouponSearchFilters';
import { CouponSortField } from '../enums';
import type { CouponListSearch, CouponSearchFilterValues } from '../schemas';
import { buildCouponListParams } from '../utils/coupon-list-params';

const routeApi = getRouteApi('/orders/coupons/');

const COUPON_SORT_FIELDS = Object.values(CouponSortField);

export function CouponListPage() {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const mapSearchToFilters = useCallback(
    (currentSearch: CouponListSearch): CouponSearchFilterValues => ({
      search_term: currentSearch.search_term ?? '',
      discount_type: currentSearch.discount_type,
      is_active: currentSearch.is_active,
      validity_status: currentSearch.validity_status,
      starts_at_from: parseDate(currentSearch.starts_at_from),
      starts_at_to: parseDate(currentSearch.starts_at_to),
      expires_at_from: parseDate(currentSearch.expires_at_from),
      expires_at_to: parseDate(currentSearch.expires_at_to),
    }),
    [],
  );

  const mapFiltersToSearch = useCallback(
    (values: CouponSearchFilterValues) => ({
      search_term: values.search_term.trim() || undefined,
      discount_type: values.discount_type,
      is_active: values.is_active,
      validity_status: values.validity_status,
      starts_at_from: formatDateOnly(values.starts_at_from),
      starts_at_to: formatDateOnly(values.starts_at_to),
      expires_at_from: formatDateOnly(values.expires_at_from),
      expires_at_to: formatDateOnly(values.expires_at_to),
    }),
    [],
  );

  const resetSearch = useCallback(
    (previous: CouponListSearch): CouponListSearch => ({
      ...previous,
      page: undefined,
      search_term: undefined,
      discount_type: undefined,
      is_active: undefined,
      validity_status: undefined,
      starts_at_from: undefined,
      starts_at_to: undefined,
      expires_at_from: undefined,
      expires_at_to: undefined,
    }),
    [],
  );

  const parseSortField = useCallback((columnId: string) => COUPON_SORT_FIELDS.find((field) => field === columnId), []);

  const list = useListPageState({
    search,
    navigate,
    buildQueryParams: buildCouponListParams,
    mapSearchToFilters,
    mapFiltersToSearch,
    resetSearch,
    parseSortField,
  });

  const { data: response, isError, isFetching, isLoading, refetch } = useCouponsQuery(list.queryParams);

  // ============================================================================
  // State
  // ============================================================================
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
  const [issuingCoupon, setIssuingCoupon] = useState<Coupon | undefined>(undefined);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | undefined>(undefined);
  const [togglingCouponId, setTogglingCouponId] = useState<number | undefined>(undefined);

  // ============================================================================
  // Hooks (state-dependent)
  // ============================================================================
  const deleteMutation = useDeleteCouponMutation({
    onSuccess: () => {
      toast.success(t('orders.coupons.messages.delete_success'));
      setDeletingCoupon(undefined);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('orders.coupons.messages.delete_error')));
      setDeletingCoupon(undefined);
    },
  });

  const statusMutation = useUpdateCouponStatusMutation({
    onSuccess: () => toast.success(t('orders.coupons.messages.status_success')),
    onError: (error) => toast.error(getApiErrorMessage(error, t('orders.coupons.messages.status_error'))),
    onSettled: () => setTogglingCouponId(undefined),
  });

  // ============================================================================
  // Functions
  // ============================================================================
  const handleCreate = useCallback(() => {
    setEditingCoupon(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  }, []);

  const handleDetail = useCallback(
    (coupon: Coupon) => void navigate({ to: '/orders/coupons/$couponId', params: { couponId: String(coupon.id) } }),
    [navigate],
  );

  const handleToggleStatus = useCallback(
    (coupon: Coupon) => {
      setTogglingCouponId(coupon.id);
      statusMutation.mutate({ couponId: coupon.id, is_active: !coupon.is_active });
    },
    [statusMutation],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingCoupon) return;
    deleteMutation.mutate(deletingCoupon.id);
  }, [deletingCoupon, deleteMutation]);

  const columns = useMemo(
    () =>
      getCouponColumns({
        t,
        tCommon,
        togglingCouponId,
        onEdit: handleEdit,
        onIssue: setIssuingCoupon,
        onDelete: setDeletingCoupon,
        onToggleStatus: handleToggleStatus,
      }),
    [t, tCommon, togglingCouponId, handleEdit, handleToggleStatus],
  );

  // ============================================================================
  // Variables
  // ============================================================================
  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {tCommon('action.retry')}
    </Button>
  );

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('orders.coupons.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('orders.coupons.list.description')}</p> */}
        </div>

        <AppButton size='sm' className='gap-1.5' leftIcon={<Plus className='size-4' />} onClick={handleCreate}>
          {t('orders.coupons.actions.create')}
        </AppButton>
      </div>

      <Separator />

      <div className='space-y-4'>
        <CouponSearchFilters initialValues={list.appliedFilters} onSearch={list.applyFilters} onReset={list.resetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('orders.coupons.list.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('orders.coupons.list.error.load_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('orders.coupons.list.error.refresh')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data.coupons ?? []}
              columns={columns}
              state={list.tableState}
              pageInfo={{
                pageCount: response?.pagination.total_page ?? 0,
                rowCount: response?.pagination.total_item ?? 0,
              }}
              onPaginationChange={list.onPaginationChange}
              onSortingChange={list.onSortingChange}
              isLoading={isLoading}
              enableRowSelection={false}
              getRowId={(row) => String(row.id)}
              onRowClick={handleDetail}
            />
          </>
        )}
      </div>

      <CouponFormDialog isOpen={isFormOpen} editCoupon={editingCoupon} onClose={() => setIsFormOpen(false)} />

      {/* Mounted only while open so its member/tier lookups don't fire on page load. */}
      {issuingCoupon ? <CouponIssueDialog coupon={issuingCoupon} onClose={() => setIssuingCoupon(undefined)} /> : null}

      <AppDialogModal
        isOpen={deletingCoupon !== undefined}
        setIsOpen={(open) => !open && setDeletingCoupon(undefined)}
        title={t('orders.coupons.delete.title')}
        width={480}
        confirmLoading={deleteMutation.isPending}
        footer={
          <>
            <Button type='button' variant='outline' onClick={() => setDeletingCoupon(undefined)} disabled={deleteMutation.isPending}>
              {tCommon('action.cancel')}
            </Button>

            <AppButton type='button' variant='destructive' isLoading={deleteMutation.isPending} onClick={handleDeleteConfirm}>
              {tCommon('action.delete')}
            </AppButton>
          </>
        }
      >
        <div className='space-y-3 py-2'>
          <div className='text-destructive flex items-center gap-2 text-sm font-medium'>
            <AlertTriangle className='size-4' />
            {t('orders.coupons.delete.warning')}
          </div>

          <p className='text-muted-foreground text-sm'>{t('orders.coupons.delete.confirm', { name: deletingCoupon?.name ?? '' })}</p>
        </div>
      </AppDialogModal>
    </PageContainer>
  );
}
