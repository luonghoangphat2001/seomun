import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type SortingState, type Updater } from '@tanstack/react-table';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import { formatDateOnly, parseDateOnly } from '@/utils/format-date';
import { useNotificationHistoryQuery, useResendNotificationHistoryMutation } from '../api';
import { NotificationDeliveryDetailSheet } from '../components/NotificationDeliveryDetailSheet';
import { getNotificationHistoryColumns } from '../components/NotificationHistoryColumn';
import { NotificationHistorySearchFilters } from '../components/NotificationHistorySearchFilters';
import type { NotificationHistorySearchFilterValues } from '../schemas';
import {
  buildNotificationHistoryListParams,
  isNotificationHistorySortField,
  normalizeNotificationHistoryKeyword,
} from '../utils/notification-history-list-params';

const routeApi = getRouteApi('/notifications/history');

export function NotificationHistoryPage() {
  const { t } = useTranslation('page');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  const queryParams = useMemo(() => buildNotificationHistoryListParams(search), [search]);

  const { data: response, isError, isFetching, isLoading, refetch } = useNotificationHistoryQuery(queryParams);
  const resendMutation = useResendNotificationHistoryMutation({
    onSuccess: () => {
      toast.success(t('notifications.history.messages.resend_success'));
    },
    onError: () => {
      toast.error(t('notifications.history.messages.resend_error'));
    },
  });

  const selectedHistory = useMemo(
    () => response?.data.find((history) => history.id === selectedHistoryId) ?? null,
    [response?.data, selectedHistoryId],
  );

  const columns = useMemo(
    () =>
      getNotificationHistoryColumns({
        t,
        onOpenDetail: (history) => setSelectedHistoryId(history.id),
        onResend: (history) => resendMutation.mutate(history.id),
        resendingHistoryId: resendMutation.isPending ? (resendMutation.variables ?? null) : null,
        rowOffset: (queryParams.page - 1) * queryParams.per_page,
      }),
    [queryParams.page, queryParams.per_page, resendMutation, t],
  );

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

  const appliedFilters = useMemo<NotificationHistorySearchFilterValues>(
    () => ({
      template_number: search.template_number ?? '',
      notification_type: search.notification_type,
      recipient_name: search.recipient_name ?? '',
      sending_date_from: parseDateOnly(search.sending_date_from),
      sending_date_to: parseDateOnly(search.sending_date_to),
      sending_result: search.sending_result,
      sender_id: search.sender_id !== undefined ? String(search.sender_id) : undefined,
    }),
    [
      search.notification_type,
      search.recipient_name,
      search.sender_id,
      search.sending_date_from,
      search.sending_date_to,
      search.sending_result,
      search.template_number,
    ],
  );

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleApplyFilters = useCallback(
    (values: NotificationHistorySearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          template_number: values.template_number,
          notification_type: values.notification_type,
          recipient_name: normalizeNotificationHistoryKeyword(values.recipient_name),
          sending_date_from: formatDateOnly(values.sending_date_from),
          sending_date_to: formatDateOnly(values.sending_date_to),
          sending_result: values.sending_result,
          sender_id: values.sender_id ? Number(values.sender_id) : undefined,
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
        template_number: undefined,
        notification_type: undefined,
        recipient_name: undefined,
        sending_date_from: undefined,
        sending_date_to: undefined,
        sending_result: undefined,
        sender_id: undefined,
      }),
    });
  }, [navigate]);

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = functionalUpdate(updater, tableSorting);
      const nextSort = nextSorting[0];
      const nextSortBy = nextSort && isNotificationHistorySortField(nextSort.id) ? nextSort.id : undefined;

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

  const handleResendFromSheet = useCallback(
    (notificationHistoryId: number) => {
      resendMutation.mutate(notificationHistoryId);
    },
    [resendMutation],
  );

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('notifications.history.retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('notifications.history.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('notifications.history.description')}</p> */}
        </div>
      </div>

      <Separator />

      <div className='space-y-4'>
        <NotificationHistorySearchFilters initialValues={appliedFilters} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('notifications.history.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('notifications.history.error.load_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('notifications.history.error.refresh')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data ?? []}
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
              enableRowSelection={false}
            />
          </>
        )}
      </div>

      <NotificationDeliveryDetailSheet
        history={selectedHistory}
        open={selectedHistory !== null}
        isResending={resendMutation.isPending && resendMutation.variables === selectedHistory?.id}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedHistoryId(null);
          }
        }}
        onResend={handleResendFromSheet}
      />
    </PageContainer>
  );
}
