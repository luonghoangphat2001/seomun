import { getRouteApi } from '@tanstack/react-router';
import type { PaginationState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PER_PAGE } from '@/constants/pagination';
import { usePapersQuery } from '@/features/products/options';

import {
  useDeleteOtherUnitPriceMutation,
  useDeletePaperPriceMutation,
  useDeletePostProcessingPriceMutation,
  useDeletePrintingPriceMutation,
  useOtherUnitPricesQuery,
  usePaperPriceSearchFiltersQuery,
  usePaperPricesQuery,
  usePostProcessingPricesQuery,
  usePrintingPricesQuery,
  useToggleOtherUnitPriceStatusMutation,
  type OtherUnitPrice,
  type PaperPrice,
  type PostProcessingPrice,
  type PrintingPrice,
  type UnitPriceSectionKey,
} from '../api';
import { EMPTY_OTHER_PRICE_FILTER_VALUES, OtherPriceFormDialog, OtherPriceSection, type OtherPriceFilterValues } from '../components/other-price';
import { EMPTY_PAPER_PRICE_FILTER_VALUES, PaperPriceFormDialog, PaperPriceSection, type PaperPriceFilterValues } from '../components/paper-price';
import { PostProcessingPriceFormDialog, PostProcessingPriceSection } from '../components/post-processing-price';
import { PrintingPriceFormDialog, PrintingPriceSection } from '../components/printing-price';
import { DEFAULT_UNIT_PRICE_SECTION } from '../constants';

const unitPriceSettingsRouteApi = getRouteApi('/products/unit-price-settings');

