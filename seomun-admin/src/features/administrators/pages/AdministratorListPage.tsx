import { Link, getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type RowSelectionState, type SortingState, type Updater } from '@tanstack/react-table';
import { AlertCircle, FileDown, Loader2, Plus, ShieldCheck, ToggleRight, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';
import { useAuthStore } from '@/stores/auth-store';

import { useAdministratorBulkActionMutation, useAdministratorsQuery, useDeleteAdministratorMutation, type AdministratorRESP } from '../api';
import { getAdministratorColumns } from '../components/AdministratorColumn';
import { AdministratorBulkActionDialog } from '../components/AdministratorBulkActionDialog';
import { AdministratorExportDialog } from '../components/AdministratorExportDialog';
import { AdministratorSearchFilters } from '../components/AdministratorSearchFilters';
import { AdministratorBulkAction, type AdministratorExportExcelType } from '../enums';
import { useAdministratorExport } from '../hooks/useAdministratorExport';
import type { AdministratorSearchFilterValues } from '../schemas';
import { getAdministratorAPIErrorMessage } from '../utils/administrator-error';
import { buildAdministratorListParams, isAdministratorSortField, normalizeAdministratorQuery } from '../utils/administrator-list-params';

const routeApi = getRouteApi('/administrators/');

const BULK_ACTION_BUTTONS = [
  { action: AdministratorBulkAction.STATUS, icon: ToggleRight },
  { action: AdministratorBulkAction.PERMISSION, icon: ShieldCheck },
  { action: AdministratorBulkAction.DELETE, icon: Trash2 },
] as const;

export function AdministratorListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMessage } = useTranslation('message');
  const currentUsername = useAuthStore((state) => state.user?.username);
  const isSuperAdmin = currentUsername?.toLowerCase() === 'superadmin';
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryParams = useMemo(() => buildAdministratorListParams(search), [search]);
  const [administratorToDelete, setAdministratorToDelete] = useState<{ id: number; name: string } | null>(null);
  const deleteMutation = useDeleteAdministratorMutation({
    onSuccess: (data) => {
      toast.success(data.message || tMessage('administrators.delete.success'));
      setAdministratorToDelete(null);
    },
    onError: (error) => {
      toast.error(getAdministratorAPIErrorMessage(error, tMessage('administrators.delete.error')));
    },
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkAction, setBulkAction] = useState<AdministratorBulkAction | null>(null);
  const [bulkValue, setBulkValue] = useState<string>();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number),
    [rowSelection],
  );
  const bulkMutation = useAdministratorBulkActionMutation({
    onSuccess: (data) => {
      toast.success(data.message || tMessage('administrators.bulk.success'));
      setRowSelection({});
      setBulkAction(null);
    },
    onError: (error) => {
      toast.error(getAdministratorAPIErrorMessage(error, tMessage('administrators.bulk.error')));
    },
  });
  const canManageAdministrator = useCallback(
    (administrator: AdministratorRESP) => isSuperAdmin || administrator.username === currentUsername,
    [currentUsername, isSuperAdmin],
  );
  const columns = useMemo(
    () =>
      getAdministratorColumns(
        t,
        tCommon,
        (administrator) => {
          setAdministratorToDelete({ id: administrator.id, name: administrator.name });
        },
        canManageAdministrator,
      ),
    [canManageAdministrator, t, tCommon],
  );

  const { data: response, isError, isFetching, isLoading, refetch } = useAdministratorsQuery(queryParams);
  const administrators = response?.data?.users ?? [];
  const { isExporting, startExport } = useAdministratorExport({
    filters: { search_term: queryParams.search_term, sort_by: queryParams.sort_by, sort_order: queryParams.sort_order },
    page: queryParams.page,
    perPage: queryParams.per_page,
    totalCount: response?.pagination?.total_item ?? 0,
    currentPageCount: administrators.length,
    selectedIds,
  });

  const handleExport = async (type: AdministratorExportExcelType) => {
    if (await startExport(type)) {
      setIsExportDialogOpen(false);
    }
  };

  const tablePagination = useMemo<PaginationState>(
    () => ({
      pageIndex: queryParams.page - DEFAULT_PAGE,
      pageSize: queryParams.per_page,
    }),
    [queryParams.page, queryParams.per_page],
  );

  const tableSorting = useMemo<SortingState>(
    () => (queryParams.sort_by ? [{ id: queryParams.sort_by, desc: queryParams.sort_order === SortOrder.DESC }] : []),
    [queryParams.sort_by, queryParams.sort_order],
  );

  const appliedFilters = useMemo<AdministratorSearchFilterValues>(
    () => ({
      search_term: search.search_term ?? '',
    }),
    [search.search_term],
  );
  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleApplyFilters = useCallback(
    (values: AdministratorSearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          search_term: normalizeAdministratorQuery(values.search_term),
          page: undefined,
        }),
      });
    },
    [navigate],
  );

  const handleResetFilters = useCallback(() => {
    void navigate({
      search: (previous) => ({
        ...previous,
        search_term: undefined,
        page: undefined,
      }),
    });
  }, [navigate]);

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSort = functionalUpdate(updater, tableSorting)[0];
      const nextSortBy = nextSort && isAdministratorSortField(nextSort.id) ? nextSort.id : undefined;

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
      const next = functionalUpdate(updater, tablePagination);
      const nextPage = Math.max(next.pageIndex + DEFAULT_PAGE, DEFAULT_PAGE);
      const nextPageSize = Math.max(next.pageSize, 1);
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
  const openBulkAction = (action: AdministratorBulkAction) => {
    setBulkValue(undefined);
    setBulkAction(action);
  };

  const handleBulkConfirm = () => {
    if (bulkAction) {
      bulkMutation.mutate({ action: bulkAction, user_ids: selectedIds, value: bulkValue });
    }
  };

  const handleDeleteConfirm = () => {
    if (administratorToDelete) {
      deleteMutation.mutate(administratorToDelete.id);
    }
  };

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {tCommon('action.retry', 'Retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('administrators.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('administrators.list.description')}</p> */}
        </div>

        <div className='flex flex-wrap items-center justify-end gap-2'>
          {isSuperAdmin ? (
            <>
              <span className='text-muted-foreground text-sm'>{t('administrators.bulk.selected_count', { count: selectedIds.length })}</span>
              {BULK_ACTION_BUTTONS.map(({ action, icon: Icon }) => (
                <Button
                  key={action}
                  type='button'
                  variant={action === AdministratorBulkAction.DELETE ? 'destructive' : 'outline'}
                  size='sm'
                  className='gap-1.5'
                  disabled={!selectedIds.length}
                  onClick={() => openBulkAction(action)}
                >
                  <Icon className='size-4' />
                  {t(`administrators.bulk.${action}.button`)}
                </Button>
              ))}
            </>
          ) : null}

          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-1.5'
            disabled={!administrators.length}
            onClick={() => setIsExportDialogOpen(true)}
          >
            <FileDown className='size-4' />
            {tCommon('export.button')}
          </Button>

          <Button size='sm' className='gap-1.5 px-4' asChild>
            <Link to='/administrators/create'>
              <Plus className='size-4' />
              {t('administrators.list.add_button')}
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className='space-y-4'>
        <AdministratorSearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('administrators.list.error.title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('administrators.list.error.description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('administrators.list.error.refresh_description')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={administrators}
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
              getRowClassName={(row) =>
                row.is_super_admin || row.username.toLowerCase() === 'superadmin' ? 'bg-yellow-50 hover:bg-yellow-100' : undefined
              }
              onRowClick={(row) => {
                if (canManageAdministrator(row)) {
                  void navigate({ to: '/administrators/$administratorId', params: { administratorId: String(row.id) } });
                }
              }}
              enableRowSelection={isSuperAdmin}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </>
        )}
      </div>

      <AdministratorExportDialog
        isOpen={isExportDialogOpen}
        totalCount={response?.pagination?.total_item ?? 0}
        currentPageCount={administrators.length}
        selectedCount={selectedIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={(type) => void handleExport(type)}
      />

      <AdministratorBulkActionDialog
        action={bulkAction}
        selectedCount={selectedIds.length}
        value={bulkValue}
        isPending={bulkMutation.isPending}
        onValueChange={setBulkValue}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkConfirm}
      />

      <AppDialogModal
        isOpen={administratorToDelete !== null}
        setIsOpen={(open) => {
          if (!open && !deleteMutation.isPending) {
            setAdministratorToDelete(null);
          }
        }}
        title={t('administrators.delete.confirm_title')}
        onOk={handleDeleteConfirm}
        okText={tCommon('action.delete')}
        cancelText={tCommon('action.cancel')}
        confirmLoading={deleteMutation.isPending}
        width={480}
      >
        <p className='text-muted-foreground py-3 text-sm'>
          {administratorToDelete
            ? t('administrators.delete.confirm_message_with_name', {
                name: administratorToDelete.name,
              })
            : null}
        </p>
      </AppDialogModal>
    </PageContainer>
  );
}
