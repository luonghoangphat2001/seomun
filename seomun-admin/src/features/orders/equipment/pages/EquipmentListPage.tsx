import { getRouteApi } from '@tanstack/react-router';
import { AlertCircle, FilePlus2, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useListPageState } from '@/hooks/useListPageState';

import type { EquipmentRESP } from '../api/equipment.response';
import { useDeleteEquipmentMutation, useEquipmentsQuery } from '../api/equipment.query';
import { getEquipmentColumns } from '../components/EquipmentColumns';
import { EquipmentSearchFilters } from '../components/EquipmentSearchFilters';
import { EquipmentStatus } from '../enums';
import type { EquipmentSearchFilterValues } from '../schemas/equipment-list-search.schema';
import { buildEquipmentListParams } from '../utils/equipment-list-params';

const routeApi = getRouteApi('/orders/equipment/');

export function EquipmentListPage() {
  const { t } = useTranslation('page');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const list = useListPageState({
    search,
    navigate,
    buildQueryParams: buildEquipmentListParams,
    mapSearchToFilters: (currentSearch): EquipmentSearchFilterValues => ({
      search_type: currentSearch.search_type,
      keyword: currentSearch.keyword ?? '',
      work_process: currentSearch.work_process,
      machine_type: currentSearch.machine_type,
      status: currentSearch.status ?? EquipmentStatus.ACTIVE,
    }),
    mapFiltersToSearch: (values) => ({
      search_type: values.keyword.trim() ? values.search_type : undefined,
      keyword: values.keyword.trim() || undefined,
      work_process: values.work_process,
      machine_type: values.machine_type,
      status: values.status,
    }),
    resetSearch: (previous) => ({
      ...previous,
      page: undefined,
      search_type: undefined,
      keyword: undefined,
      work_process: undefined,
      machine_type: undefined,
      status: undefined,
    }),
  });
  const { data: response, isError, isFetching, isLoading, refetch } = useEquipmentsQuery(list.queryParams);

  const [deleteTarget, setDeleteTarget] = useState<EquipmentRESP | null>(null);
  const deleteMutation = useDeleteEquipmentMutation({
    onSuccess: () => {
      toast.success(t('orders.equipment.list.delete.success', 'Equipment deleted.'));
      setDeleteTarget(null);
    },
    onError: () => toast.error(t('orders.equipment.list.delete.error', 'Failed to delete equipment.')),
  });

  const columns = useMemo(
    () =>
      getEquipmentColumns({
        t,
        onViewDetail: (equipmentId) => void navigate({ to: '/orders/equipment/$equipmentId', params: { equipmentId: String(equipmentId) } }),
        onDelete: setDeleteTarget,
      }),
    [navigate, t],
  );

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('orders.equipment.list.retry', 'Retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('orders.equipment.list.title', 'Equipment Management')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>
            {t('orders.equipment.list.description', 'View production equipment, inspect status, and open maintenance history.')}
          </p> */}
        </div>

        <Button size='sm' className='gap-1.5' onClick={() => void navigate({ to: '/orders/equipment/create' })}>
          <FilePlus2 className='size-4' />
          {t('orders.equipment.list.register', 'Register Equipment')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <EquipmentSearchFilters initialValues={list.appliedFilters} onSearch={list.applyFilters} onReset={list.resetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('orders.equipment.list.error.load_title', 'Unable to load equipment')}</h2>
              <p className='text-muted-foreground text-sm'>
                {t('orders.equipment.list.error.load_description', 'The request failed. Please try again.')}
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
                  <p className='text-sm font-medium'>
                    {t('orders.equipment.list.error.refresh', 'Unable to refresh equipment. Showing previous data.')}
                  </p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data.equipments ?? []}
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
            />
          </>
        )}
      </div>

      <AppDialogModal
        isOpen={deleteTarget !== null}
        setIsOpen={(open) => !open && setDeleteTarget(null)}
        title={t('orders.equipment.list.delete.title', 'Delete Equipment')}
        onOk={() => deleteTarget && deleteMutation.mutate(String(deleteTarget.id))}
        okText={t('orders.equipment.list.delete.confirm', 'Delete')}
        cancelText={t('orders.equipment.list.delete.cancel', 'Cancel')}
        confirmLoading={deleteMutation.isPending}
        width={480}
      >
        <p className='text-muted-foreground py-3 text-sm'>
          {t('orders.equipment.list.delete.description', {
            name: deleteTarget?.name ?? '',
            defaultValue: `Are you sure you want to delete "${deleteTarget?.name ?? ''}"? This cannot be undone.`,
          })}
        </p>
      </AppDialogModal>
    </PageContainer>
  );
}