export function UnitPriceSettingsPage() {
  const { t } = useTranslation();
  const search = unitPriceSettingsRouteApi.useSearch();
  const navigate = unitPriceSettingsRouteApi.useNavigate();
  const activeSection: UnitPriceSectionKey = search.section ?? DEFAULT_UNIT_PRICE_SECTION;

  const handleSectionChange = useCallback(
    (section: UnitPriceSectionKey) => {
      navigate({ search: (prev) => ({ ...prev, section }) });
    },
    [navigate],
  );

  const [paperPriceFilters, setPaperPriceFilters] = useState<PaperPriceFilterValues>(EMPTY_PAPER_PRICE_FILTER_VALUES);
  const [paperPricePagination, setPaperPricePagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PER_PAGE });
  const [isPaperPriceDialogOpen, setIsPaperPriceDialogOpen] = useState(false);
  const [editingPaperPrice, setEditingPaperPrice] = useState<PaperPrice | undefined>(undefined);
  const [deletePaperPriceTarget, setDeletePaperPriceTarget] = useState<PaperPrice | null>(null);

  const [printingPricePagination, setPrintingPricePagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PER_PAGE });
  const [isPrintingPriceDialogOpen, setIsPrintingPriceDialogOpen] = useState(false);
  const [editingPrintingPrice, setEditingPrintingPrice] = useState<PrintingPrice | undefined>(undefined);
  const [deletePrintingPriceTarget, setDeletePrintingPriceTarget] = useState<PrintingPrice | null>(null);

  const [postProcessingPricePagination, setPostProcessingPricePagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PER_PAGE });
  const [isPostProcessingPriceDialogOpen, setIsPostProcessingPriceDialogOpen] = useState(false);
  const [editingPostProcessingPrice, setEditingPostProcessingPrice] = useState<PostProcessingPrice | undefined>(undefined);
  const [deletePostProcessingPriceTarget, setDeletePostProcessingPriceTarget] = useState<PostProcessingPrice | null>(null);

  const [otherPriceFilters, setOtherPriceFilters] = useState<OtherPriceFilterValues>(EMPTY_OTHER_PRICE_FILTER_VALUES);
  const [otherPricePagination, setOtherPricePagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PER_PAGE });
  const [isOtherPriceDialogOpen, setIsOtherPriceDialogOpen] = useState(false);
  const [editingOtherPrice, setEditingOtherPrice] = useState<OtherUnitPrice | undefined>(undefined);
  const [deleteOtherPriceTarget, setDeleteOtherPriceTarget] = useState<OtherUnitPrice | null>(null);
  const [togglingOtherPriceId, setTogglingOtherPriceId] = useState<number | null>(null);

  const isPapers = activeSection === 'papers';
  const isPrinting = activeSection === 'printing';
  const isPostProcessing = activeSection === 'post_processing';
  const isOther = activeSection === 'other';

  // === Paper price ===

  const papersListQuery = usePapersQuery({ per_page: 100 }, { enabled: isPapers });
  const paperPriceSearchFiltersQuery = usePaperPriceSearchFiltersQuery({ enabled: isPapers });

  const paperPriceQueryParams = useMemo(
    () => ({
      current_page: paperPricePagination.pageIndex + 1,
      per_page: paperPricePagination.pageSize,
      paper_id: paperPriceFilters.paper_id ? Number(paperPriceFilters.paper_id) : undefined,
      paper_size_division_code: paperPriceFilters.paper_size_division_code,
      is_hot_deal: paperPriceFilters.is_hot_deal === undefined ? undefined : paperPriceFilters.is_hot_deal === 'true',
    }),
    [paperPriceFilters, paperPricePagination],
  );
  const paperPricesQuery = usePaperPricesQuery(paperPriceQueryParams, { enabled: isPapers });
  const deletePaperPrice = useDeletePaperPriceMutation();

  const papers = papersListQuery.data?.data.papers ?? [];
  const paperSizeDivisionOptions = paperPriceSearchFiltersQuery.data?.data.filters;
  const paperPriceRows = paperPricesQuery.data?.data.paper_prices ?? [];
  const paperPricesHasData = paperPricesQuery.data !== undefined;

  const handleOpenCreatePaperPrice = () => {
    setEditingPaperPrice(undefined);
    setIsPaperPriceDialogOpen(true);
  };

  const handleOpenEditPaperPrice = useCallback((item: PaperPrice) => {
    setEditingPaperPrice(item);
    setIsPaperPriceDialogOpen(true);
  }, []);

  const handleClosePaperPriceDialog = () => {
    setIsPaperPriceDialogOpen(false);
    setEditingPaperPrice(undefined);
  };

  const handleConfirmDeletePaperPrice = () => {
    if (!deletePaperPriceTarget) {
      return;
    }

    deletePaperPrice.mutate(deletePaperPriceTarget.id, {
      onSuccess: () => {
        toast.success(t('page.products.unit_price_settings.messages.delete_success'));
        setDeletePaperPriceTarget(null);
      },
      onError: () => toast.error(t('page.products.unit_price_settings.messages.delete_error')),
    });
  };

  const handleSearchPaperPriceFilters = (values: PaperPriceFilterValues) => {
    setPaperPriceFilters(values);
    setPaperPricePagination((previous) => ({ ...previous, pageIndex: 0 }));
  };

  const handleResetPaperPriceFilters = () => {
    setPaperPriceFilters(EMPTY_PAPER_PRICE_FILTER_VALUES);
    setPaperPricePagination((previous) => ({ ...previous, pageIndex: 0 }));
  };

  // === Printing price ===

  const printingPriceQueryParams = useMemo(
    () => ({
      current_page: printingPricePagination.pageIndex + 1,
      per_page: printingPricePagination.pageSize,
    }),
    [printingPricePagination],
  );
  const printingPricesQuery = usePrintingPricesQuery(printingPriceQueryParams, { enabled: isPrinting });
  const deletePrintingPrice = useDeletePrintingPriceMutation();

  const printingPriceRows = printingPricesQuery.data?.data.printing_prices ?? [];
  const printingPricesHasData = printingPricesQuery.data !== undefined;

  const handleOpenCreatePrintingPrice = () => {
    setEditingPrintingPrice(undefined);
    setIsPrintingPriceDialogOpen(true);
  };

  const handleOpenEditPrintingPrice = useCallback((item: PrintingPrice) => {
    setEditingPrintingPrice(item);
    setIsPrintingPriceDialogOpen(true);
  }, []);

  const handleClosePrintingPriceDialog = () => {
    setIsPrintingPriceDialogOpen(false);
    setEditingPrintingPrice(undefined);
  };

  const handleConfirmDeletePrintingPrice = () => {
    if (!deletePrintingPriceTarget) {
      return;
    }

    deletePrintingPrice.mutate(deletePrintingPriceTarget.id, {
      onSuccess: () => {
        toast.success(t('page.products.unit_price_settings.messages.delete_success'));
        setDeletePrintingPriceTarget(null);
      },
      onError: () => toast.error(t('page.products.unit_price_settings.messages.delete_error')),
    });
  };

  // === Post-processing price ===

  const postProcessingPriceQueryParams = useMemo(
    () => ({
      current_page: postProcessingPricePagination.pageIndex + 1,
      per_page: postProcessingPricePagination.pageSize,
    }),
    [postProcessingPricePagination],
  );
  const postProcessingPricesQuery = usePostProcessingPricesQuery(postProcessingPriceQueryParams, { enabled: isPostProcessing });
  const deletePostProcessingPrice = useDeletePostProcessingPriceMutation();

  const postProcessingPriceRows = postProcessingPricesQuery.data?.data.post_processing_prices ?? [];
  const postProcessingPricesHasData = postProcessingPricesQuery.data !== undefined;

  const handleOpenCreatePostProcessingPrice = () => {
    setEditingPostProcessingPrice(undefined);
    setIsPostProcessingPriceDialogOpen(true);
  };

  const handleOpenEditPostProcessingPrice = useCallback((item: PostProcessingPrice) => {
    setEditingPostProcessingPrice(item);
    setIsPostProcessingPriceDialogOpen(true);
  }, []);

  const handleClosePostProcessingPriceDialog = () => {
    setIsPostProcessingPriceDialogOpen(false);
    setEditingPostProcessingPrice(undefined);
  };

  const handleConfirmDeletePostProcessingPrice = () => {
    if (!deletePostProcessingPriceTarget) {
      return;
    }

    deletePostProcessingPrice.mutate(deletePostProcessingPriceTarget.id, {
      onSuccess: () => {
        toast.success(t('page.products.unit_price_settings.messages.delete_success'));
        setDeletePostProcessingPriceTarget(null);
      },
      onError: () => toast.error(t('page.products.unit_price_settings.messages.delete_error')),
    });
  };

  // === Other unit price ===

  const otherPriceQueryParams = useMemo(
    () => ({
      current_page: otherPricePagination.pageIndex + 1,
      per_page: otherPricePagination.pageSize,
      product_id: otherPriceFilters.product_id ? Number(otherPriceFilters.product_id) : undefined,
      category_id: otherPriceFilters.category_id ? Number(otherPriceFilters.category_id) : undefined,
      search_keyword: otherPriceFilters.search_keyword,
      is_active: otherPriceFilters.is_active === undefined ? undefined : otherPriceFilters.is_active === 'true',
    }),
    [otherPriceFilters, otherPricePagination],
  );
  const otherUnitPricesQuery = useOtherUnitPricesQuery(otherPriceQueryParams, { enabled: isOther });
  const deleteOtherPrice = useDeleteOtherUnitPriceMutation();
  const toggleOtherPriceStatus = useToggleOtherUnitPriceStatusMutation();

  const otherPriceRows = otherUnitPricesQuery.data?.data.unit_prices ?? [];
  const otherPricesHasData = otherUnitPricesQuery.data !== undefined;

  const handleOpenCreateOtherPrice = () => {
    setEditingOtherPrice(undefined);
    setIsOtherPriceDialogOpen(true);
  };

  const handleOpenEditOtherPrice = useCallback((item: OtherUnitPrice) => {
    setEditingOtherPrice(item);
    setIsOtherPriceDialogOpen(true);
  }, []);

  const handleCloseOtherPriceDialog = () => {
    setIsOtherPriceDialogOpen(false);
    setEditingOtherPrice(undefined);
  };

  const handleConfirmDeleteOtherPrice = () => {
    if (!deleteOtherPriceTarget) {
      return;
    }

    deleteOtherPrice.mutate(deleteOtherPriceTarget.id, {
      onSuccess: () => {
        toast.success(t('page.products.unit_price_settings.messages.delete_success'));
        setDeleteOtherPriceTarget(null);
      },
      onError: () => toast.error(t('page.products.unit_price_settings.messages.delete_error')),
    });
  };

  const handleSearchOtherPriceFilters = (values: OtherPriceFilterValues) => {
    setOtherPriceFilters(values);
    setOtherPricePagination((previous) => ({ ...previous, pageIndex: 0 }));
  };

  const handleResetOtherPriceFilters = () => {
    setOtherPriceFilters(EMPTY_OTHER_PRICE_FILTER_VALUES);
    setOtherPricePagination((previous) => ({ ...previous, pageIndex: 0 }));
  };

  const handleToggleOtherPriceStatus = (item: OtherUnitPrice) => {
    setTogglingOtherPriceId(item.id);
    toggleOtherPriceStatus.mutate(item.id, {
      onSettled: () => setTogglingOtherPriceId(null),
      onError: () => toast.error(t('page.products.unit_price_settings.other_price.messages.toggle_status_error', 'Failed to update status.')),
    });
  };

  const handleOpenCreate = isPapers
    ? handleOpenCreatePaperPrice
    : isPrinting
      ? handleOpenCreatePrintingPrice
      : isPostProcessing
        ? handleOpenCreatePostProcessingPrice
        : handleOpenCreateOtherPrice;

  return (
    <PageContainer>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.products.unit_price_settings.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.products.unit_price_settings.list.description')}</p> */}
        </div>

        <Button size='sm' className='gap-1.5' onClick={handleOpenCreate}>
          <Plus className='size-4' />
          {t('page.products.unit_price_settings.actions.add')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        {isPapers ? (
          <PaperPriceSection
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            papers={papers}
            searchFilters={paperSizeDivisionOptions}
            filterValues={paperPriceFilters}
            onSearch={handleSearchPaperPriceFilters}
            onReset={handleResetPaperPriceFilters}
            rows={paperPriceRows}
            isLoading={paperPricesQuery.isLoading}
            isFetching={paperPricesQuery.isFetching}
            isError={paperPricesQuery.isError}
            hasData={paperPricesHasData}
            onRetry={() => void paperPricesQuery.refetch()}
            pagination={paperPricePagination}
            onPaginationChange={setPaperPricePagination}
            pageCount={paperPricesQuery.data?.pagination?.total_page ?? 0}
            rowCount={paperPricesQuery.data?.pagination?.total_item ?? 0}
            onEdit={handleOpenEditPaperPrice}
            onDelete={setDeletePaperPriceTarget}
          />
        ) : isPrinting ? (
          <PrintingPriceSection
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            rows={printingPriceRows}
            isLoading={printingPricesQuery.isLoading}
            isFetching={printingPricesQuery.isFetching}
            isError={printingPricesQuery.isError}
            hasData={printingPricesHasData}
            onRetry={() => void printingPricesQuery.refetch()}
            pagination={printingPricePagination}
            onPaginationChange={setPrintingPricePagination}
            pageCount={printingPricesQuery.data?.pagination?.total_page ?? 0}
            rowCount={printingPricesQuery.data?.pagination?.total_item ?? 0}
            onEdit={handleOpenEditPrintingPrice}
            onDelete={setDeletePrintingPriceTarget}
          />
        ) : isPostProcessing ? (
          <PostProcessingPriceSection
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            rows={postProcessingPriceRows}
            isLoading={postProcessingPricesQuery.isLoading}
            isFetching={postProcessingPricesQuery.isFetching}
            isError={postProcessingPricesQuery.isError}
            hasData={postProcessingPricesHasData}
            onRetry={() => void postProcessingPricesQuery.refetch()}
            pagination={postProcessingPricePagination}
            onPaginationChange={setPostProcessingPricePagination}
            pageCount={postProcessingPricesQuery.data?.pagination?.total_page ?? 0}
            rowCount={postProcessingPricesQuery.data?.pagination?.total_item ?? 0}
            onEdit={handleOpenEditPostProcessingPrice}
            onDelete={setDeletePostProcessingPriceTarget}
          />
        ) : (
          <OtherPriceSection
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            filterValues={otherPriceFilters}
            onSearch={handleSearchOtherPriceFilters}
            onReset={handleResetOtherPriceFilters}
            rows={otherPriceRows}
            isLoading={otherUnitPricesQuery.isLoading}
            isFetching={otherUnitPricesQuery.isFetching}
            isError={otherUnitPricesQuery.isError}
            hasData={otherPricesHasData}
            onRetry={() => void otherUnitPricesQuery.refetch()}
            pagination={otherPricePagination}
            onPaginationChange={setOtherPricePagination}
            pageCount={otherUnitPricesQuery.data?.pagination?.total_page ?? 0}
            rowCount={otherUnitPricesQuery.data?.pagination?.total_item ?? 0}
            onEdit={handleOpenEditOtherPrice}
            onDelete={setDeleteOtherPriceTarget}
            onToggleStatus={handleToggleOtherPriceStatus}
            togglingId={togglingOtherPriceId}
          />
        )}
      </div>

      <PaperPriceFormDialog
        isOpen={isPaperPriceDialogOpen}
        papers={papers}
        searchFilters={paperSizeDivisionOptions}
        editPaperPrice={editingPaperPrice}
        onClose={handleClosePaperPriceDialog}
      />

      <AppDialogModal
        isOpen={Boolean(deletePaperPriceTarget)}
        setIsOpen={(isOpen) => {
          if (!isOpen && !deletePaperPrice.isPending) {
            setDeletePaperPriceTarget(null);
          }
        }}
        title={t('page.products.unit_price_settings.messages.delete_title')}
        okText={t('common.action.delete')}
        cancelText={t('common.action.cancel')}
        confirmLoading={deletePaperPrice.isPending}
        onOk={handleConfirmDeletePaperPrice}
      >
        <p className='text-muted-foreground text-sm'>{t('page.products.unit_price_settings.messages.delete_confirm')}</p>
      </AppDialogModal>

      <PrintingPriceFormDialog isOpen={isPrintingPriceDialogOpen} editPrintingPrice={editingPrintingPrice} onClose={handleClosePrintingPriceDialog} />

      <AppDialogModal
        isOpen={Boolean(deletePrintingPriceTarget)}
        setIsOpen={(isOpen) => {
          if (!isOpen && !deletePrintingPrice.isPending) {
            setDeletePrintingPriceTarget(null);
          }
        }}
        title={t('page.products.unit_price_settings.messages.delete_title')}
        okText={t('common.action.delete')}
        cancelText={t('common.action.cancel')}
        confirmLoading={deletePrintingPrice.isPending}
        onOk={handleConfirmDeletePrintingPrice}
      >
        <p className='text-muted-foreground text-sm'>{t('page.products.unit_price_settings.messages.delete_confirm')}</p>
      </AppDialogModal>

      <PostProcessingPriceFormDialog
        isOpen={isPostProcessingPriceDialogOpen}
        editPostProcessingPrice={editingPostProcessingPrice}
        onClose={handleClosePostProcessingPriceDialog}
      />

      <AppDialogModal
        isOpen={Boolean(deletePostProcessingPriceTarget)}
        setIsOpen={(isOpen) => {
          if (!isOpen && !deletePostProcessingPrice.isPending) {
            setDeletePostProcessingPriceTarget(null);
          }
        }}
        title={t('page.products.unit_price_settings.messages.delete_title')}
        okText={t('common.action.delete')}
        cancelText={t('common.action.cancel')}
        confirmLoading={deletePostProcessingPrice.isPending}
        onOk={handleConfirmDeletePostProcessingPrice}
      >
        <p className='text-muted-foreground text-sm'>{t('page.products.unit_price_settings.messages.delete_confirm')}</p>
      </AppDialogModal>

      <OtherPriceFormDialog isOpen={isOtherPriceDialogOpen} editOtherUnitPrice={editingOtherPrice} onClose={handleCloseOtherPriceDialog} />

      <AppDialogModal
        isOpen={Boolean(deleteOtherPriceTarget)}
        setIsOpen={(isOpen) => {
          if (!isOpen && !deleteOtherPrice.isPending) {
            setDeleteOtherPriceTarget(null);
          }
        }}
        title={t('page.products.unit_price_settings.messages.delete_title')}
        okText={t('common.action.delete')}
        cancelText={t('common.action.cancel')}
        confirmLoading={deleteOtherPrice.isPending}
        onOk={handleConfirmDeleteOtherPrice}
      >
        <p className='text-muted-foreground text-sm'>{t('page.products.unit_price_settings.messages.delete_confirm')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
