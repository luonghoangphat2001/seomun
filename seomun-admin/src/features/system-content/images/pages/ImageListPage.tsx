import { Link, getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type SortingState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import { useDeleteImageMutation, useImagesFilterQuery, useImagesQuery } from '../api';
import { getImageColumns } from '../components/ImageColumns';
import { ImageSearchFilters } from '../components/ImageSearchFilters';
import type { ImageSearchFilterValues } from '../schemas';
import { buildImageListParams, isImageSortField } from '../utils';

// === Variables ===

const routeApi = getRouteApi('/system-content/images/');

// === Component ===

export function ImageListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMsg } = useTranslation('message');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const queryParams = useMemo(() => buildImageListParams(search), [search]);

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );

  const tableSorting = useMemo<SortingState>(
    () => (queryParams.sort_by ? [{ id: queryParams.sort_by, desc: queryParams.sort_order === SortOrder.DESC }] : []),
    [queryParams.sort_by, queryParams.sort_order],
  );

  const appliedFilters = useMemo<ImageSearchFilterValues>(
    () => ({
      name: search.name,
      type: search.type,
      created_by: search.created_by,
      start_date: search.start_date,
      end_date: search.end_date,
    }),
    [search],
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: response, isError, isFetching, isLoading, refetch } = useImagesQuery(queryParams);
  const { data: filterData } = useImagesFilterQuery();
  const deleteMutation = useDeleteImageMutation();

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(tMsg('images.delete.success', 'Image deleted.'));
        setDeleteId(null);
      },
      onError: () => {
        toast.error(tMsg('images.delete.error', 'Failed to delete image.'));
        setDeleteId(null);
      },
    });
  };

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const columns = useMemo(() => getImageColumns({ t, tCommon }), [t, tCommon]);

  const handleApplyFilters = useCallback(
    (values: ImageSearchFilterValues) => {
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
      const nextSortBy = nextSort && isImageSortField(nextSort.id) ? nextSort.id : undefined;
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

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('images.list.retry', 'Retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('images.list.title', 'Image Management')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('images.list.description', 'Manage uploaded images by page category.')}</p> */}
        </div>
        <div className='flex items-center gap-2'>
          <Button size='sm' className='gap-1.5' asChild>
            <Link to='/system-content/images/create'>
              <Plus className='size-4' />
              {t('images.list.add_button', 'Upload Image')}
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className='space-y-4'>
        <ImageSearchFilters initialValues={appliedFilters} filterData={filterData} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('images.list.error.load_title', 'Unable to load images')}</h2>
              <p className='text-muted-foreground text-sm'>{t('images.list.error.load_description', 'The request failed. Please try again.')}</p>
            </div>
            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('images.list.error.refresh', 'Unable to refresh image list. Showing previous data.')}</p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data?.files ?? []}
              columns={columns}
              state={{ pagination: tablePagination, sorting: tableSorting }}
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
        isOpen={!!deleteId}
        setIsOpen={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={tCommon('action.delete')}
        confirmLoading={deleteMutation.isPending}
        footer={
          <>
            <AppButton variant='outline' onClick={() => setDeleteId(null)} disabled={deleteMutation.isPending}>
              {tCommon('action.cancel')}
            </AppButton>
            <AppButton variant='destructive' onClick={handleDeleteConfirm} isLoading={deleteMutation.isPending}>
              {tCommon('action.delete')}
            </AppButton>
          </>
        }
      >
        <p className='text-sm'>{t('images.list.confirm_delete', 'Are you sure you want to delete this file?')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
