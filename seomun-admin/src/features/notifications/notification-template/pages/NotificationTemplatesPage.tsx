import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type OnChangeFn, type PaginationState, type SortingState } from '@tanstack/react-table';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal/AppDialogModal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';
import { getApiErrorMessage } from '@/utils/api-error';

import {
  useCopyNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useNotificationTemplateSearchFiltersQuery,
  useNotificationTemplatesQuery,
  type NotificationTemplateRESP,
} from '../api';
import { getNotificationTemplateColumns } from '../components/NotificationTemplateColumns';
import { NotificationTemplateSearchFilters } from '../components/NotificationTemplateSearchFilters';
import { NotificationTemplateSortField } from '../enums';
import type { NotificationTemplateListSearch, NotificationTemplateSearchFilterValues } from '../schemas';
import { buildNotificationTemplateListParams } from '../utils/notification-template-list-params';

const routeApi = getRouteApi('/notifications/templates/');
function buildAppliedFilters(search: NotificationTemplateListSearch): NotificationTemplateSearchFilterValues {
  return {
    template_name: search.template_name,
    template_number: search.template_number,
    notification_type: search.notification_type,
    usage_status: search.usage_status,
    registrant_id: search.registrant_id,
  };
}

export function NotificationTemplatesPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [templateToDelete, setTemplateToDelete] = useState<NotificationTemplateRESP | null>(null);

  const queryParams = buildNotificationTemplateListParams(search);
  const { data: response, isError, isFetching, isLoading, refetch } = useNotificationTemplatesQuery(queryParams);
  const { data: filterResponse, isLoading: isLoadingFilters } = useNotificationTemplateSearchFiltersQuery();
  const copyMutation = useCopyNotificationTemplateMutation({
    onSuccess: () => toast.success(t('notifications.templates.copy.success')),
    onError: (error) => toast.error(getApiErrorMessage(error, t('notifications.templates.copy.error'))),
  });
  const deleteMutation = useDeleteNotificationTemplateMutation({
    onSuccess: () => {
      toast.success(t('notifications.templates.delete.success'));
      setTemplateToDelete(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('notifications.templates.delete.error'))),
  });

  const handleDeleteConfirm = () => {
    if (!templateToDelete) return;
    deleteMutation.mutate(templateToDelete.id);
  };

  const tablePagination = useMemo<PaginationState>(
    () => ({
      pageIndex: queryParams.page - 1,
      pageSize: queryParams.per_page,
    }),
    [queryParams.page, queryParams.per_page],
  );

  const tableSorting = useMemo<SortingState>(() => {
    if (!queryParams.sort_by) {
      return [];
    }

    return [{ id: queryParams.sort_by, desc: queryParams.sort_order === SortOrder.DESC }];
  }, [queryParams.sort_by, queryParams.sort_order]);

  const appliedFilters = buildAppliedFilters(search);
  const searchFiltersKey = JSON.stringify(appliedFilters);

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleApplyFilters = useCallback(
    (values: NotificationTemplateSearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          template_name: values.template_name,
          template_number: values.template_number,
          notification_type: values.notification_type,
          usage_status: values.usage_status,
          registrant_id: values.registrant_id,
        }),
      });
    },
    [navigate],
  );

  const handleResetFilters = useCallback(() => {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: undefined,
        template_name: undefined,
        template_number: undefined,
        notification_type: undefined,
        usage_status: undefined,
        registrant_id: undefined,
      }),
      replace: true,
    });
  }, [navigate]);

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const next = functionalUpdate(updaterOrValue, tableSorting);
      const nextSort = next[0];
      const nextSortBy =
        nextSort && Object.values(NotificationTemplateSortField).includes(nextSort.id as NotificationTemplateSortField)
          ? (nextSort.id as NotificationTemplateSortField)
          : undefined;

      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          sort_by: nextSortBy,
          sort_order: nextSortBy ? (nextSort.desc ? SortOrder.DESC : SortOrder.ASC) : undefined,
        }),
        replace: true,
      });
    },
    [navigate, tableSorting],
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      const next = functionalUpdate(updaterOrValue, tablePagination);
      const nextPage = Math.max(next.pageIndex + 1, DEFAULT_PAGE);
      const nextPageSize = Math.max(next.pageSize, 1);
      const isPageSizeChanged = nextPageSize !== tablePagination.pageSize;

      void navigate({
        search: (previous) => ({
          ...previous,
          page: isPageSizeChanged || nextPage === DEFAULT_PAGE ? undefined : nextPage,
          per_page: nextPageSize === DEFAULT_PER_PAGE ? undefined : nextPageSize,
        }),
        replace: true,
      });
    },
    [navigate, tablePagination],
  );
  const handleCreate = () => {
    void navigate({ to: '/notifications/templates/create' });
  };

  const columns = useMemo(
    () =>
      getNotificationTemplateColumns({
        t,
        onOpenDetail: (template) => void navigate({ to: '/notifications/templates/$templateId', params: { templateId: String(template.id) } }),
        onEdit: (template) => void navigate({ to: '/notifications/templates/$templateId/edit', params: { templateId: String(template.id) } }),
        onCopy: (template) => copyMutation.mutate(template.id),
        onDelete: (template) => setTemplateToDelete(template),
      }),
    [copyMutation, navigate, t],
  );

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <AppButton type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('notifications.templates.retry')}
    </AppButton>
  );

  return (
    <PageContainer>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('notifications.templates.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('notifications.templates.description')}</p> */}
        </div>

        <AppButton leftIcon={<Plus className='size-4' />} onClick={handleCreate}>
          {t('notifications.templates.add_button')}
        </AppButton>
      </div>

      <Separator />

      <div className='space-y-4'>
        <NotificationTemplateSearchFilters
          key={searchFiltersKey}
          filters={filterResponse?.data.filters}
          initialValues={appliedFilters}
          isLoading={isLoadingFilters}
          onSearch={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('notifications.templates.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('notifications.templates.error.load_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('notifications.templates.error.refresh')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data.templates ?? []}
              columns={columns}
              state={{
                pagination: tablePagination,
                sorting: tableSorting,
              }}
              pageInfo={{
                pageCount: response?.data.pagination.total_page ?? 0,
                rowCount: response?.data.pagination.total_item ?? 0,
              }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={handleSortingChange}
              isLoading={isLoading}
              getRowId={(row) => String(row.id)}
              enableRowSelection={false}
            />
          </>
        )}
      </div>

      <AppDialogModal
        isOpen={templateToDelete !== null}
        setIsOpen={(open) => !open && setTemplateToDelete(null)}
        title={t('notifications.templates.delete.confirm_title')}
        onOk={handleDeleteConfirm}
        okText={tCommon('action.delete')}
        cancelText={tCommon('action.cancel')}
        confirmLoading={deleteMutation.isPending}
        width={480}
      >
        <div className='py-3'>
          <p className='text-sm text-gray-600'>
            {templateToDelete
              ? t('notifications.templates.delete.confirm_message_with_name', { name: templateToDelete.name })
              : t('notifications.templates.delete.confirm_message')}
          </p>
        </div>
      </AppDialogModal>
    </PageContainer>
  );
}
