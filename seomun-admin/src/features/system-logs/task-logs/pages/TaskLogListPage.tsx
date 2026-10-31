import { getRouteApi } from '@tanstack/react-router';
import { AlertCircle, FileDown, Loader2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { downloadCsv, escapeCsv } from '@/utils/format-csv';

import { useTaskLogSearchFiltersQuery, useTaskLogsQuery } from '../api';
import { getTaskLogColumns } from '../components/TaskLogColumns';
import { TaskLogSearchFilters } from '../components/TaskLogSearchFilters';
import { getTaskLogExportRows } from '../utils/task-log-export';
import type { TaskLogSearchFilterValues } from '../schemas';
import { buildTaskLogListParams, isTaskLogSortField, normalizeTaskLogQuery } from '../utils/task-log-list-params';
import { useListPageState } from '@/hooks/useListPageState';
import { formatDateOnly, parseDateOnly } from '@/utils/format-date';

const routeApi = getRouteApi('/system-logs/tasks');

export function TaskLogListPage() {
  const { t } = useTranslation('page');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const columns = useMemo(() => getTaskLogColumns(t), [t]);

  const list = useListPageState({
    search,
    navigate,
    buildQueryParams: buildTaskLogListParams,
    mapSearchToFilters: (currentSearch): TaskLogSearchFilterValues => ({
      menu: currentSearch.menu ?? '',
      operator: currentSearch.operator ?? '',
      task_type: currentSearch.task_type,
      date_from: parseDateOnly(currentSearch.date_from),
      date_to: parseDateOnly(currentSearch.date_to),
    }),
    mapFiltersToSearch: (values) => ({
      menu: normalizeTaskLogQuery(values.menu),
      operator: normalizeTaskLogQuery(values.operator),
      task_type: values.task_type,
      date_from: formatDateOnly(values.date_from),
      date_to: formatDateOnly(values.date_to),
    }),
    resetSearch: (previous) => ({
      ...previous,
      page: undefined,
      menu: undefined,
      operator: undefined,
      task_type: undefined,
      date_from: undefined,
      date_to: undefined,
    }),
    parseSortField: (columnId) => (isTaskLogSortField(columnId) ? columnId : undefined),
  });

  const { data: response, isError, isFetching, isLoading, refetch } = useTaskLogsQuery(list.queryParams);
  const { data: filterResponse, isLoading: isLoadingFilters } = useTaskLogSearchFiltersQuery();

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleExport = useCallback(() => {
    const rows = response?.data?.task_logs ?? [];
    if (!rows.length) return;

    const headers = [
      t('system_logs.tasks.export.headers.no'),
      t('system_logs.tasks.export.headers.changed_at'),
      t('system_logs.tasks.export.headers.operator'),
      t('system_logs.tasks.export.headers.menu'),
      t('system_logs.tasks.export.headers.target_id'),
      t('system_logs.tasks.export.headers.task_type'),
      t('system_logs.tasks.export.headers.before_value'),
      t('system_logs.tasks.export.headers.after_value'),
    ];
    const csvRows = getTaskLogExportRows(rows).map((row) => [
      row.no,
      row.changed_at,
      row.operator,
      row.menu,
      row.target_id,
      row.task_type,
      row.before_value,
      row.after_value,
    ]);
    const csvContent = [headers, ...csvRows].map((row) => row.map((value) => escapeCsv(value)).join(',')).join('\n');

    downloadCsv(csvContent, 'task-log-export.csv');
  }, [response?.data, t]);

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('system_logs.tasks.retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('system_logs.tasks.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('system_logs.tasks.description')}</p> */}
        </div>

        <Button variant='outline' size='sm' className='gap-1.5' onClick={handleExport}>
          <FileDown className='size-4' />
          {t('system_logs.tasks.download')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <TaskLogSearchFilters
          filters={filterResponse?.data.filters}
          initialValues={list.appliedFilters}
          isLoading={isLoadingFilters}
          onSearch={list.applyFilters}
          onReset={list.resetFilters}
        />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('system_logs.tasks.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('system_logs.tasks.error.load_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('system_logs.tasks.error.refresh')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data?.task_logs ?? []}
              columns={columns}
              state={list.tableState}
              pageInfo={{
                pageCount: response?.pagination?.total_page ?? 0,
                rowCount: response?.pagination?.total_item ?? 0,
              }}
              onPaginationChange={list.onPaginationChange}
              onSortingChange={list.onSortingChange}
              isLoading={isLoading}
              getRowId={(row) => String(row.id)}
              enableRowSelection={false}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
