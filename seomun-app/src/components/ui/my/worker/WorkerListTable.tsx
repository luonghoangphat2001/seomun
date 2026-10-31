'use client';

import { useWorkerDeleteMutation } from '@/apis/my/worker/worker.query';
import { WorkerRESP } from '@/apis/my/worker/worker.response';
import { Button, ModalHandle, MyDataTable, MyPagination } from '@/components/common';
import { Checkbox } from '@/components/common/checkbox';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { DATE_FORMAT } from '@/constants/common';
import { useRouter } from '@/i18n/navigation';
import { formatDate, splitPhonePattern } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { ColumnDef, getCoreRowModel, OnChangeFn, PaginationState, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type WorkerListTableProps = {
  data: WorkerRESP[];
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  isLoading: boolean;
  totalPage: number;
};

const WorkerListTable = ({
  data,
  rowSelection,
  setRowSelection,
  pagination,
  onPaginationChange,
  isLoading,
  totalPage,
}: WorkerListTableProps) => {
  const t = useTranslations();
  const router = useRouter();
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //api delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useWorkerDeleteMutation();

  const closeConfirmModal = () => {
    confirmDeleteModalRef.current?.close();
  };

  const clickDelete = (id: number) => {
    setDeleteId(id);
    confirmDeleteModalRef.current?.open();
  };

  const confirmDelete = () => {
    if (!deleteId || isPendingDelete) return;
    mutateDelete([deleteId], {
      onSuccess: () => {
        closeConfirmModal();
        toast.success(t('common.success_delete'));
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_delete'));
      },
    });
  };

  const columns: ColumnDef<WorkerRESP>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className='flex items-center justify-center'>
          <Checkbox
            checked={table.getIsAllRowsSelected() || table.getIsSomePageRowsSelected()}
            onChange={() => table.toggleAllPageRowsSelected()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
        </div>
      ),
      meta: { width: '100px', align: 'center' },
    },
    {
      header: t('common.registration'),
      accessorKey: 'created_at',
      cell: (info) => {
        const formatted = formatDate(info.getValue() as string, DATE_FORMAT.DATE_HOUR_MINUTE);
        return <p className='tracking-[-0.25px]'>{formatted}</p>;
      },
      meta: { align: 'center', width: '236px' },
    },
    {
      header: t('common.recent_modified_date'),
      accessorKey: 'updated_at',
      cell: (info) => {
        const formatted = formatDate(info.getValue() as string, DATE_FORMAT.DATE_HOUR_MINUTE);
        return <p className='tracking-[-0.25px]'>{formatted}</p>;
      },
      meta: { align: 'center', width: '236px' },
    },

    {
      header: t('common.worker'),
      accessorKey: 'name',
      meta: { align: 'center', width: '236px' },
    },
    {
      header: t('common.mobile_phone'),
      accessorKey: 'mobile',
      cell: ({ row }) => splitPhonePattern(row.original.mobile)?.formatted,
      meta: { align: 'center', width: '236px' },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className='space-x-1'>
          <Button size='xs' variant='outline' className='body-14' onClick={() => clickDelete(row.original.id)}>
            {t('editor.delete')}
          </Button>
          <Button
            size='xs'
            variant='outline'
            className='body-14'
            onClick={() => router.push(ROUTES.MY_PAGE.WORKER_DETAIL(row.original.id))}>
            {t('common.edit_button')}
          </Button>
        </div>
      ),
      meta: { align: 'center', width: '160px' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      pagination,
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
    onPaginationChange,
    manualPagination: true,
    pageCount: totalPage,
  });

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <div>
        <MyDataTable table={table} columns={columns} isLoading={isLoading} classNames={{ bodyRow: 'h-12' }} />
      </div>
      <MyPagination
        currentPage={pagination.pageIndex + 1}
        totalPage={totalPage}
        onPageChange={(page: number) => table.setPageIndex(page - 1)}
        pageSize={pagination.pageSize}
        // onPageSizeChange={(size: number) => table.setPageSize(size)}
        totalRecords={data.length ?? 0}
        className='mt-3 px-6'
      />
      <ConfirmModal
        ref={confirmDeleteModalRef}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        isLoading={isPendingDelete}
      />
    </div>
  );
};

export default WorkerListTable;
