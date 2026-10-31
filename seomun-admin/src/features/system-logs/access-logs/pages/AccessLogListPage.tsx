import type { RowSelectionState } from '@tanstack/react-table';
import { getRouteApi } from '@tanstack/react-router';
import { AlertCircle, FileDown, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useListPageState } from '@/hooks/useListPageState';
import { formatDateOnly, parseDateOnly } from '@/utils/format-date';

import { useAccessLogSearchFilterQuery, useAccessLogsQuery } from '../api';
import { getAccessLogColumns } from '../components/AccessLogColumns';
import { AccessLogExportDialog } from '../components/AccessLogExportDialog';
import { AccessLogSearchFilters } from '../components/AccessLogSearchFilters';
import { AccessLogExportType } from '../enums';
import { useAccessLogExport } from '../hooks/useAccessLogExport';
import type { AccessLogSearchFilterValues } from '../schemas';
import { buildAccessLogListParams, isAccessLogSortField, normalizeAccessLogQuery } from '../utils/access-log-list-params';

const routeApi = getRouteApi('/system-logs/access');

export function AccessLogListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const columns = useMemo(() => getAccessLogColumns(t), [t]);

  const list = useListPageState({
    search,
    navigate,
    buildQueryParams: buildAccessLogListParams,
    mapSearchToFilters: (currentSearch): AccessLogSearchFilterValues => ({
      search_term: currentSearch.search_term ?? '',
      event_type: currentSearch.event_type,
      access_date_from: parseDateOnly(currentSearch.access_date_from),
      access_date_to: parseDateOnly(currentSearch.access_date_to),
    }),
    mapFiltersToSearch: (values) => ({
      search_term: normalizeAccessLogQuery(values.search_term),
      event_type: values.event_type,
      access_date_from: formatDateOnly(values.access_date_from),
      access_date_to: formatDateOnly(values.access_date_to),
    }),
    resetSearch: (previous) => ({
      ...previous,
      page: undefined,
      search_term: undefined,
      event_type: undefined,
      access_date_from: undefined,
      access_date_to: undefined,
    }),
    parseSortField: (columnId) => (isAccessLogSortField(columnId) ? columnId : undefined),
  });

  const { data: response, isError, isFetching, isLoading, refetch } = useAccessLogsQuery(list.queryParams);
  const { data: filterResponse, isLoading: isLoadingFilters } = useAccessLogSearchFilterQuery();
  const { isExporting, startExport } = useAccessLogExport();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const accessLogs = response?.data.access_logs ?? [];
  const totalCount = response?.pagination?.total_item ?? 0;
  const selectedIds = Object.keys(rowSelection)
    .filter((id) => rowSelection[id])
    .map(Number);

  const handleExport = async (type: AccessLogExportType) => {
    const { page, per_page, ...filters } = list.queryParams;
    const exportTargets = {
      [AccessLogExportType.ALL]: { payload: {}, message: tCommon('export.success_all', { count: totalCount }) },
      [AccessLogExportType.CURRENT_PAGE]: {
        payload: { current_page: page, per_page },
        message: tCommon('export.success_current', { count: accessLogs.length }),
      },
      [AccessLogExportType.SELECTED]: {
        payload: { selected_ids: selectedIds },
        message: tCommon('export.success_selected', { count: selectedIds.length }),
      },
    };
    const { payload, message } = exportTargets[type];

    if (await startExport({ ...filters, ...payload, export_type: type }, message)) {
      setIsExportDialogOpen(false);
    }
  };

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('system_logs.access.retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('system_logs.access.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('system_logs.access.description')}</p> */}
        </div>

        <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setIsExportDialogOpen(true)}>
          <FileDown className='size-4' />
          {tCommon('export.button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <AccessLogSearchFilters
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
              <h2 className='text-lg font-semibold'>{t('system_logs.access.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('system_logs.access.error.load_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('system_logs.access.error.refresh')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={accessLogs}
              columns={columns}
              state={list.tableState}
              pageInfo={{
                pageCount: response?.pagination?.total_page ?? 0,
                rowCount: totalCount,
              }}
              onPaginationChange={list.onPaginationChange}
              onSortingChange={list.onSortingChange}
              isLoading={isLoading}
              getRowId={(row) => String(row.id)}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </>
        )}
      </div>

      <AccessLogExportDialog
        isOpen={isExportDialogOpen}
        totalCount={totalCount}
        currentPageCount={accessLogs.length}
        selectedCount={selectedIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={(type) => void handleExport(type)}
      />
    </PageContainer>
  );
}
