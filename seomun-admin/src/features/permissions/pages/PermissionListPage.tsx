import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import type { PermissionListREQ } from '../api/permission.request';
import type { PermissionRESP } from '../api/permission.response';
import { useCreatePermissionMutation, useDeletePermissionMutation, usePermissionsQuery } from '../api/permission.query';
import { PermissionDeleteDialog } from '../components/PermissionDeleteDialog';
import { PermissionFormDialog } from '../components/PermissionFormDialog';
import { getPermissionColumns } from '../components/PermissionColumns';
import type { PermissionFormValues } from '../schemas';

function normalizeQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const routeApi = getRouteApi('/permissions/');

export function PermissionListPage() {
  const { t } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingPermission, setDeletingPermission] = useState<PermissionRESP | null>(null);

  const queryParams = useMemo<PermissionListREQ>(
    () => ({
      search: normalizeQuery(search.search),
      usage_status: search.usage_status,
      page: search.page ? search.page : undefined,
      per_page: search.per_page ? search.per_page : undefined,
    }),
    [search],
  );

  const tablePagination = useMemo<PaginationState>(
    () => ({
      pageIndex: (queryParams.page ?? DEFAULT_PAGE) - 1,
      pageSize: queryParams.per_page ?? DEFAULT_PER_PAGE,
    }),
    [queryParams.page, queryParams.per_page],
  );

  const { data: response, isError, isLoading, refetch } = usePermissionsQuery(queryParams);
  const createMutation = useCreatePermissionMutation();
  const deleteMutation = useDeletePermissionMutation();

  const openDetail = (permission: PermissionRESP) => {
    void navigate({ to: '/permissions/$permissionId', params: { permissionId: String(permission.id) } });
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const nextPagination = functionalUpdate(updater, tablePagination);

    void navigate({
      search: (previous) => ({
        ...previous,
        page: nextPagination.pageIndex + 1 === DEFAULT_PAGE ? undefined : nextPagination.pageIndex + 1,
        per_page: nextPagination.pageSize === DEFAULT_PER_PAGE ? undefined : nextPagination.pageSize,
      }),
    });
  };

  const handleSubmitForm = (values: PermissionFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success(t('page.permissions.list.messages.create_success'));
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message ?? error.message ?? t('page.permissions.list.messages.create_error'));
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingPermission) return;

    deleteMutation.mutate(deletingPermission.id, {
      onSuccess: () => {
        toast.success(t('page.permissions.list.messages.delete_success'));
        setDeletingPermission(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message ?? error.message ?? t('page.permissions.list.messages.delete_error'));
      },
    });
  };

  const columns = getPermissionColumns({
    onSettings: openDetail,
    onDelete: setDeletingPermission,
    t,
  });

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.permissions.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.permissions.list.description')}</p> */}
        </div>

        <Button className='h-10 gap-1.5 px-4' onClick={() => setIsFormOpen(true)}>
          <Plus className='size-4' />
          {t('page.permissions.list.add_button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        {isError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('page.permissions.list.error.title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('page.permissions.list.error.description')}</p>
            </div>
            <Button type='button' variant='outline' className='h-10' onClick={() => void refetch()}>
              {t('page.permissions.list.error.retry')}
            </Button>
          </div>
        ) : (
          <DataTable
            data={response?.data?.permissions ?? []}
            columns={columns}
            state={{
              pagination: tablePagination,
              sorting: [],
            }}
            pageInfo={{
              pageCount: response?.pagination?.total_page ?? 0,
              rowCount: response?.pagination?.total_item ?? 0,
            }}
            onPaginationChange={handlePaginationChange}
            onSortingChange={() => undefined}
            isLoading={isLoading}
            enableRowSelection={false}
            getRowId={(row) => String(row.id)}
            onRowClick={openDetail}
          />
        )}
      </div>

      <PermissionFormDialog open={isFormOpen} isPending={createMutation.isPending} onOpenChange={setIsFormOpen} onSubmit={handleSubmitForm} />

      <PermissionDeleteDialog
        permission={deletingPermission}
        open={Boolean(deletingPermission)}
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => {
          if (!open) setDeletingPermission(null);
        }}
      />
    </PageContainer>
  );
}
