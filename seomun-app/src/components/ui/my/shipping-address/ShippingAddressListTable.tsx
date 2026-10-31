'use client';

import { useShippingAddressDeleteMutation } from '@/apis/my/shipping-address/shipping-address.query';
import { ShippingAddressRESP } from '@/apis/my/shipping-address/shipping-address.response';
import { Button, Checkbox, ModalHandle, MyDataTable, MyPagination } from '@/components/common';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { useRouter } from '@/i18n/navigation';
import { splitPhonePattern } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { ColumnDef, getCoreRowModel, OnChangeFn, PaginationState, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type ShippingAddressListTableProps = {
  data: ShippingAddressRESP[];
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  isLoading: boolean;
  totalPage: number;
  totalRecords: number;
};

const ShippingAddressListTable = ({
  data,
  rowSelection,
  setRowSelection,
  pagination,
  onPaginationChange,
  isLoading,
  totalPage,
  totalRecords,
}: ShippingAddressListTableProps) => {
  const t = useTranslations();
  const router = useRouter();
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //api delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useShippingAddressDeleteMutation();

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

  const columns: ColumnDef<ShippingAddressRESP>[] = [
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
      meta: { width: '76px', align: 'center' },
    },
    // {
    //   header: t('common.delivery_address'),
    //   accessorKey: 'isDefault',
    //   cell: ({ row }) => (
    //     <p
    //       className={cn(
    //         'caption-12 w-fit max-w-25 truncate rounded-lg px-2 py-0.5',
    //         row.original.is_default ? 'bg-text-brand text-white shadow-sm' : 'bg-[#F5F5F5] text-[#171717]',
    //       )}>
    //       {row.original.is_default ? t('common.default_shipping_address') : t('common.default')}
    //     </p>
    //   ),
    //   meta: { width: '100px' },
    // },
    {
      header: t('common.orderer'),
      accessorKey: 'recipient',
      meta: { width: '100px' },
    },

    {
      header: t('auth.address'),
      accessorKey: 'full_address',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          {row.original.is_default && (
            <span className='caption-12 bg-text-brand shrink-0 rounded-lg px-2 py-0.5 text-white shadow-sm'>
              {t('common.default')}
            </span>
          )}
          <span>{`[${row.original.postcode}] ${row.original.address} ${row.original.detailed_address || ''}`}</span>
        </div>
      ),
      meta: { width: '600px' },
    },
    {
      header: t('auth.phone_number'),
      accessorKey: 'phone',
      cell: ({ row }) => splitPhonePattern(row.original.phone)?.formatted,
      meta: { width: '150px' },
    },
    {
      id: 'actions',
      header: t('common.edit_delete'),
      cell: ({ row }) => (
        <div className='space-x-1'>
          <Button size='xs' variant='outline' className='body-14' onClick={() => clickDelete(row.original.id)}>
            {t('editor.delete')}
          </Button>
          <Button
            size='xs'
            variant='outline'
            className='body-14'
            onClick={() => router.push(ROUTES.MY_PAGE.SHIPPING_ADDRESS_DETAIL(row.original.id))}>
            {t('common.edit_button')}
          </Button>
        </div>
      ),
      meta: { width: '128px' },
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
      <MyDataTable table={table} columns={columns} isLoading={isLoading} />
      <MyPagination
        currentPage={pagination.pageIndex + 1}
        totalPage={totalPage}
        onPageChange={(page: number) => table.setPageIndex(page - 1)}
        pageSize={pagination.pageSize}
        // onPageSizeChange={(size: number) => table.setPageSize(size)}
        totalRecords={totalRecords}
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

export default ShippingAddressListTable;
