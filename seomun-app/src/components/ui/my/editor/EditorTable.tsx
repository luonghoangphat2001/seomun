'use client';

import { MyDataTable, MyPagination } from '@/components/common';
import { MyEditorType } from '@/types';
import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Attachment } from '@/icons';
import { MY_EDITOR_MOCK } from '../mock/editor';

const EditorTable = () => {
  const t = useTranslations();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<MyEditorType>[] = [
    {
      header: t('common.last_modified_date'),
      accessorKey: 'lastModifiedDate',
      cell: (value) => <p className='body-16'>{value.getValue() as string}</p>,
      meta: { width: '148px' },
    },
    {
      header: t('common.order_number'),
      accessorKey: 'orderNumber',
      cell: (value) => <p className='body-16 text-text-brand cursor-pointer underline'>{value.getValue() as string}</p>,
      meta: { width: '180px', align: 'center' },
    },
    {
      header: t('common.title'),
      accessorKey: 'title',
      meta: { align: 'center', width: '180px' },
    },
    {
      header: t('common.worker'),
      accessorKey: 'worker',
      meta: { width: '180px', align: 'center' },
    },
    {
      header: t('common.file_name'),
      accessorKey: 'fileName',
      cell: (value) => (
        <div className='text-text-brand flex items-center justify-center gap-1.5'>
          <Attachment width={20} height={20} />
          <p className='title-16 underline'>{value.getValue() as string}</p>
        </div>
      ),
      meta: { width: '180px', align: 'center' },
    },
  ];

  const table = useReactTable({
    data: MY_EDITOR_MOCK,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className='grid grid-cols-1'>
      <div>
        <MyDataTable table={table} columns={columns} />
      </div>

      {/* Pagination */}
      <MyPagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPage={table.getPageCount()}
        onPageChange={(page: number) => table.setPageIndex(page - 1)}
        pageSize={table.getState().pagination.pageSize}
        onPageSizeChange={(size: number) => table.setPageSize(size)}
        totalRecords={MY_EDITOR_MOCK.length ?? 0}
        className='mt-3 hidden px-6 md:flex'
      />
    </div>
  );
};

export default EditorTable;
