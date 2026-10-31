import { getRouteApi } from '@tanstack/react-router';
import type { RowSelectionState } from '@tanstack/react-table';
import { AlertCircle, Loader2, Plus, FileDown } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDateOnly, parseDateOnly } from '@/utils/format-date';

import { useListPageState } from '@/hooks/useListPageState';
import { useCopyTemplateMutation, useDeleteTemplateMutation, useTemplatesQuery } from '../api';
import { getTemplateColumns } from '../components/TemplateColumns';
import { TemplateCopyDialog } from '../components/TemplateCopyDialog';
import { TemplateExportDialog } from '../components/TemplateExportDialog';
import { TemplateSearchFilters } from '../components/TemplateSearchFilters';
import type { TemplateExportExcelType } from '../enums';
import { useTemplateExport } from '../hooks/useTemplateExport';
import type { TemplateSearchFilterValues } from '../schemas';
import { buildTemplateListParams, isTemplateSortField, normalizeTemplateQuery } from '../utils/template-list-params';

const routeApi = getRouteApi('/products/templates');

export function TemplateListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  // === State ===
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copyId, setCopyId] = useState<number | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // === Hooks ===
  const list = useListPageState({
    search,
    navigate,
    buildQueryParams: buildTemplateListParams,
    mapSearchToFilters: (currentSearch): TemplateSearchFilterValues => ({
      template_name: currentSearch.template_name ?? '',
      specification: currentSearch.specification ?? '',
      status: currentSearch.status,
      registrant: currentSearch.registrant ?? '',
      modified_from: parseDateOnly(currentSearch.last_modified_from),
      modified_to: parseDateOnly(currentSearch.last_modified_to),
    }),
    mapFiltersToSearch: (values) => ({
      template_name: normalizeTemplateQuery(values.template_name),
      specification: normalizeTemplateQuery(values.specification),
      status: values.status,
      registrant: normalizeTemplateQuery(values.registrant),
      last_modified_from: formatDateOnly(values.modified_from),
      last_modified_to: formatDateOnly(values.modified_to),
    }),
    resetSearch: (previous) => ({
      ...previous,
      page: undefined,
      template_name: undefined,
      specification: undefined,
      status: undefined,
      registrant: undefined,
      last_modified_from: undefined,
      last_modified_to: undefined,
    }),
    parseSortField: (columnId) => (isTemplateSortField(columnId) ? columnId : undefined),
  });

  const { data: response, isError, isFetching, isLoading, refetch } = useTemplatesQuery(list.queryParams);
  const deleteMutation = useDeleteTemplateMutation();
  const copyMutation = useCopyTemplateMutation();

  const selectedTemplateIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number),
    [rowSelection],
  );

  const { isExporting, startExport } = useTemplateExport({
    filters: list.queryParams,
    page: list.queryParams.page,
    perPage: list.queryParams.per_page,
    selectedIds: selectedTemplateIds,
  });

  // === Functions ===
  const handleDeleteConfirm = useCallback(() => {
    if (deleteId === null) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t('products.templates.list.delete_dialog.success', 'Template deleted.'));
        setDeleteId(null);
      },
      onError: () => {
        toast.error(t('products.templates.list.delete_dialog.error', 'Failed to delete template.'));
        setDeleteId(null);
      },
    });
  }, [deleteId, deleteMutation, t]);

  const handleNavigateToDetail = useCallback(
    (id: number) => {
      void navigate({ to: '/products/templates/$templateId', params: { templateId: String(id) } });
    },
    [navigate, t],
  );

  const columns = useMemo(
    () => getTemplateColumns({ t, tCommon, onNavigateToDetail: handleNavigateToDetail, onDelete: setDeleteId, onCopy: setCopyId }),
    [t, tCommon, handleNavigateToDetail],
  );

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleExport = useCallback(
    (type: TemplateExportExcelType) => {
      startExport(type)
        .then(() => setIsExportDialogOpen(false))
        .catch(() => {});
    },
    [startExport],
  );

  const handleCopyConfirm = useCallback(
    (payload: { copy_title: string; copy_layers: boolean }) => {
      if (copyId === null) return;
      copyMutation.mutate(
        { id: copyId, payload },
        {
          onSuccess: () => {
            toast.success(t('products.templates.list.copy_dialog.success', 'Template copied.'));
            setCopyId(null);
          },
          onError: () => {
            toast.error(t('products.templates.list.copy_dialog.error', 'Failed to copy template.'));
          },
        },
      );
    },
    [copyId, copyMutation, t],
  );

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('products.templates.list.retry', 'Retry')}
    </Button>
  );

  // === JSX return ===
  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('products.templates.list.title', 'Template Management')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>
            {t(
              'products.templates.list.description',
              'View all templates, refine the list with product and specification filters, preview images, and export matched rows.',
            )}
          </p> */}
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setIsExportDialogOpen(true)}>
            <FileDown className='size-4' />
            {tCommon('export.button')}
          </Button>
          <Button size='sm' className='gap-1.5' onClick={() => void navigate({ to: '/products/templates/create' })}>
            <Plus className='size-4' />
            {t('products.templates.list.add_button', 'Add Template')}
          </Button>
        </div>
      </div>

      <Separator />

      <div className='space-y-4'>
        <TemplateSearchFilters initialValues={list.appliedFilters} onSearch={list.applyFilters} onReset={list.resetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('products.templates.list.error.load_title', 'Unable to load templates')}</h2>
              <p className='text-muted-foreground text-sm'>
                {t('products.templates.list.error.load_description', 'The request failed. Please try again.')}
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
                    {t('products.templates.list.error.refresh', 'Unable to refresh templates. Showing previous data.')}
                  </p>
                </div>
                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data?.templates ?? []}
              columns={columns}
              state={list.tableState}
              pageInfo={{
                pageCount: response?.data?.pagination?.total_page ?? 0,
                rowCount: response?.data?.pagination?.total_item ?? 0,
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

      <AppDialogModal
        isOpen={deleteId !== null}
        setIsOpen={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('products.templates.list.delete_dialog.title', 'Delete Template')}
        confirmLoading={deleteMutation.isPending}
        footer={
          <>
            <AppButton variant='outline' onClick={() => setDeleteId(null)} disabled={deleteMutation.isPending}>
              {t('products.templates.list.delete_dialog.cancel', 'Cancel')}
            </AppButton>
            <AppButton variant='destructive' onClick={handleDeleteConfirm} isLoading={deleteMutation.isPending}>
              {t('products.templates.list.delete_dialog.confirm', 'Delete')}
            </AppButton>
          </>
        }
      >
        <p className='text-sm'>
          {t('products.templates.list.delete_dialog.description', 'Are you sure you want to delete this template? This action cannot be undone.')}
        </p>
      </AppDialogModal>

      <TemplateExportDialog
        isOpen={isExportDialogOpen}
        totalCount={response?.data?.pagination?.total_item ?? 0}
        currentPageCount={response?.data?.templates?.length ?? 0}
        selectedCount={selectedTemplateIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />

      <TemplateCopyDialog templateId={copyId} isCopying={copyMutation.isPending} onClose={() => setCopyId(null)} onConfirm={handleCopyConfirm} />
    </PageContainer>
  );
}
