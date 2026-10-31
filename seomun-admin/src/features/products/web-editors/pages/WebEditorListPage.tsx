import { getRouteApi } from '@tanstack/react-router';
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
import { useListPageState } from '@/hooks/useListPageState';

import { useCreateWebEditorMutation, useDeleteWebEditorMutation, useWebEditorsQuery } from '../api';
import { getWebEditorColumns } from '../components/WebEditorColumns';
import { WebEditorModal } from '../components/WebEditorModal';
import { WebEditorSearchFilters } from '../components/WebEditorSearchFilters';
import { buildWebEditorListParams } from '../utils';
import type { CreateWebEditorFormValues, WebEditorFilterValues } from '../schemas';

const routeApi = getRouteApi('/products/web-editors');

export function WebEditorListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  // === State ===
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // === Hooks ===
  const list = useListPageState({
    search,
    navigate,
    buildQueryParams: buildWebEditorListParams,
    mapSearchToFilters: (currentSearch): WebEditorFilterValues => ({
      search_keyword: currentSearch.search_keyword,
      type: currentSearch.type,
      is_active: currentSearch.is_active,
    }),
    mapFiltersToSearch: (values) => ({
      search_keyword: values.search_keyword,
      type: values.type,
      is_active: values.is_active,
    }),
    resetSearch: (previous) => ({
      ...previous,
      page: undefined,
      search_keyword: undefined,
      type: undefined,
      is_active: undefined,
    }),
  });

  const { data, isLoading } = useWebEditorsQuery(list.queryParams);
  const createMutation = useCreateWebEditorMutation();
  const deleteMutation = useDeleteWebEditorMutation();

  // === Functions ===
  const handleCreate = useCallback(
    (values: CreateWebEditorFormValues) => {
      createMutation.mutate(
        { ...values, config_json: null },
        {
          onSuccess: () => {
            toast.success(tCommon('message.save_success'));
            setIsCreateOpen(false);
          },
          onError: () => toast.error(tCommon('message.save_failed')),
        },
      );
    },
    [createMutation, tCommon],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId === null) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(tCommon('message.save_success'));
        setDeleteId(null);
      },
      onError: () => {
        toast.error(tCommon('message.save_failed'));
        setDeleteId(null);
      },
    });
  }, [deleteId, deleteMutation, tCommon]);

  const handleNavigateToDetail = useCallback(
    (id: number) => {
      void navigate({ to: '/products/web-editors/$webEditorId', params: { webEditorId: String(id) } });
    },
    [navigate],
  );

  const columns = useMemo(
    () => getWebEditorColumns({ t, tCommon, onNavigateToDetail: handleNavigateToDetail, onDelete: setDeleteId }),
    [t, tCommon, handleNavigateToDetail],
  );

  // === JSX return ===
  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('products.web_editors.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('products.web_editors.list.description')}</p> */}
        </div>
        <Button size='sm' className='gap-1.5' onClick={() => setIsCreateOpen(true)}>
          <Plus className='size-4' />
          {t('products.web_editors.list.add_button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <WebEditorSearchFilters initialValues={list.appliedFilters} onSearch={list.applyFilters} onReset={list.resetFilters} />

        <DataTable
          data={data?.data.web_editors ?? []}
          columns={columns}
          isLoading={isLoading}
          enableRowSelection={false}
          getRowId={(row) => String(row.id)}
          state={list.tableState}
          pageInfo={{ pageCount: data?.pagination.total_page ?? 0, rowCount: data?.pagination.total_item ?? 0 }}
          onPaginationChange={list.onPaginationChange}
          onSortingChange={list.onSortingChange}
        />
      </div>

      <WebEditorModal
        mode='create'
        isOpen={isCreateOpen}
        isPending={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <AppDialogModal
        isOpen={deleteId !== null}
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
        <p className='text-sm'>{t('products.web_editors.list.confirm_delete')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
