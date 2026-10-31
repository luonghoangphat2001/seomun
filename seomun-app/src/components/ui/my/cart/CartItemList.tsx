'use client';

import { useDeleteCartItemMutation } from '@/apis/cart/cart.query';
import { CartItemRESP } from '@/apis/cart/cart.response';
import { getCartItemOptionInfo } from '@/apis/cart/cart.service';
import { Button, Checkbox, ModalHandle, SafeImage } from '@/components/common';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { useRouter } from '@/i18n/navigation';
import { Wallet2 } from '@/icons';
import { createProductOptionGroupNameTranslator } from '@/lib/product-option-labels';
import { formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { ErrorRESP } from '@/types';
import { RowSelectionState } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type CartItemListProps = {
  data: CartItemRESP[];
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  totalAmount: number;
  isAllSelected: boolean;
  handleSelectAll: (value: boolean) => void;
};

const CartItemList = ({
  data,
  rowSelection,
  setRowSelection,
  totalAmount,
  isAllSelected,
  handleSelectAll,
}: CartItemListProps) => {
  const t = useTranslations();
  const router = useRouter();
  const translateGroupName = createProductOptionGroupNameTranslator(t);
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const handleDeleteError = (error: unknown) => {
    const message = (error as AxiosError<ErrorRESP>).response?.data.message ?? t('common.error');
    toast.error(message);
  };

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

  const toPaymentPage = () => {
    router.push(ROUTES.ORDER);
  };

  const openConfirmDeleteModal = (id: number) => {
    setSelectedDeleteId(id);
    confirmDeleteModalRef.current?.open();
  };

  const closeConfirmDeleteModal = () => {
    if (isPending) return;

    setSelectedDeleteId(null);
    confirmDeleteModalRef.current?.close();
  };

  const deleteCartItem = () => {
    if (!selectedDeleteId) return;

    mutateDeleteCartItem(selectedDeleteId);
  };

  return (
    <>
      <section className='block md:hidden'>
        {data.map((item, index) => {
          const id = String(item.id);
          const checked = !!rowSelection[id];
          const optionInfo = getCartItemOptionInfo(item, translateGroupName);
          const optionLabels = optionInfo?.optionLabels || [];
          const thumbnailUrl =
            item.design.front?.preview_image_path || item.line_display.thumbnail_url || item.product.first_image || '';

          return (
            <React.Fragment key={item.id}>
              <div className='py-4'>
                <div className='flex items-center justify-between'>
                  <Checkbox
                    label={item.product.name}
                    labelClassName='title-14'
                    checked={checked}
                    onChange={(value) => {
                      setRowSelection((prev) => ({
                        ...prev,
                        [id]: value,
                      }));
                    }}
                  />
                  <Button size='xs' variant='outline' onClick={() => openConfirmDeleteModal(item.id)}>
                    {t('editor.delete')}
                  </Button>
                </div>

                <div className='mt-3 flex gap-3'>
                  <a
                    href={thumbnailUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-fill-soft relative block size-18 shrink-0 overflow-hidden'>
                    <SafeImage src={thumbnailUrl} alt={item.product.name} fill className='object-contain' />
                  </a>
                  <div className='caption-12 space-y-1'>
                    <p>{optionLabels.join(' / ')}</p>
                    <p>
                      {t('common.post_processing')}: <span className='font-bold'>{optionInfo?.postProcessing || '-'}</span>
                    </p>
                    <p>
                      {t('product.quantity_count')}:{' '}
                      <span className='font-bold'>
                        {item.line_display.quantity_label || `${item.quantity} x ${item.multiplier}`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className='mt-2 flex justify-end'>
                  <p className='body-16'>{formatCurrency(item.subtotal)}</p>
                </div>
              </div>
              {index !== data.length - 1 && <div className='mobile-seperator'></div>}
            </React.Fragment>
          );
        })}
      </section>

      <div className='border-border-soft fixed bottom-0 left-0 w-full border-t bg-white p-4 pb-6 shadow-[0px_-4px_20px_0px_#0000001A,-2px_-31px_30px_0px_#00000005] md:hidden'>
        <div className='flex items-center justify-between'>
          <Checkbox
            label={`${t('common.entire')} (${data.length})`}
            labelClassName='body-16'
            checked={isAllSelected}
            onChange={(checked) => handleSelectAll(checked)}
          />
          <p className='title-24 text-text-brand'>{formatCurrency(totalAmount)}</p>
        </div>
        <Button size='lg' className='body-16 mt-3 w-full' onClick={toPaymentPage} disabled={selectedCount < 1}>
          <div className='flex items-center gap-2'>
            <Wallet2 className='size-6' />
            <p>{t('product.buy_now')}</p>
          </div>
        </Button>
      </div>

      <ConfirmModal
        ref={confirmDeleteModalRef}
        onClose={closeConfirmDeleteModal}
        onConfirm={deleteCartItem}
        isLoading={isPending}
      />
    </>
  );
};

export default CartItemList;
