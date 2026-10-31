import { getRouteApi, Link } from '@tanstack/react-router';
import { functionalUpdate, type OnChangeFn, type PaginationState, type RowSelectionState, type SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';
import { getApiErrorMessage } from '@/utils/api-error';
import { downloadFileFromUrl } from '@/utils/download-file';
import { formatDateOnly } from '@/utils/format-date';

import type { CustomerMember } from '../../types/customer.type';
import { useCustomerExportMutation, useCustomerListQuery } from '../api/customer-list.query';
import { CustomerListSortField } from '../api/customer-list.request';
import type { CustomerListWireApprovalStatus, CustomerListWireStatus, ExportCustomerListREQ } from '../api/customer-list.request';
import { CustomerExportDialog, type CustomerExportType } from '../components/CustomerExportDialog';
import { getCustomerListColumns } from '../components/CustomerListColumns';
import { CustomerListSearchFilters } from '../components/CustomerListSearchFilters';
import type { CustomerListSearch } from '../schemas';

const customersListRouteApi = getRouteApi('/customers/');

function useTableState(search: CustomerListSearch) {
  const sortColumnMap: Record<CustomerListSortField, 'dateOfJoining' | 'name' | 'status'> = {
    [CustomerListSortField.CREATED_AT]: 'dateOfJoining',
    [CustomerListSortField.NAME]: 'name',
    [CustomerListSortField.STATUS]: 'status',
  };

  return {
    pagination: {
      pageIndex: (search.page ?? DEFAULT_PAGE) - 1,
      pageSize: search.per_page ?? DEFAULT_PER_PAGE,
    } satisfies PaginationState,
    sorting: search.sort_by ? [{ id: sortColumnMap[search.sort_by], desc: search.sort_order === SortOrder.DESC }] : [],
  };
}

export function CustomerListPage() {
  const { t, i18n } = useTranslation();
  const search = customersListRouteApi.useSearch();
  const navigate = customersListRouteApi.useNavigate();

  const { data: response, isLoading } = useCustomerListQuery({
    ...search,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  });
  const exportMutation = useCustomerExportMutation();
  const tableState = useTableState(search);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isExportOpen, setIsExportOpen] = useState(false);

  const selectedIds = useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, selected]) => selected)
        .map(([id]) => Number(id)),
    [rowSelection],
  );

  const pageInfo = {
    pageCount: response?.data?.pagination?.total_page ?? 0,
    rowCount: response?.data?.pagination?.total_item ?? 0,
  };

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = functionalUpdate(updater, tableState.pagination);
    navigate({
      search: (prev) => ({
        ...prev,
        page: next.pageIndex + 1 || undefined,
        per_page: next.pageSize || undefined,
      }),
    });
  };

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = functionalUpdate(updater, tableState.sorting);
    const first = next[0];
    const sortFieldMap: Record<string, CustomerListSortField> = {
      dateOfJoining: CustomerListSortField.CREATED_AT,
      name: CustomerListSortField.NAME,
      status: CustomerListSortField.STATUS,
    };

    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        sort_by: first ? sortFieldMap[first.id] : undefined,
        sort_order: first ? (first.desc ? SortOrder.DESC : SortOrder.ASC) : undefined,
      }),
    });
  };

  const columns = useMemo(
    () => [
      ...getCustomerListColumns(t),
      {
        id: 'actions',
        header: t('page.customers.list.table.actions'),
        cell: ({ row }: { row: { original: CustomerMember } }) => (
          <Button variant='outline' size='sm' asChild>
            <Link to='/customers/$customerId' params={{ customerId: String(row.original.id) }}>
              {t('common.action.view')}
            </Link>
          </Button>
        ),
      },
    ],
    [t],
  );

  const buildExportBasePayload = () => ({
    locale: i18n.resolvedLanguage ?? i18n.language,
    search_term: search.search_term,
    approval_status: search.approval_status as CustomerListWireApprovalStatus | undefined,
    status: search.status as CustomerListWireStatus | undefined,
    sort_by: search.sort_by,
    sort_order: search.sort_order,
  });

  const handleExport = async (exportType: CustomerExportType) => {
    const basePayload = buildExportBasePayload();
    const payload: ExportCustomerListREQ =
      exportType === 'ALL'
        ? {
            export_type: 'ALL',
            ...basePayload,
          }
        : exportType === 'CURRENT_PAGE'
          ? {
              export_type: 'CURRENT_PAGE',
              current_page: search.page ?? DEFAULT_PAGE,
              per_page: search.per_page ?? DEFAULT_PER_PAGE,
              ...basePayload,
            }
          : {
              export_type: 'SELECTED',
              selected_ids: selectedIds,
              locale: basePayload.locale,
            };

    try {
      toast.loading(t('page.customers.list.messages.export_processing'), { id: 'customer-export' });
      const result = await exportMutation.mutateAsync(payload);
      const fileName = `${t('page.customers.list.export_dialog.file_name_prefix')}_${formatDateOnly(new Date())}.xlsx`;
      await downloadFileFromUrl(result.fileUrl, fileName);
      toast.dismiss('customer-export');
      toast.success(t('page.customers.list.messages.export_success', { file_name: fileName }));
      setIsExportOpen(false);
    } catch (error) {
      toast.dismiss('customer-export');
      toast.error(getApiErrorMessage(error, t('page.customers.list.messages.export_failed')));
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.customers.list.title')}</h1>
          {/* <p className='text-muted-foreground text-sm'>{t('page.customers.list.description')}</p> */}
        </div>

        <div className='flex gap-2'>
          <Button type='button' variant='outline' onClick={() => setIsExportOpen(true)}>
            {t('common.export.button')}
          </Button>
          <Button asChild>
            <Link to='/customers/create'>{t('page.customers.list.actions.register_customer')}</Link>
          </Button>
        </div>
      </div>

      <Separator />

      <CustomerListSearchFilters
        search={search}
        onSubmit={(filter) =>
          navigate({
            search: (prev) => ({
              ...prev,
              ...filter,
              page: undefined,
            }),
          })
        }
        onReset={() => navigate({ search: () => ({}) })}
      />

      <DataTable
        data={response?.data.members ?? []}
        columns={columns}
        state={tableState}
        pageInfo={pageInfo}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        getRowId={(row) => String(row.id)}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      <CustomerExportDialog
        isOpen={isExportOpen}
        totalCount={pageInfo.rowCount}
        currentPageCount={response?.data?.members?.length ?? 0}
        selectedCount={selectedIds.length}
        isExporting={exportMutation.isPending}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />
    </PageContainer>
  );
}
