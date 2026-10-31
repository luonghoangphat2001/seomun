import { getRouteApi } from '@tanstack/react-router';
import {
  functionalUpdate,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table';
import { AlertCircle, FileDown, Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import { useDeleteProductMutation, useProductsQuery, type ProductListItemRESP, type ProductListLocale } from '../api';
import { ProductExportDialog } from '../components/ProductExportDialog';
import { getProductColumns } from '../components/ProductColumns';
import { ProductSearchFilters } from '../components/ProductSearchFilters';
import { ProductStatus, type ProductExportType } from '../enums';
import { useProductExport } from '../hooks/useProductExport';
import type { ProductSearchFilterValues } from '../schemas';
import { buildProductListParams, isProductSortField, normalizeProductQuery } from '../utils/product-list-params';

const routeApi = getRouteApi('/products/');

function stringifyBooleanFilter(value?: boolean): 'true' | 'false' | undefined {
  if (typeof value !== 'boolean') return undefined;
  return value ? 'true' : 'false';
}

function normalizeProductListLocale(locale?: string): ProductListLocale {
  return locale?.startsWith('ko') ? 'ko' : 'en';
}

export function ProductListPage() {
  const { t, i18n } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const currentLocale = normalizeProductListLocale(i18n.resolvedLanguage || i18n.language);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductListItemRESP | null>(null);
  const deleteMutation = useDeleteProductMutation();
  const handleEdit = useCallback(
    (product: ProductListItemRESP) => {
      void navigate({ to: '/products/$productId/edit', params: { productId: product.id } });
    },
    [navigate],
  );
  const handleDeleteConfirm = useCallback(() => {
    if (!productToDelete) return;

    deleteMutation.mutate(productToDelete.id, {
      onSuccess: () => {
        toast.success(t('products.management.delete_dialog.success'));
        setProductToDelete(null);
      },
      onError: () => {
        toast.error(t('products.management.delete_dialog.error'));
        setProductToDelete(null);
      },
    });
  }, [deleteMutation, productToDelete, t]);
  const columns = useMemo(
    () =>
      getProductColumns({
        labels: {
          thumbnail: t('products.management.columns.thumbnail'),
          noImage: t('products.management.columns.no_image'),
          productCode: t('products.management.columns.product_code'),
          productName: t('products.management.columns.product_name'),
          category: t('products.management.columns.category'),
          status: t('products.management.columns.status'),
          statusLabels: {
            [ProductStatus.SOLD]: t('products.management.status.sold'),
            [ProductStatus.HIDDEN]: t('products.management.status.hidden'),
          },
          createdAt: t('products.management.columns.created_at'),
          actions: t('products.management.columns.actions'),
          edit: t('products.management.actions.edit'),
          delete: tCommon('action.delete'),
        },
        onEdit: handleEdit,
        onDelete: setProductToDelete,
      }),
    [handleEdit, t, tCommon],
  );

  const queryParams = useMemo(() => buildProductListParams(search), [search]);
  const { data: response, isError, isFetching, isLoading, refetch } = useProductsQuery(queryParams, currentLocale);
  const selectedIds = useMemo(() => Object.keys(rowSelection).filter((id) => rowSelection[id]), [rowSelection]);

  const { isExporting, startExport } = useProductExport({ filters: queryParams, selectedIds });

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

  const appliedFilters = useMemo<ProductSearchFilterValues>(
    () => ({
      search_term: search.search_term ?? '',
      product_name: search.product_name ?? '',
      product_code: search.product_code ?? '',
      category_id: search.category_id ? String(search.category_id) : undefined,
      status: search.status,
      product_type: search.product_type,
      is_promotional: stringifyBooleanFilter(search.is_promotional),
      branch: search.branch ?? '',
      customer: search.customer ?? '',
      type: search.type ?? '',
      is_public: stringifyBooleanFilter(search.is_public),
      has_quotation: stringifyBooleanFilter(search.has_quotation),
      customer_usage: search.customer_usage ?? '',
    }),
    [
      search.branch,
      search.category_id,
      search.customer,
      search.customer_usage,
      search.has_quotation,
      search.is_promotional,
      search.is_public,
      search.product_code,
      search.product_name,
      search.product_type,
      search.search_term,
      search.status,
      search.type,
    ],
  );

  const hasListData = response !== undefined;
  const shouldShowInitialError = isError && !hasListData;
  const shouldShowRefreshError = isError && hasListData;

  const handleApplyFilters = useCallback(
    (values: ProductSearchFilterValues) => {
      void navigate({
        search: (previous) => ({
          ...previous,
          page: undefined,
          search_term: normalizeProductQuery(values.search_term),
          product_name: normalizeProductQuery(values.product_name),
          product_code: normalizeProductQuery(values.product_code),
          category_id: values.category_id ? Number(values.category_id) : undefined,
          status: values.status,
          product_type: normalizeProductQuery(values.product_type),
          is_promotional: values.is_promotional === undefined ? undefined : values.is_promotional === 'true',
          branch: normalizeProductQuery(values.branch),
          customer: normalizeProductQuery(values.customer),
          type: normalizeProductQuery(values.type),
          is_public: values.is_public === undefined ? undefined : values.is_public === 'true',
          has_quotation: values.has_quotation === undefined ? undefined : values.has_quotation === 'true',
          customer_usage: normalizeProductQuery(values.customer_usage),
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
        search_term: undefined,
        product_name: undefined,
        product_code: undefined,
        category_id: undefined,
        status: undefined,
        product_type: undefined,
        is_promotional: undefined,
        branch: undefined,
        customer: undefined,
        type: undefined,
        is_public: undefined,
        has_quotation: undefined,
        customer_usage: undefined,
      }),
    });
  }, [navigate]);

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = functionalUpdate(updater, tableSorting);
      const nextSort = nextSorting[0];
      const nextSortBy = nextSort && isProductSortField(nextSort.id) ? nextSort.id : undefined;

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

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      const nextPagination = functionalUpdate(updaterOrValue, tablePagination);

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

  const handleExport = useCallback(
    (type: ProductExportType) => {
      startExport(type)
        .then(() => setIsExportOpen(false))
        .catch(() => {});
    },
    [startExport],
  );

  const handleCreate = useCallback(() => {
    void navigate({ to: '/products/create' });
  }, [navigate]);

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {tCommon('action.retry')}
    </Button>
  );

  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('products.management.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('products.management.description')}</p> */}
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setIsExportOpen(true)}>
            <FileDown className='size-4' />
            {tCommon('export.button')}
          </Button>
          <Button size='sm' className='gap-1.5' onClick={handleCreate}>
            <Plus className='size-4' />
            {t('products.management.actions.create')}
          </Button>
        </div>
      </div>

      <Separator />

      <div className='space-y-4'>
        <ProductSearchFilters initialValues={appliedFilters} locale={currentLocale} onSearch={handleApplyFilters} onReset={handleResetFilters} />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('products.management.messages.load_error_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('products.management.messages.load_error_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('products.management.messages.refresh_error')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            <DataTable
              data={response?.data.products ?? []}
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
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={(row) => row.id}
            />
          </>
        )}
      </div>

      <ProductExportDialog
        isOpen={isExportOpen}
        totalCount={response?.pagination?.total_item ?? 0}
        currentPageCount={response?.data.products?.length ?? 0}
        selectedCount={selectedIds.length}
        isExporting={isExporting}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />

      <AppDialogModal
        isOpen={productToDelete !== null}
        setIsOpen={(open) => {
          if (!open) setProductToDelete(null);
        }}
        title={t('products.management.delete_dialog.title')}
        confirmLoading={deleteMutation.isPending}
        footer={
          <>
            <AppButton variant='outline' onClick={() => setProductToDelete(null)} disabled={deleteMutation.isPending}>
              {tCommon('action.cancel')}
            </AppButton>
            <AppButton variant='destructive' onClick={handleDeleteConfirm} isLoading={deleteMutation.isPending}>
              {tCommon('action.delete')}
            </AppButton>
          </>
        }
      >
        <p className='text-sm'>{t('products.management.delete_dialog.description', { name: productToDelete?.product_name })}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
