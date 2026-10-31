import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type OnChangeFn, type PaginationState, type RowSelectionState, type SortingState } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';
import {
  useAssignManager,
  useInquiryList,
  useInquirySearchFilters,
  useUpdateInquiryStatus,
  type InquiryFilterREQ,
  type InquirySortField,
} from '../api';
import { InquiryFilter, InquiryTable } from '../components/list';
import { type InquiryExportType } from '../enums';
import { useInquiryExport } from '../hooks/useInquiryExport';
import { AssignManagerDialog, InquiryExportDialog, UpdateStatusDialog } from '../components/modal';
import type { InquiryListSearch } from '../schemas';
import type { InquiryDTO } from '../types';

const routeApi = getRouteApi('/inquiries/');

type InquiryListPageProps = {
  getDetailTo: (inquiryId: string) => string;
};

export function InquiryListPage({ getDetailTo }: InquiryListPageProps) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDTO | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const currentPage = search.page ?? DEFAULT_PAGE;
  const currentPerPage = search.per_page ?? DEFAULT_PER_PAGE;
  const queryParams: InquiryFilterREQ = {
    ...search,
    page: currentPage,
    per_page: currentPerPage,
  };

  const { data: filterResponse } = useInquirySearchFilters();
  const { data: response, isLoading } = useInquiryList(queryParams);
  const assignMutation = useAssignManager();
  const statusMutation = useUpdateInquiryStatus();

  const rows = response?.data?.inquiries ?? [];
  const selectedIds = useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [rowSelection],
  );

  const { isExporting, startExport } = useInquiryExport({ filters: queryParams, selectedIds });

  const tableState = {
    pagination: {
      pageIndex: currentPage - DEFAULT_PAGE,
      pageSize: currentPerPage,
    } satisfies PaginationState,
    sorting: search.sort_by ? [{ id: search.sort_by, desc: search.sort_order === SortOrder.DESC }] : [],
  } satisfies {
    pagination: PaginationState;
    sorting: SortingState;
  };

  const pageInfo = {
    pageCount: response?.pagination.total_page ?? 0,
    rowCount: response?.pagination.total_item ?? 0,
  };

  const handleFilterSearch = (values: Pick<InquiryListSearch, 'inquiry_type' | 'inquirer_name' | 'status' | 'created_from' | 'created_to'>) => {
    setRowSelection({});
    navigate({ search: (prev) => ({ ...prev, ...values, page: undefined }) });
  };

  const handleFilterReset = () => {
    setRowSelection({});
    navigate({ search: (prev) => ({ per_page: prev.per_page, sort_by: prev.sort_by, sort_order: prev.sort_order, page: undefined }) });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const next = functionalUpdate(updaterOrValue, tableState.pagination);
    setRowSelection({});
    navigate({
      search: (prev) => ({
        ...prev,
        page: next.pageIndex + 1 === DEFAULT_PAGE ? undefined : next.pageIndex + 1,
        per_page: next.pageSize === DEFAULT_PER_PAGE ? undefined : next.pageSize,
      }),
    });
  };

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const next = functionalUpdate(updaterOrValue, tableState.sorting);
    const firstSort = next[0];
    navigate({
      search: (prev) => ({
        ...prev,
        sort_by: firstSort ? (firstSort.id as InquirySortField) : undefined,
        sort_order: firstSort ? (firstSort.desc ? SortOrder.DESC : SortOrder.ASC) : undefined,
        page: undefined,
      }),
    });
  };

  const handleExport = (exportType: InquiryExportType) => {
    startExport(exportType)
      .then(() => setExportOpen(false))
      .catch(() => {});
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.inquiries.list.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.inquiries.list.description')}</p> */}
        </div>

        <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setExportOpen(true)}>
          <Download className='size-4' />
          {t('common.export.button')}
        </Button>
      </div>

      <Separator />

      <div className='space-y-4'>
        <InquiryFilter initialValues={search} onSearch={handleFilterSearch} onReset={handleFilterReset} />
        <InquiryTable
          data={rows}
          isLoading={isLoading}
          state={tableState}
          pageInfo={pageInfo}
          getDetailTo={getDetailTo}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onAssignManager={(item) => {
            setSelectedInquiry(item);
            setAssignOpen(true);
          }}
          onChangeStatus={(item) => {
            setSelectedInquiry(item);
            setStatusOpen(true);
          }}
        />
      </div>

      <AssignManagerDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        managers={filterResponse?.data.filters.assigned_to_options ?? []}
        defaultPersonInCharge={selectedInquiry?.assigned_to ? String(selectedInquiry.assigned_to.id) : undefined}
        isLoading={assignMutation.isPending}
        onSubmit={(values) => {
          if (!selectedInquiry) return;
          assignMutation.mutate(
            { id: String(selectedInquiry.id), data: values },
            {
              onSuccess: () => {
                toast.success(t('page.inquiries.messages.assign_success'));
                setAssignOpen(false);
              },
            },
          );
        }}
      />

      <UpdateStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        currentStatus={selectedInquiry?.status}
        isLoading={statusMutation.isPending}
        onSubmit={(values) => {
          if (!selectedInquiry) return;
          statusMutation.mutate(
            { id: String(selectedInquiry.id), data: values },
            {
              onSuccess: () => {
                toast.success(t('page.inquiries.messages.status_update_success'));
                setStatusOpen(false);
              },
            },
          );
        }}
      />

      <InquiryExportDialog
        isOpen={exportOpen}
        totalCount={pageInfo.rowCount}
        currentPageCount={rows.length}
        selectedCount={selectedIds.length}
        isExporting={isExporting}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
      />
    </PageContainer>
  );
}
