import { getRouteApi } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { AlertCircle, Loader2, FileDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useListPageState } from '@/hooks/useListPageState';
import { formatDateOnly, parseDateOnly } from '@/utils/format-date';

import { checkErpOptionGroupExportStatusAPI, exportErpOptionGroupsAPI } from '../api/option.api';
import { useAdminErpOptionGroupsQuery } from '../api/option.query';
import { ErpExportDialog } from '../components/ErpExportDialog';
import { getErpOptionGroupColumns } from '../components/OptionColumns';
import { OptionSearchFilters } from '../components/OptionSearchFilters';
import { type ErpExportType } from '../enums';
import { useErpExcelExport } from '../hooks/useErpExcelExport';
import type { OptionSearchFilterFormValues } from '../schemas/option-search-filter-form';
import { buildErpOptionGroupListParams, isErpOptionGroupSortField, normalizeOptionQuery } from '../utils/option-list-params';

const routeApi = getRouteApi('/products/options');

export function OptionListPage() {
  const { t } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const columns = useMemo(() => getErpOptionGroupColumns(t), [t]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const list = useListPageState({
    search,
    navigate,
    buildQueryParams: buildErpOptionGroupListParams,
    mapSearchToFilters: (currentSearch): OptionSearchFilterFormValues => ({
      label: currentSearch.label ?? '',
      code: currentSearch.code ?? '',
      type: currentSearch.type,
      created_from: parseDateOnly(currentSearch.created_from),
      created_to: parseDateOnly(currentSearch.created_to),
    }),
    mapFiltersToSearch: (values) => ({
      label: normalizeOptionQuery(values.label),
      code: normalizeOptionQuery(values.code),
      type: values.type,
      created_from: formatDateOnly(values.created_from),
      created_to: formatDateOnly(values.created_to),
    }),
    resetSearch: (previous) => ({
      ...previous,
      page: undefined,
      label: undefined,
      code: undefined,
      type: undefined,
      created_from: undefined,
      created_to: undefined,
    }),
    parseSortField: (columnId) => (isErpOptionGroupSortField(columnId) ? columnId : undefined),
  });
  const { data: response, isError, isFetching, isLoading, refetch } = useAdminErpOptionGroupsQuery(list.queryParams);

  const selectedGroupIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number),
    [rowSelection],
  );
  const { code, label, type, display_type, is_required, created_from, created_to, sort_by, sort_order } = list.queryParams;
  const exportFilters = useMemo(
    () => ({ code, label, type, display_type, is_required, created_from, created_to, sort_by, sort_order }),
    [code, label, type, display_type, is_required, created_from, created_to, sort_by, sort_order],
  );
  const { isExporting, startExport } = useErpExcelExport({
    filters: exportFilters,
    page: list.queryParams.page,
    perPage: list.queryParams.per_page,
    totalCount: response?.pagination?.total_item ?? 0,
    selectedIds: selectedGroupIds,
    filePrefix: t('page.products.options.export_dialog.file_name_prefix_group'),
    exportFn: exportErpOptionGroupsAPI,
    checkStatusFn: checkErpOptionGroupExportStatusAPI,
  });

  const handleExport = (exportType: ErpExportType) => {
    startExport(exportType)
      .then(() => setIsExportDialogOpen(false))
      .catch(() => {});
  };

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('common.action.retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.products.options.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.products.options.list.description')}</p> */}
        </div>

        <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setIsExportDialogOpen(true)}>
          <FileDown className='size-4' />
          {t('common.export.button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <OptionSearchFilters initialValues={list.appliedFilters} onSearch={list.applyFilters} onReset={list.resetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('page.products.options.list.error.title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('page.products.options.list.error.description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('page.products.options.list.error.refresh_description')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data.erp_option_groups ?? []}
              columns={columns}
              state={list.tableState}
              pageInfo={{
                pageCount: response?.pagination?.total_page ?? 0,
                rowCount: response?.pagination?.total_item ?? 0,
              }}
              onPaginationChange={list.onPaginationChange}
              onSortingChange={list.onSortingChange}
              isLoading={isLoading}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={(row) => String(row.id)}
            />
          </>
        )}
      </div>

      <ErpExportDialog
        isOpen={isExportDialogOpen}
        totalCount={response?.pagination?.total_item ?? 0}
        currentPageCount={response?.data.erp_option_groups.length ?? 0}
        selectedCount={selectedGroupIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />
    </PageContainer>
  );
}
