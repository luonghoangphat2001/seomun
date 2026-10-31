import { Link, getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type SortingState, type Updater } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
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

import { useDeleteNoticeMutation, useNoticesFilterQuery, useNoticesQuery } from '../api';
import { getNoticeColumns } from '../components/NoticeColumns';
import { NoticeSearchFilters } from '../components/NoticeSearchFilters';
import type { NoticeSearchFilterValues } from '../schemas';
import { buildNoticeListParams, isNoticeSortField } from '../utils';

const routeApi = getRouteApi('/system-content/notices/');

export function NoticeListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMsg } = useTranslation('message');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const queryParams = useMemo(() => buildNoticeListParams(search), [search]);

  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );

  const tableSorting = useMemo<SortingState>(
    () => (queryParams.sort_by ? [{ id: queryParams.sort_by, desc: queryParams.sort_order === SortOrder.DESC }] : []),
    [queryParams.sort_by, queryParams.sort_order],
  );

  const initialFilterValues = useMemo<NoticeSearchFilterValues>(
    () => ({
      search_term: search.search_term,
      author_id: search.author_id,
      type: search.type,
      exposure_status: search.exposure_status,
      exposure_location: search.exposure_location,
    }),
    [search],
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: response, isLoading } = useNoticesQuery(queryParams);
  const { data: filterData } = useNoticesFilterQuery();
  const deleteMutation = useDeleteNoticeMutation();

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(tMsg('notices.delete.success'));
        setDeleteId(null);
      },
      onError: () => {
        toast.error(tMsg('notices.delete.error'));
        setDeleteId(null);
      },
    });
  };

  const columns = useMemo(
    () => getNoticeColumns({ t, tCommon, getEditTo: (id) => `/system-content/notices/${id}`, onDelete: handleDelete }),
    [t, tCommon, handleDelete],
  );

  const handleApplyFilters = useCallback(
    (values: NoticeSearchFilterValues) => {
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
      const nextSortBy = nextSort && isNoticeSortField(nextSort.id) ? nextSort.id : undefined;
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

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('notices.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('notices.list.description')}</p> */}
        </div>
        <Button size='sm' className='gap-1.5' asChild>
          <Link to='/system-content/notices/create'>
            <Plus className='size-4' />
            {t('notices.list.add_button')}
          </Link>
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <NoticeSearchFilters initialValues={initialFilterValues} filterData={filterData} onSearch={handleApplyFilters} onReset={handleResetFilters} />
        <DataTable
          data={response?.data?.notices ?? []}
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
        <p className='text-sm'>{t('notices.list.confirm_delete')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
