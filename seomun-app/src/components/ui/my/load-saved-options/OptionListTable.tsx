'use client';

import { useSavedOptionDeleteMutation } from '@/apis/my/saved-options/saved-options.query';
import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import {
  createProductOptionGroupNameTranslator,
  findProductOptionByCode,
  getBookOptionDisplayItems,
  getProductOptionItems,
  isBookOptionConfiguration,
} from '@/lib/product-option-labels';
import { Button, Checkbox, ModalHandle, MyDataTable, MyPagination } from '@/components/common';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { DATE_FORMAT } from '@/constants/common';
import { PostProcessingCode, ProductCommonOption } from '@/enums/product';
import { Careright, ChevDown } from '@/icons';
import { useRouter } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { ColumnDef, getCoreRowModel, OnChangeFn, PaginationState, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../product/store/useProductStore';

type OptionListTableProps = {
  data: SavedOptionRESP[];
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  isLoading: boolean;
  totalPage: number;
  totalRecord: number;
};

const OptionListTable = ({
  data,
  rowSelection,
  setRowSelection,
  pagination,
  onPaginationChange,
  isLoading,
  totalPage,
  totalRecord,
}: OptionListTableProps) => {
  const t = useTranslations();
  const translateGroupName = createProductOptionGroupNameTranslator(t);
  const router = useRouter();
  const setPendingSavedOption = useProductStore((state) => state.setPendingSavedOption);
  const [expandedRowIds, setExpandedRowIds] = useState<Record<number, boolean>>({});
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //api delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useSavedOptionDeleteMutation();

  const closeConfirmModal = () => {
    confirmDeleteModalRef.current?.close();
  };

  const clickDelete = (id: number) => {
    setDeleteId(id);
    confirmDeleteModalRef.current?.open();
  };

  const confirmDelete = () => {
    if (!deleteId || isPendingDelete) return;
    mutateDelete(deleteId, {
      onSuccess: () => {
        closeConfirmModal();
        toast.success(t('common.success_delete'));
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_delete'));
      },
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const orderWithSavedOption = (item: SavedOptionRESP) => {
    setPendingSavedOption(item);
    router.push(`${ROUTES.PRODUCT.DETAIL(item.product_slug)}?savedOptionId=${item.id}`);
  };

  const optionInfo = (option: SavedOptionRESP) => {
    const selectedProductOptions = getProductOptionItems(option.options);
    const postProcessingCodes = Object.values(PostProcessingCode);
    const isBookProduct = isBookOptionConfiguration(selectedProductOptions);
    const size = findProductOptionByCode(selectedProductOptions, ProductCommonOption.SIZE);
    const subjectMatter = findProductOptionByCode(selectedProductOptions, ProductCommonOption.SUBJECT_MATTER);
    const paper = findProductOptionByCode(selectedProductOptions, ProductCommonOption.PAPER);
    const printedSide = findProductOptionByCode(selectedProductOptions, ProductCommonOption.PRINTED_SIDE);
    const printedFSide = findProductOptionByCode(selectedProductOptions, ProductCommonOption.PRINTED_COLOR_FSIDE);
    const printedBSide = findProductOptionByCode(selectedProductOptions, ProductCommonOption.PRINTED_COLOR_BSIDE);
    const postProcessing = selectedProductOptions
      .filter((item) => postProcessingCodes.includes(item?.group?.code as PostProcessingCode) && item?.option?.label)
      .map((item) => `${translateGroupName(item?.group?.code, item?.group?.name)} ${item?.option?.label}`);

    if (isBookProduct) {
      return [
        { label: t('product.standard'), value: <p>{size?.option?.label}</p> },
        ...getBookOptionDisplayItems(selectedProductOptions).map((item) => ({
          label: translateGroupName(item?.group?.code, item?.group?.name),
          value: <p>{item?.option?.label}</p>,
        })),
        {
          label: t('product.quantity_count'),
          value: (
            <p>{`${t('product.quantity', { quantity: option.quantity })} ${t('product.count', { count: option.number_of_cases })}`}</p>
          ),
        },
        {
          label: t('product.post_processing'),
          value: postProcessing.length > 0 ? postProcessing.map((item, index) => <p key={index}>{item || '-'}</p>) : '-',
        },
      ];
    }

    return [
      { label: t('product.standard'), value: <p>{size?.option?.label}</p> },
      ...(subjectMatter?.option?.label
        ? [{ label: t('product.subject_matter'), value: <p>{subjectMatter.option.label}</p> }]
        : []),
      { label: t('product.paper'), value: <p>{paper?.option?.label}</p> },
      {
        label: t('product.printed_color'),
        value: (
          <p>
            {printedSide?.option?.label} {printedFSide?.option?.label} {printedBSide?.option?.label}
          </p>
        ),
      },
      {
        label: t('product.quantity_count'),
        value: (
          <p>{`${t('product.quantity', { quantity: option.quantity })} ${t('product.count', { count: option.number_of_cases })}`}</p>
        ),
      },
      {
        label: t('product.post_processing'),
        value: postProcessing.length > 0 ? postProcessing.map((item, index) => <p key={index}>{item || '-'}</p>) : '-',
      },
    ];
  };

  const columns: ColumnDef<SavedOptionRESP>[] = [
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
      id: 'productInfo',
      header: t('my.saved_option_product_info'),
      cell: ({ row }) => {
        return (
          <div className='space-y-1.5 truncate'>
            <p className='title-16'>
              [{row.original.product_name}]<span className='text-text-brand ml-1.5'>{row.original.order_name}</span>
            </p>
            {row.original.notes && (
              <p className='body-14 text-text-secondary cursor-pointer truncate' title={row.original.notes}>
                {t('product.memo')}: {row.original.notes}
              </p>
            )}
          </div>
        );
      },
      meta: { width: '500px' },
    },
    {
      header: t('my.saved_date'),
      accessorKey: 'saved_at',
      cell: ({ row }) => <p>{formatDate(row.original.saved_at, DATE_FORMAT.DATE_WITH_DOT)}</p>,
      meta: { align: 'center', width: '160px' },
    },
    {
      id: 'viewOptions',
      header: t('my.view_options'),
      cell: ({ row }) => {
        const expanded = expandedRowIds[row.original.id];
        return (
          <Button size='sm' variant='ghost' onClick={() => toggleExpand(row.original.id)}>
            {expanded ? <ChevDown className='size-6 rotate-180' /> : <ChevDown className='size-6' />}
          </Button>
        );
      },
      meta: { width: '160px', align: 'center' },
    },
    {
      header: t('my.option_order'),
      cell: ({ row }) => (
        <Button size='sm' variant='outline-primary' onClick={() => orderWithSavedOption(row.original)}>
          {t('my.order_button')}
        </Button>
      ),
      meta: { width: '120px', align: 'center' },
    },
    {
      id: 'delete',
      header: '',
      cell: ({ row }) => (
        <Button size='sm' variant='outline' onClick={() => clickDelete(row.original.id)}>
          {t('editor.delete')}
        </Button>
      ),
      meta: { width: '120px', align: 'center' },
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
      <MyDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        expandedRowIds={expandedRowIds}
        renderExpandedRow={(row) => (
          <div className='ml-25 flex flex-wrap gap-x-16 gap-y-4 px-3 py-4'>
            {/* label | value | label | value — items share the parent tracks via subgrid so values align per column */}
            <div className='grid grid-cols-[max-content_minmax(0,1fr)_max-content_minmax(0,1fr)] gap-x-4 gap-y-4'>
              {optionInfo(row).map((item) => (
                <div key={item.label} className='col-span-2 grid grid-cols-subgrid items-start'>
                  <div className='flex items-center gap-2'>
                    <Careright className='text-border-soft size-4 shrink-0' />
                    <p className='title-14 text-text-secondary whitespace-nowrap'>{item.label}</p>
                  </div>
                  <div className='body-14 min-w-0 pr-12 wrap-break-word'>{item.value}</div>
                </div>
              ))}
            </div>
            {row.notes && (
              <div className='bg-border-light w-full space-y-1 rounded-[10px] p-4'>
                <p className='title-14 text-text-secondary'>{t('product.memo')}</p>
                <p className='body-14 wrap-break-word whitespace-pre-line'>{row.notes}</p>
              </div>
            )}
          </div>
        )}
      />
      <MyPagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPage={table.getPageCount()}
        onPageChange={(page: number) => table.setPageIndex(page - 1)}
        pageSize={table.getState().pagination.pageSize}
        onPageSizeChange={(size: number) => table.setPageSize(size)}
        totalRecords={totalRecord}
        className='mt-3 hidden px-6 md:flex'
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

export default OptionListTable;
