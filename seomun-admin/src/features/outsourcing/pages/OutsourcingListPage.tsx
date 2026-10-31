import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type OnChangeFn, type PaginationState, type SortingState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { useDeleteOutsourcingMutation, useOutsourcingQuery } from '@/features/outsourcing/api';
import { getOutsourcingColumns } from '@/features/outsourcing/components/OutsourcingColumns';
import { OutsourcingSearchFilters } from '@/features/outsourcing/components/OutsourcingSearchFilters';
import type { OutsourcingListSearch } from '@/features/outsourcing/schemas';
import { buildOutsourcingListParams } from '@/features/outsourcing/utils/outsourcing-list-params';

const routeApi = getRouteApi('/outsourcing/');

type OutsourcingListPageProps = {
  createPath: string;
  getDetailTo: (outsourcingId: string) => string;
  getEditTo: (outsourcingId: string) => string;
};

export function OutsourcingListPage({ createPath, getDetailTo, getEditTo }: OutsourcingListPageProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMessage } = useTranslation('message');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const deleteMutation = useDeleteOutsourcingMutation();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const queryParams = buildOutsourcingListParams(search);

  const { data: response, isLoading } = useOutsourcingQuery(queryParams);
  const columns = useMemo(
    () =>
      getOutsourcingColumns({
        getDetailTo,
        getEditTo,
        isDeleting: deleteMutation.isPending,
        t,
        onDelete: (outsourcingId) => {
          setPendingDeleteId(outsourcingId);
        },
      }),
    [deleteMutation, getDetailTo, getEditTo, t],
  );

  const handleConfirmDelete = () => {
    if (pendingDeleteId == null) {
      return;
    }

    deleteMutation.mutate(pendingDeleteId, {
      onSuccess: (data) => {
        toast.success(data.message || tMessage('outsourcing.delete.success'));
        setPendingDeleteId(null);
      },
      onError: (error) => {
        toast.error(error.response?.data.message || error.response?.data.error || tMessage('outsourcing.delete.error'));
      },
    });
  };

  const tableState = {
    pagination: {
      pageIndex: queryParams.page - DEFAULT_PAGE,
      pageSize: queryParams.per_page,
    } satisfies PaginationState,
    sorting: [],
  } satisfies {
    pagination: PaginationState;
    sorting: SortingState;
  };

  const pageInfo = {
    pageCount: response?.pagination.total_page ?? 0,
    rowCount: response?.pagination.total_item ?? 0,
  };

  const handleFilterSearch = (values: Pick<OutsourcingListSearch, 'search_type' | 'keyword' | 'is_active'>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...values,
        page: undefined,
      }),
    });
  };

  const handleFilterReset = () => {
    navigate({
      search: (prev) => ({
        per_page: prev.per_page,
        page: undefined,
      }),
    });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const next = functionalUpdate(updaterOrValue, tableState.pagination);

    navigate({
      search: (prev) => ({
        ...prev,
        page: next.pageIndex + 1 === DEFAULT_PAGE ? undefined : next.pageIndex + 1,
        per_page: next.pageSize === DEFAULT_PER_PAGE ? undefined : next.pageSize,
      }),
    });
  };

  const handleSortingChange: OnChangeFn<SortingState> = () => {};

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('outsourcing.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('outsourcing.list.description')}</p> */}
        </div>
        <Button size='sm' className='gap-1.5' onClick={() => void navigate({ to: createPath })}>
          <Plus className='size-4' />
          {t('outsourcing.list.add_button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <OutsourcingSearchFilters initialValues={search} onSearch={handleFilterSearch} onReset={handleFilterReset} />
        <DataTable
          data={response?.data.outsourcing_companies ?? []}
          columns={columns}
          state={tableState}
          pageInfo={pageInfo}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          isLoading={isLoading}
          getRowId={(row) => String(row.id)}
          enableRowSelection={false}
        />
      </div>

      <AppDialogModal
        isOpen={pendingDeleteId !== null}
        setIsOpen={(open) => {
          if (!open && !deleteMutation.isPending) {
            setPendingDeleteId(null);
          }
        }}
        title={t('outsourcing.delete_dialog.title')}
        okText={tCommon('action.delete')}
        cancelText={tCommon('action.cancel')}
        confirmLoading={deleteMutation.isPending}
        onOk={handleConfirmDelete}
      >
        <p className='text-sm'>{t('outsourcing.delete_dialog.description')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
