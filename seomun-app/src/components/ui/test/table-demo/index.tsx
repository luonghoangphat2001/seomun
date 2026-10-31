'use client';

import React, { useMemo, useState } from 'react';
import { Button, Select, Input, MyDataTable, MyPagination, Tabs, DateRangePicker } from '@/components/common';
import { DateRange } from 'react-day-picker';
import { Search, Writing, Attachment, Right } from '@/icons';
import { getCoreRowModel, useReactTable, getPaginationRowModel, ColumnDef } from '@tanstack/react-table';

type InquiryData = {
  id: number;
  date: string;
  product: string;
  title: string;
  name: string;
  phone: string;
  attachment: string | null;
};

const MOCK_DATA: InquiryData[] = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  date: '2025.09.24 00:00',
  product: '일반 명함',
  title: '제목 제목 제목 제목 제목 제목 제목 제목 제목 제목 제목',
  name: '홍기돌',
  phone: '010-0000-0000',
  attachment: i % 2 === 0 ? '첨부파일 명' : null,
}));

export const InquiryTableDemo = () => {
  const [activeTab, setActiveTab] = useState('1달');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo<ColumnDef<InquiryData>[]>(
    () => [
      {
        header: '주문일',
        accessorKey: 'date',
        cell: (info) => <div>{info.getValue() as string}</div>,
        meta: { width: '150px', align: 'center' },
      },
      {
        header: '문의할 상품',
        accessorKey: 'product',
        cell: (info) => <div>{info.getValue() as string}</div>,
        meta: { width: '150px', align: 'center' },
      },
      {
        header: '제목',
        accessorKey: 'title',
        cell: (info) => <div className='truncate'>{info.getValue() as string}</div>,
      },
      {
        header: '담당자명',
        accessorKey: 'name',
        cell: (info) => <div>{info.getValue() as string}</div>,
        meta: { width: '120px', align: 'center' },
      },
      {
        header: '휴대전화',
        accessorKey: 'phone',
        cell: (info) => <div>{info.getValue() as string}</div>,
        meta: { width: '150px', align: 'center' },
      },
      {
        header: '첨부파일',
        accessorKey: 'attachment',
        cell: (info) => {
          const val = info.getValue() as string | null;
          if (!val) return null;
          return (
            <div className='text-text-brand flex items-center justify-center gap-1.5 font-semibold'>
              <Attachment className='h-4 w-4' />
              <span>{val}</span>
            </div>
          );
        },
        meta: { width: '150px', align: 'center' },
      },
      {
        id: 'actions',
        header: '',
        cell: () => (
          <div className='flex justify-center'>
            <Right className='group-hover:text-text-main h-4 w-4 text-gray-400 transition-colors' />
          </div>
        ),
        meta: { width: '60px', align: 'center' },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: MOCK_DATA,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className='flex flex-col gap-6 bg-white p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='title-32 text-text-main'>견적문의</h1>
        <Button leftIcon={<Writing className='h-5 w-5' />}>요청 만들기</Button>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='w-[140px]'>
          <Select placeholder='전체' options={[{ label: '전체', value: 'all' }]} value='all' onChange={() => {}} />
        </div>

        <Tabs
          options={[
            { label: '1부안', value: '1부안' },
            { label: '1달', value: '1달' },
            { label: '3개월', value: '3개월' },
            { label: '6개월', value: '6개월' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        <div className='w-[240px]'>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <div className='min-w-[200px] flex-1'>
          <Input placeholder='검색 입력' suffix={<Search className='h-5 w-5 text-gray-400' />} containerClassName='w-full' />
        </div>
      </div>

      {/* Table */}
      <MyDataTable table={table} columns={columns} />

      {/* Pagination */}
      <MyPagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPage={table.getPageCount()}
        onPageChange={(page: number) => table.setPageIndex(page - 1)}
        pageSize={table.getState().pagination.pageSize}
        onPageSizeChange={(size: number) => table.setPageSize(size)}
        totalRecords={MOCK_DATA.length ?? 0}
      />
    </div>
  );
};
