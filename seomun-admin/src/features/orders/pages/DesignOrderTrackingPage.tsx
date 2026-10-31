import { AlertCircle, Loader2 } from 'lucide-react';
import { functionalUpdate, type OnChangeFn, type PaginationState } from '@tanstack/react-table';
import { getRouteApi } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useAssignedDesignListQuery } from '../api';
import { DesignOrderTrackingDetailPanel } from '../components/DesignOrderTrackingDetailPanel';
import { DesignOrderTrackingList } from '../components/DesignOrderTrackingList';
import type { AssignedDesignStatus } from '../enums';

const DESIGN_ORDERS_PER_PAGE = 10;
const routeApi = getRouteApi('/orders/design-workflow');

export function DesignOrderTrackingPage() {
  const { t } = useTranslation('page');
  const { t: tNav } = useTranslation('nav');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryParams = useMemo(
    () => ({
      page: search.page ?? 1,
      per_page: search.per_page ?? DESIGN_ORDERS_PER_PAGE,
      status: search.status,
    }),
    [search.page, search.per_page, search.status],
  );
  const { data: response, isLoading, isError, isFetching, refetch } = useAssignedDesignListQuery(queryParams);

  const orders = response?.data.orders ?? [];
  const selectedOrderNumber = search.selected_order_number;
  const tablePagination = useMemo<PaginationState>(
    () => ({ pageIndex: queryParams.page - 1, pageSize: queryParams.per_page }),
    [queryParams.page, queryParams.per_page],
  );

  const handleSelectOrder = useCallback(
    (orderNumber: string) => {
      void navigate({ search: (previous) => ({ ...previous, selected_order_number: orderNumber }) });
    },
    [navigate],
  );

  const handleStatusChange = useCallback(
    (status?: AssignedDesignStatus) => {
      void navigate({ search: (previous) => ({ ...previous, page: undefined, status }) });
    },
    [navigate],
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const nextPagination = functionalUpdate(updater, tablePagination);
      const nextPage = Math.max(nextPagination.pageIndex + 1, 1);
      const nextPerPage = Math.max(nextPagination.pageSize, 1);

      void navigate({
        search: (previous) => ({
          ...previous,
          page: nextPage === 1 ? undefined : nextPage,
          per_page: nextPerPage === DESIGN_ORDERS_PER_PAGE ? undefined : nextPerPage,
        }),
      });
    },
    [navigate, tablePagination],
  );

  if (isError && !response) {
    return (
      <PageContainer>
        <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
          <AlertCircle className='text-destructive size-7' aria-hidden='true' />
          <div className='space-y-1'>
            <h1 className='text-lg font-semibold'>{t('orders.design_workflow.list.load_error')}</h1>
            <p className='text-muted-foreground text-sm'>{t('orders.design_workflow.list.load_error_description')}</p>
          </div>
          <Button type='button' variant='outline' onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className='mr-1 size-4 animate-spin' aria-hidden='true' /> : null}
            {t('orders.list.retry')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='lg:h-full'>
      <div>
        <h1 className='text-xl font-semibold'>{tNav('orders.design_workflow')}</h1>
        <p className='text-muted-foreground mt-0.5 text-sm'>{t('orders.design_workflow.description')}</p>
      </div>

      <Separator />

      <div className='grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)]'>
        <div className='scrollbar-thin min-h-0 lg:overflow-y-auto'>
          <DesignOrderTrackingList
            orders={orders}
            pagination={response?.pagination}
            paginationState={tablePagination}
            selectedOrderNumber={selectedOrderNumber}
            status={search.status}
            isLoading={isLoading}
            onSelect={handleSelectOrder}
            onStatusChange={handleStatusChange}
            onPaginationChange={handlePaginationChange}
          />
        </div>

        <div className='bg-muted/30 scrollbar-thin min-h-0 rounded-xl border p-4 lg:overflow-y-auto'>
          {selectedOrderNumber ? (
            <DesignOrderTrackingDetailPanel orderNumber={selectedOrderNumber} />
          ) : (
            <div className='text-muted-foreground flex h-full min-h-64 items-center justify-center text-sm'>
              {t('orders.design_workflow.detail.empty')}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
