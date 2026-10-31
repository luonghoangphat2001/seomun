'use client';

import { useDeleteCartBatchMutation, useDeleteCartItemMutation } from '@/apis/cart/cart.query';
import { CartItemRESP } from '@/apis/cart/cart.response';
import { getCartItemOptionInfo } from '@/apis/cart/cart.service';
import { Button, Checkbox, ModalHandle, MyDataTable, SafeImage } from '@/components/common';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { useRouter } from '@/i18n/navigation';
import { LOCAL_STORAGE_KEYS, LocalStorage } from '@/lib/storages';
import { createProductOptionGroupNameTranslator } from '@/lib/product-option-labels';
import { formatCurrency, handleFileDownload } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { ErrorRESP } from '@/types';
import { ColumnDef, getCoreRowModel, RowSelectionState, useReactTable } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type CartItemTableProps = {
  data: CartItemRESP[];
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  totalAmount: number;
  isLoading: boolean;
};

const CartItemTable = ({ data, rowSelection, setRowSelection, totalAmount, isLoading }: CartItemTableProps) => {
  const t = useTranslations();
  const router = useRouter();
  const translateGroupName = createProductOptionGroupNameTranslator(t);
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const confirmDeleteBatchModalRef = useRef<ModalHandle>(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);
  const handleDeleteError = (error: unknown) => {
    const message = (error as AxiosError<ErrorRESP>).response?.data.message ?? t('common.error');
    toast.error(message);
  };

  //api delete single cart item
  const { mutate: mutateDeleteCartItem, isPending } = useDeleteCartItemMutation({
    onSuccess: () => {
      setRowSelection((prev) => {
        if (!selectedDeleteId) return prev;

        const next = { ...prev };
        delete next[String(selectedDeleteId)];
        return next;
      });
      setSelectedDeleteId(null);
      confirmDeleteModalRef.current?.close();
    },
    onError: handleDeleteError,
  });

  //api delete batch cart item
  const { mutate: mutateDeleteCartBatch, isPending: isPendingDeleteBatch } = useDeleteCartBatchMutation({
    onSuccess: () => {
      setSelectedDeleteIds([]);
      setRowSelection({});
      confirmDeleteBatchModalRef.current?.close();
    },
    onError: handleDeleteError,
  });

  const openConfirmDeleteModal = (id: number) => {
    setSelectedDeleteId(id);
    confirmDeleteModalRef.current?.open();
  };

  const closeConfirmDeleteModal = () => {
    if (isPending) return;

    setSelectedDeleteId(null);
    confirmDeleteModalRef.current?.close();
  };

  const openConfirmDeleteBatchModal = () => {
    const ids = selectedRows.map((row) => row.original.id);
    if (ids.length < 1) return;

    setSelectedDeleteIds(ids);
    confirmDeleteBatchModalRef.current?.open();
  };

  const closeConfirmDeleteBatchModal = () => {
    if (isPendingDeleteBatch) return;

    setSelectedDeleteIds([]);
    confirmDeleteBatchModalRef.current?.close();
  };

  const deleteCartItem = () => {
    if (!selectedDeleteId) return;

    mutateDeleteCartItem(selectedDeleteId);
  };

  const deleteCartBatch = () => {
    if (selectedDeleteIds.length < 1) return;

    mutateDeleteCartBatch({ item_ids: selectedDeleteIds });
  };

  const toPaymentPage = () => {
    const selectedCartItemIds = selectedRows.map((row) => row.original.id);
    LocalStorage.set<number[]>(LOCAL_STORAGE_KEYS.CART_SELECTED_ITEM_IDS, selectedCartItemIds);
    router.push(ROUTES.ORDER);
  };

  const columns: ColumnDef<CartItemRESP>[] = [
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
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
      meta: { width: '100px', align: 'center' },
    },
    {
      id: 'thumbnail',
      header: '',
      cell: ({ row }) => {
        const thumbnailUrl = row.original.design.front?.preview_image_path || row.original.product.first_image || '';

        return (
          <a
            href={thumbnailUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='bg-fill-soft relative block size-23 overflow-hidden'>
            <SafeImage src={thumbnailUrl} alt={row.original.product.name} fill className='object-contain' />
          </a>
        );
      },
      meta: { width: '116px', align: 'center' },
    },
    {
      id: 'title',
      header: t('my.order.title'),
      cell: ({ row }) => {
        const optionInfo = getCartItemOptionInfo(row.original, translateGroupName);
        const hasWebEditorDesign = Boolean(row.original.design.front || row.original.design.back);
        const designFileUrl = hasWebEditorDesign ? row.original.design.preview_pdf_url : row.original.design.file?.url;
        const designFileName = hasWebEditorDesign ? `칼선_${row.original.product.name}.pdf` : row.original.design.file?.name;
        const optionLabels = optionInfo?.optionLabels || [];

        return (
          <div className='text-left break-all whitespace-normal'>
            <p className='title-16 font-semibold'>
              {row.original.product.name} / {row.original.design.title}
            </p>
            {/* <p className='body-14 mt-1.5'>{`반누보 (울트라 화이트)227g / 92mm x 52mm / 양면 / 비코팅 / 코너라운딩`}</p> */}
            <p className='body-14 mt-1.5'>{optionLabels.join(' / ')}</p>
            {designFileUrl && designFileName && (
              <button
                type='button'
                className='text-text-brand body-14 mt-0.5 block underline'
                onClick={() => void handleFileDownload(designFileUrl, designFileName)}>
                {designFileName}
              </button>
            )}
          </div>
        );
      },
      meta: { align: 'center', width: '403px' },
    },
    {
      id: 'postProcessing',
      header: t('common.post_processing'),
      cell: ({ row }) => getCartItemOptionInfo(row.original, translateGroupName)?.postProcessing.split(' / ')[0] || '-',
      meta: { width: '160px', align: 'center' },
    },
    {
      header: t('product.quantity_count'),
      cell: ({ row }) => (
        <p>
          <span>{row.original.quantity}매</span> x <span>{row.original.multiplier}건</span>
        </p>
      ),
      meta: { width: '105px', align: 'center' },
    },
    {
      header: t('common.order_amount'),
      accessorKey: 'orderAmount',
      cell: ({ row }) => <>{formatCurrency(row.original.subtotal)}</>,
      meta: { width: '200px', align: 'center' },
    },

    {
      id: 'delete',
      header: '',
      cell: ({ row }) => (
        <Button size='sm' variant='outline' onClick={() => openConfirmDeleteModal(row.original.id)}>
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
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  });

  const selectedRows = table.getSelectedRowModel().rows;

  return (
    <>
      <div className='hidden grid-cols-1 md:grid'>
        <MyDataTable table={table} columns={columns} isLoading={isLoading} />
        <div className='bg-border-light border-border-soft mt-8 flex flex-wrap items-center justify-between border-y px-6 py-3 shadow-[0px_-3px_20px_0px_#12121212]'>
          <div className='flex gap-13'>
            {/* <Checkbox
              checked={table.getIsAllRowsSelected()}
              onChange={() => table.toggleAllPageRowsSelected()}
              label={`${t('common.select_all')} (${selectedRows.length})`}
              labelClassName='ml-3 body-16'
            /> */}
            {/* <Button
              size='lg'
              className='body-16 bg-red-600 hover:bg-red-700'
              disabled={selectedRows.length < 1}
              onClick={openConfirmDeleteBatchModal}>
              {t('editor.delete')}
            </Button> */}
          </div>
          <div className='flex items-center gap-3'>
            <p className='body-16'>{t('common.total_items', { count: selectedRows.length })}</p>
            <p className='title-32 text-text-brand'>{formatCurrency(totalAmount)}</p>
            <Button size='lg' className='body-16 ml-3 text-white' onClick={toPaymentPage} disabled={selectedRows.length < 1}>
              {t('common.purchase')}
            </Button>
            <Button
              size='lg'
              className='body-16 bg-red-600 hover:bg-red-700'
              disabled={selectedRows.length < 1}
              onClick={openConfirmDeleteBatchModal}>
              {'선택 삭제'}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmModal
        ref={confirmDeleteModalRef}
        onClose={closeConfirmDeleteModal}
        onConfirm={deleteCartItem}
        isLoading={isPending}
      />
      <ConfirmModal
        ref={confirmDeleteBatchModalRef}
        onClose={closeConfirmDeleteBatchModal}
        onConfirm={deleteCartBatch}
        isLoading={isPendingDeleteBatch}
        description={t('common.confirm_delete_selected', { count: selectedDeleteIds.length })}
      />
    </>
  );
};

export default CartItemTable;
