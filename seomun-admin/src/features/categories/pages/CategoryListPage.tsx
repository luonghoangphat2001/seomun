import { Link, getRouteApi } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, FileDown, Info, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { PageContainer } from '@/components/shared/PageContainer';
import { AppDialogModal } from '@/components/shared/app-dialog-modal/AppDialogModal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDateOnly } from '@/utils/format-date';

import {
  useCategoryListQuery,
  useCategorySearchFiltersQuery,
  useDeleteCategoryMutation,
  useExportCategoriesMutation,
  useUpdateCategorySortOrderMutation,
} from '../api/category.query';
import { buildCategoryListParams, downloadFileFromUrl, getCategoryApiErrorMessage } from '../utils';
import { CategoryExportDialog } from '../components/CategoryExportDialog';
import { CategoryFilter } from '../components/CategoryFilter';
import { CategoryTreeTable } from '../components/CategoryTreeTable';
import { CATEGORY_SORT_FIELD, ExportType } from '../enums';
import type { ExportCategoriesREQ } from '../api/category.request';
import type { Category } from '../api/category.response';
import type { CategoryListSearch } from '../schemas';

const routeApi = getRouteApi('/categories/');

export function CategoryListPage() {
  const { t, i18n } = useTranslation();
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  // State
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Build API params from search
  const queryParams = useMemo(() => buildCategoryListParams(search), [search]);
  const appliedFilters = useMemo<Partial<CategoryListSearch>>(
    () => ({
      name: search.name,
      status: search.status,
      level: search.level,
      registrant: search.registrant,
    }),
    [search.name, search.status, search.level, search.registrant],
  );

  // Fetch category list
  const { data: categoryData, isLoading, isError, isFetching, refetch } = useCategoryListQuery(queryParams);
  const { data: filterResponse, isLoading: isLoadingFilters } = useCategorySearchFiltersQuery();

  const categories = useMemo(() => categoryData?.data.categories ?? [], [categoryData?.data.categories]);
  const pagination = useMemo(() => categoryData?.pagination, [categoryData?.pagination]);
  const hasListData = useMemo(() => categoryData !== undefined, [categoryData]);
  const shouldShowInitialError = useMemo(() => isError && !hasListData, [hasListData, isError]);
  const shouldShowRefreshError = useMemo(() => isError && hasListData, [hasListData, isError]);

  const renderRetryButton = (variant: 'outline' | 'secondary' = 'outline') => (
    <Button type='button' variant={variant} onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
      {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
      {t('page.category.list.retry')}
    </Button>
  );

  // Filter handlers
  const handleSubmitFilter = useCallback(
    (filter: Partial<CategoryListSearch>) => {
      void navigate({
        search: (previous) => ({
          ...filter,
          per_page: previous.per_page,
          page: undefined,
        }),
      });
    },
    [navigate],
  );

  const handleResetFilter = useCallback(() => {
    void navigate({
      search: (previous) => ({
        per_page: previous.per_page,
        page: undefined,
      }),
    });
  }, [navigate]);

  // Page change
  const handlePageChange = useCallback(
    (pageIndex: number, pageSize?: number) => {
      void navigate({
        search: (prev) => ({
          ...prev,
          page: pageIndex + 1,
          ...(pageSize ? { per_page: pageSize } : {}),
        }),
      });
    },
    [navigate],
  );

  // View / Edit / Delete handlers
  const handleView = (category: Category) => {
    void navigate({ to: '/categories/$categoryId', params: { categoryId: category.id.toString() } });
  };

  const handleEdit = (category: Category) => {
    void navigate({ to: '/categories/$categoryId/edit', params: { categoryId: category.id.toString() } });
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete({ id: category.id, name: category.name });
  };

  // Delete mutation
  const deleteMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      toast.success(t('page.category.delete.success'));
      setCategoryToDelete(null);
    },
    onError: (error) => {
      toast.error(getCategoryApiErrorMessage(error, t('page.category.delete.error')));
    },
  });

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;
    deleteMutation.mutate(categoryToDelete.id);
  };

  // Reorder mutation
  const reorderMutation = useUpdateCategorySortOrderMutation({
    onSuccess: () => {
      toast.success(t('page.category.reorder.success', 'Category sort order updated successfully.'));
    },
    onError: (error) => {
      toast.error(getCategoryApiErrorMessage(error, t('page.category.reorder.error', 'Failed to update category sort order.')));
    },
  });
  const exportMutation = useExportCategoriesMutation();

  const handleReorder = (orderedIds: number[]) => {
    if (reorderMutation.isPending) return;

    const categories = orderedIds.map((id, index) => ({
      id,
      sort_order: index + 1,
    }));
    reorderMutation.mutate({ categories });
  };

  const handleSelectionChange = useCallback((selected: Category[]) => {
    setSelectedCategories(selected);
  }, []);

  // Export
  const handleOpenExport = () => {
    setIsExportDialogOpen(true);
  };

  const handleExport = async (type: ExportType) => {
    try {
      const baseFilters = {
        locale: i18n.resolvedLanguage ?? i18n.language,
        sort_by: CATEGORY_SORT_FIELD.CREATED_AT,
        sort_order: 'desc' as const,
        ...(queryParams.name ? { name: queryParams.name } : {}),
        ...(queryParams.status ? { status: queryParams.status } : {}),
        ...(queryParams.level ? { level: queryParams.level } : {}),
        ...(queryParams.registrant ? { registrant: queryParams.registrant } : {}),
      };

      let exportPayload: ExportCategoriesREQ;
      let successMessage = '';

      switch (type) {
        case ExportType.ALL:
          exportPayload = { ...baseFilters, export_type: 'ALL' };
          successMessage = t('page.category.export.success_all', {
            count: pagination?.total_item ?? 0,
            defaultValue: 'Export all completed',
          });
          break;
        case ExportType.CURRENT:
          exportPayload = {
            ...baseFilters,
            export_type: 'CURRENT_PAGE',
            current_page: queryParams.page,
            per_page: queryParams.per_page,
          };
          successMessage = t('page.category.export.success_current', {
            count: categories.length,
            defaultValue: 'Export current page completed',
          });
          break;
        case ExportType.SELECTED: {
          exportPayload = {
            ...baseFilters,
            export_type: 'SELECTED',
            selected_ids: selectedCategories.map((c) => c.id),
          };
          successMessage = t('page.category.export.success_selected', {
            count: selectedCategories.length,
            defaultValue: 'Export selected items completed',
          });
          break;
        }
        default:
          return;
      }

      toast.loading(t('page.category.export.processing', 'Exporting...'), { id: 'category-export' });
      const result = await exportMutation.mutateAsync(exportPayload);
      toast.dismiss('category-export');

      await downloadFileFromUrl(result.fileUrl, `카테고리_${formatDateOnly(new Date())}.xlsx`);

      toast.success(successMessage);
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss('category-export');
      toast.error(getCategoryApiErrorMessage(error, t('page.category.export.error', 'An error occurred while exporting.')));
    }
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.category.list.title', 'Category Management')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>
            {t('page.category.list.description', 'Manage categories and set their exposure order.')}
          </p> */}
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' className='h-10 gap-1.5' onClick={handleOpenExport}>
            <FileDown className='size-4' />
            {tCommon('export.button')}
          </Button>
          <Button size='sm' className='h-10 gap-1.5' asChild>
            <Link to='/categories/create'>
              <Plus className='size-4' />
              {t('page.category.list.create_button', 'Create Category')}
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className='space-y-4'>
        {/* Filter */}
        <CategoryFilter
          filters={filterResponse?.data.filters}
          initialFilter={appliedFilters}
          isLoading={isLoadingFilters}
          onSubmit={handleSubmitFilter}
          onReset={handleResetFilter}
        />

        {shouldShowInitialError ? (
          <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <AlertCircle className='size-6' />
            </div>

            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{t('page.category.list.error.load_title')}</h2>
              <p className='text-muted-foreground text-sm'>{t('page.category.list.error.load_description')}</p>
            </div>

            {renderRetryButton()}
          </div>
        ) : (
          <>
            {shouldShowRefreshError ? (
              <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 size-4 shrink-0' />
                  <p className='text-sm font-medium'>{t('page.category.list.error.refresh')}</p>
                </div>

                {renderRetryButton('secondary')}
              </div>
            ) : null}

            {/* Tree Table */}
            <CategoryTreeTable
              data={categories}
              loading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={handleReorder}
              isReordering={reorderMutation.isPending}
              onSelectionChange={handleSelectionChange}
              enableRowSelection
              pageCount={pagination?.total_page}
              rowCount={pagination?.total_item}
              pageIndex={queryParams.page - 1}
              pageSize={queryParams.per_page}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Info tip */}
        <div className='rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800'>
          <div className='flex items-start gap-2'>
            <Info className='mt-0.5 h-4 w-4 shrink-0' />
            <div>
              <p className='font-medium'>{t('page.category.list.info.title', 'Usage Guide')}</p>
              <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-gray-600'>
                <li>{t('page.category.list.info.drag_tip', 'Drag and drop top-level categories to reorder them.')}</li>
                <li>{t('page.category.list.info.expand_tip', 'Click the arrow icon to expand sub-categories.')}</li>
                <li>{t('page.category.list.info.filter_tip', 'Use the search filter to find specific categories.')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delete Confirm Dialog */}
        <AppDialogModal
          isOpen={categoryToDelete !== null}
          setIsOpen={(open) => !open && setCategoryToDelete(null)}
          title={t('page.category.delete.confirm_title')}
          onOk={handleDeleteConfirm}
          okText={tCommon('action.delete')}
          cancelText={tCommon('action.cancel')}
          confirmLoading={deleteMutation.isPending}
          width={480}
        >
          <div className='py-3'>
            <p className='text-sm text-gray-600'>
              {categoryToDelete
                ? t('page.category.delete.confirm_message_with_name', {
                    name: categoryToDelete.name,
                    defaultValue: `Are you sure you want to delete the category "${categoryToDelete.name}"?`,
                  })
                : t('page.category.delete.confirm_message')}
            </p>
          </div>
        </AppDialogModal>

        {/* Export Dialog */}
        <CategoryExportDialog
          isOpen={isExportDialogOpen}
          totalCount={pagination?.total_item ?? 0}
          currentPageCount={categories.length}
          selectedCount={selectedCategories.length}
          isExporting={exportMutation.isPending}
          onClose={() => setIsExportDialogOpen(false)}
          onExport={handleExport}
        />
      </div>
    </PageContainer>
  );
}

export default CategoryListPage;
