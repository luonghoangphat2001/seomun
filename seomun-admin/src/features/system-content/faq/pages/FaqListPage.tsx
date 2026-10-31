import { Link, getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type SortingState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import { useDeleteFaqMutation, useFaqsFilterQuery, useFaqsQuery } from '../api/faq.query';
import { getFaqColumns } from '../components/FaqColumns';
import { FaqSearchFilters } from '../components/FaqSearchFilters';
import { buildFaqListParams, isFaqSortField } from '../utils';
import type { FaqSearchFilterValues } from '../schemas';

const routeApi = getRouteApi('/system-content/faqs/');

export function FaqListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMessage } = useTranslation('message');

  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const queryParams = useMemo(() => buildFaqListParams(search), [search]);

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

  const appliedFilters = useMemo<FaqSearchFilterValues>(
    () => ({
      title: search.title,
      faq_category: search.faq_category,
      author_id: search.author_id,
      posting_status: search.posting_status,
      registration_date_from: search.registration_date_from,
      registration_date_to: search.registration_date_to,
    }),
    [search],
  );

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: response, isError, isFetching, isLoading, refetch } = useFaqsQuery(queryParams);
  const { data: filterData } = useFaqsFilterQuery();
  const deleteMutation = useDeleteFaqMutation();

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleDelete = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const handleDeleteConfirm = () => {
    if (!pendingDeleteId) return;
    deleteMutation.mutate(pendingDeleteId, {
      onSuccess: () => {
        toast.success(tMessage('faqs.delete.success'));
        setPendingDeleteId(null);
      },
      onError: () => {
        toast.error(tMessage('faqs.delete.error'));
        setPendingDeleteId(null);
      },
    });
  };

  const columns = useMemo(() => getFaqColumns({ t, tCommon, onDelete: handleDelete }), [t, tCommon, handleDelete]);

  const handleApplyFilters = useCallback(
    (values: FaqSearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          ...values,
          page: undefined,
        }),
      });
    },
    [navigate],
  );

  const handleResetFilters = useCallback(() => {
    void navigate({
      search: (previous) => ({
        per_page: previous.per_page,
        sort_by: previous.sort_by,
        sort_order: previous.sort_order,
        page: undefined,
      }),
    });
  }, [navigate]);

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = functionalUpdate(updater, tableSorting);
      const nextSort = nextSorting[0];
      const nextSortBy = nextSort && isFaqSortField(nextSort.id) ? nextSort.id : undefined;

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
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('faqs.list.retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('faqs.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('faqs.list.description')}</p> */}
        </div>

        <Button size='sm' className='gap-1.5' asChild>
          <Link to='/system-content/faqs/create'>
            <Plus className='size-4' />
            {t('faqs.list.add_button')}
          </Link>
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <FaqSearchFilters initialValues={appliedFilters} filterData={filterData} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('faqs.list.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('faqs.list.error.load_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('faqs.list.error.refresh')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data?.faqs ?? []}
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
              isLoading={isLoading}
              getRowId={(row) => String(row.id)}
            />
          </>
        )}
      </div>
      <AppDialogModal
        isOpen={!!pendingDeleteId}
        setIsOpen={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        title={tCommon('action.delete')}
        confirmLoading={deleteMutation.isPending}
        footer={
          <>
            <AppButton variant='outline' onClick={() => setPendingDeleteId(null)} disabled={deleteMutation.isPending}>
              {tCommon('action.cancel')}
            </AppButton>
            <AppButton variant='destructive' onClick={handleDeleteConfirm} isLoading={deleteMutation.isPending}>
              {tCommon('action.delete')}
            </AppButton>
          </>
        }
      >
        <p className='text-sm'>{t('faqs.list.confirm_delete')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
