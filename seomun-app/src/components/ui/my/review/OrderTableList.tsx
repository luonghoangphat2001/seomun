'use client';

import { Button, MyDataTable, MyPagination } from '@/components/common';
import { formatCurrency } from '@/lib/utils';
import { ReviewUnreviewedOrderItemRESP } from '@/apis/my/review/review.response';
import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const getConfigurationText = (configuration?: ReviewUnreviewedOrderItemRESP['configuration']) => {
  if (!configuration) return '-';

  if (configuration.unit_label?.trim()) return configuration.unit_label.trim();

  const sizeLabel =
    configuration.input_options && (configuration.input_options.width || configuration.input_options.height)
      ? `${configuration.input_options.width ?? 0} x ${configuration.input_options.height ?? 0}`
      : undefined;

  const optionLabels =
    configuration.options?.map((item) => item.option?.label?.trim()).filter((label): label is string => Boolean(label)) ?? [];

  return [sizeLabel, ...optionLabels].filter(Boolean).join(' / ') || '-';
};

type OrderTableListProps = {
  data: ReviewUnreviewedOrderItemRESP[];
  currentPage: number;
  totalPage: number;
  totalRecords?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onWriteReview?: (item: ReviewUnreviewedOrderItemRESP) => void;
  onViewDetail?: (orderNumber?: string | number | null) => void;
};

const OrderTableList = ({
  data,
  currentPage,
  totalPage,
  totalRecords,
  pageSize,
  onPageChange,
  onWriteReview,
  onViewDetail,
}: OrderTableListProps) => {
  const t = useTranslations();

  const columns: ColumnDef<ReviewUnreviewedOrderItemRESP>[] = [
    {
      header: t('common.order_number'),
      accessorKey: 'order_number',
      cell: (info) => (
        <div className='body-16 break-all whitespace-normal'>
          {(info.getValue() as string) || `#${info.row.original.order_id || info.row.original.id}`}
        </div>
      ),
      meta: { width: '120px', align: 'center' },
    },
    {
      header: t('my.ordered_products'),
      accessorKey: 'title',
      cell: (info) => {
        const configuration = getConfigurationText(info.row.original.configuration);
        const orderNumber = info.row.original.order_number || info.row.original.order_id || info.row.original.id;

        return (
          <div className='text-left break-all whitespace-normal'>
            <p className='title-16 font-semibold'>{info.row.original.title}</p>
            <div className='mt-1.5 flex items-center gap-2'>
              <div className='relative size-11'>
                <Image
                  src={info.row.original.product?.images?.[0] || '/images/product-sample.png'}
                  alt='Product Thumbnail'
                  fill
                  className='object-cover'
                />
              </div>
              <div className='space-y-2'>
                <p className='title-14 font-semibold'>{info.row.original.product?.name || ''}</p>
                <p className='body-14'>{configuration}</p>
              </div>
            </div>
            <Button
              size='xs'
              variant='outline'
              className='body-14 mt-3'
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail?.(orderNumber);
              }}>
              {t('my.view_detail')}
            </Button>
          </div>
        );
      },
      meta: { width: '440px' },
    },
    {
      header: t('common.order_amount'),
      accessorKey: 'total_price',
      cell: (info) => <div>{formatCurrency(Number((info.getValue() as string) || 0))}</div>,
      meta: { width: '120px', align: 'center' },
    },
    {
      header: t('my.write_review'),
      accessorKey: 'id',
      cell: (info) => (
        <div>
          <Button
            size='sm'
            variant='outline-primary'
            className='body-14 w-full max-w-29'
            onClick={(e) => {
              e.stopPropagation();
              onWriteReview?.(info.row.original);
            }}>
            {t('my.write_review_2')}
          </Button>
        </div>
      ),
      meta: { width: '140px', align: 'center' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: data.length || 1,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <MyDataTable table={table} columns={columns} emptyText={t('my.no_registered_items')} />
      <MyPagination
        currentPage={currentPage}
        totalPage={totalPage}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={onPageChange}
        className='mt-3 hidden px-6 md:flex'
      />
    </div>
  );
};

export default OrderTableList;
