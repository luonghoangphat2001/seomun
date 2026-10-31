import { useNavigate } from '@tanstack/react-router';
import type { OnChangeFn, PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Paperclip } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable, type DataTablePageInfo, type DataTableState } from '@/components/shared/data-table';
import { InquiryStatusTag, InquiryTypeTag } from '../../components/tags';
import type { InquiryDTO } from '../../types';
import { formatLocalDateTimeShort } from '@/utils/format-date';

type InquiryTableProps = {
  data: InquiryDTO[];
  isLoading: boolean;
  state: DataTableState;
  pageInfo: DataTablePageInfo;
  getDetailTo: (inquiryId: string) => string;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  onAssignManager: (item: InquiryDTO) => void;
  onChangeStatus: (item: InquiryDTO) => void;
};

export function InquiryTable({
  data,
  isLoading,
  state,
  pageInfo,
  getDetailTo,
  onPaginationChange,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
}: // onAssignManager,
// onChangeStatus,
InquiryTableProps) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<InquiryDTO>[]>(
    () => [
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: t('page.inquiries.table.registration_date'),
        cell: ({ row }) => <span className='text-sm'>{formatLocalDateTimeShort(row.original.created_at)}</span>,
      },
      {
        accessorKey: 'inquiry_number',
        header: t('page.inquiries.table.no'),
        enableSorting: false,
        cell: ({ row }) => <div className='w-25 font-medium'>{row.original.inquiry_number}</div>,
      },
      {
        id: 'inquiry_type',
        accessorKey: 'inquiry_type',
        header: t('page.inquiries.table.inquiry_type'),
        cell: ({ row }) => <InquiryTypeTag value={row.original.inquiry_type} />,
      },
      {
        accessorKey: 'title',
        header: t('page.inquiries.table.inquiry_history'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className='max-w-50'>
            <div className='truncate font-medium'>{row.original.title}</div>
            <div className='text-muted-foreground text-xs'>
              {t('page.inquiries.table.replies_count', { count: row.original.reply_count ?? 0 })}
              {/* ·{' '} */}
              {/* {t('page.inquiries.table.memos_count', { count: row.original.internal_memo_count ?? 0 })} */}
            </div>
          </div>
        ),
      },
      // {
      //   id: 'customer_name',
      //   accessorKey: 'customer_name',
      //   header: t('page.inquiries.table.customer_name'),
      // },
      {
        id: 'inquirer_name',
        accessorKey: 'inquirer_name',
        header: t('page.inquiries.table.inquirer_name'),
        enableSorting: false,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('page.inquiries.table.status'),
        cell: ({ row }) => <InquiryStatusTag value={row.original.status} />,
      },
      // {
      //   id: 'assigned_to',
      //   accessorFn: (row) => row.assigned_to?.name ?? '',
      //   header: t('page.inquiries.table.person_in_charge'),
      //   cell: ({ row }) => <span>{row.original.assigned_to?.name ?? '-'}</span>,
      // },
      {
        accessorKey: 'has_attachment',
        header: t('page.inquiries.table.attachments'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.has_attachment ? (
            <span className='text-muted-foreground inline-flex items-center gap-1 text-xs font-medium'>
              <Paperclip className='size-3.5' />
              {row.original.attachment_count}
            </span>
          ) : (
            <span className='text-muted-foreground text-xs'>-</span>
          ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      state={state}
      pageInfo={pageInfo}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      isLoading={isLoading}
      getRowId={(row) => String(row.id)}
      onRowClick={(row) => void navigate({ to: getDetailTo(String(row.id)) })}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
    />
  );
}
