import { Link, getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type OnChangeFn, type PaginationState, type SortingState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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

import { usePopupsFilterQuery, usePopupsQuery, useDeletePopupMutation } from '../api';
import { getPopupColumns } from '../components/PopupColumns';
import { PopupSearchFilters } from '../components/PopupSearchFilters';
import type { PopupSortField } from '../enums';
import { EMPTY_POPUP_SEARCH_FILTER_VALUES, type PopupListSearch, type PopupSearchFilterValues } from '../schemas';

const routeApi = getRouteApi('/system-content/popups/');

export function PopupListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMessage } = useTranslation('message');

  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryParams = {
    ...search,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };

  const { data: response, isLoading } = usePopupsQuery(queryParams);
  const { data: filterData } = usePopupsFilterQuery();
  const deleteMutation = useDeletePopupMutation();

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(tMessage('popups.delete.success'));
        setDeleteId(null);
      },
      onError: () => {
        toast.error(tMessage('popups.delete.error'));
        setDeleteId(null);
      },
    });
  };

  const columns = getPopupColumns({
    t,
    tCommon,
    getEditTo: (id) => `/system-content/popups/${id}`,
    onDelete: (id) => setDeleteId(id),
  });

  const tableState = {
    pagination: {
      pageIndex: queryParams.page - DEFAULT_PAGE,
      pageSize: queryParams.per_page,
    } satisfies PaginationState,
    sorting: search.sort_by ? [{ id: search.sort_by, desc: search.sort_order === SortOrder.DESC }] : [],
  } satisfies {
    pagination: PaginationState;
    sorting: SortingState;
  };

  const pageInfo = {
    pageCount: response?.pagination?.total_page ?? 0,
    rowCount: response?.pagination?.total_item ?? 0,
  };

  const handleFilterSearch = (values: PopupSearchFilterValues) => {
    navigate({
      search: (prev: PopupListSearch) => ({
        ...prev,
        ...values,
        page: undefined,
      }),
    });
  };

  const handleFilterReset = () => {
    navigate({
      search: (prev: PopupListSearch) => ({
        ...EMPTY_POPUP_SEARCH_FILTER_VALUES,
        per_page: prev.per_page,
        sort_by: prev.sort_by,
        sort_order: prev.sort_order,
        page: undefined,
      }),
    });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const next = functionalUpdate(updaterOrValue, tableState.pagination);

    navigate({
      search: (prev: PopupListSearch) => ({
        ...prev,
        page: next.pageIndex + 1 === DEFAULT_PAGE ? undefined : next.pageIndex + 1,
        per_page: next.pageSize === DEFAULT_PER_PAGE ? undefined : next.pageSize,
      }),
    });
  };

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const next = functionalUpdate(updaterOrValue, tableState.sorting);
    const firstSort = next[0];

    navigate({
      search: (prev: PopupListSearch) => ({
        ...prev,
        sort_by: firstSort ? (firstSort.id as PopupSortField) : undefined,
        sort_order: firstSort ? (firstSort.desc ? SortOrder.DESC : SortOrder.ASC) : undefined,
        page: undefined,
      }),
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('popups.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('popups.list.description')}</p> */}
        </div>
        <Button size='sm' className='gap-1.5' asChild>
          <Link to='/system-content/popups/create'>
            <Plus className='size-4' />
            {t('popups.list.add_button')}
          </Link>
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <PopupSearchFilters
          initialValues={{
            popup_name: search.popup_name,
            exposure_location: search.exposure_location,
            status: search.status,
            registrant_id: search.registrant_id,
            exposure_period_from: search.exposure_period_from,
            exposure_period_to: search.exposure_period_to,
          }}
          filterData={filterData}
          onSearch={handleFilterSearch}
          onReset={handleFilterReset}
        />
        <DataTable
          data={response?.data?.popups ?? []}
          columns={columns}
          state={tableState}
          pageInfo={pageInfo}
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
        <p className='text-sm'>{t('popups.list.confirm_delete')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
