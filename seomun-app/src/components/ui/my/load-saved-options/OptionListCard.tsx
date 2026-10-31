'use client';

import { Button, Checkbox, ModalHandle } from '@/components/common';
import { RowSelectionState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { OptionDetailModal } from './OptionDetailModal';
import { SavedOptionListREQ } from '@/apis/my/saved-options/saved-options.request';
import { useSavedOptionDeleteMutation, useSavedOptionMobileListQuery } from '@/apis/my/saved-options/saved-options.query';
import Loading from '@/components/common/loading';
import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import { formatDate } from '@/lib/utils';
import { DATE_FORMAT } from '@/constants/common';
import toast from 'react-hot-toast';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import { useProductStore } from '../../product/store/useProductStore';

type OptionListCardProps = {
  filter?: SavedOptionListREQ;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
};

const OptionListCard = ({ filter, rowSelection, setRowSelection }: OptionListCardProps) => {
  const t = useTranslations();
  const router = useRouter();
  const setPendingSavedOption = useProductStore((state) => state.setPendingSavedOption);
  const detailModalRef = useRef<ModalHandle>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [option, setOption] = useState<SavedOptionRESP | null>(null);
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //api inifiniy list
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSavedOptionMobileListQuery(filter);
  const savedOptions = data?.pages.flatMap((page) => page.data.saved_options) ?? [];

  //api delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useSavedOptionDeleteMutation();

  const openDetailModal = (detail: SavedOptionRESP) => {
    setOption(detail);
    detailModalRef.current?.open();
  };

  const closeModal = () => {
    setOption(null);
    detailModalRef.current?.close();
  };

  const onCheckItem = (addressId: number, value: boolean) => {
    setRowSelection((prev) => {
      // unchecked => remove key
      if (!value) {
        const next = { ...prev };
        delete next[addressId];
        return next;
      }

      // checked
      return {
        ...prev,
        [addressId]: true,
      };
    });
  };

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

  const orderWithSavedOption = (item: SavedOptionRESP) => {
    setPendingSavedOption(item);
    router.push(`${ROUTES.PRODUCT.DETAIL(item.product_slug)}?savedOptionId=${item.id}`);
  };

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchNextPage();
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className='md:hidden'>
        <Loading />
      </div>
    );
  }

  return (
    <section className='block space-y-4 md:hidden'>
      {savedOptions.map((option) => {
        return (
          <div
            key={option.id}
            className='border-border-soft space-y-4 rounded-xl border p-4'
            onClick={() => openDetailModal(option)}>
            <div className='flex items-center justify-between'>
              <p className='body-14'>{formatDate(option.saved_at, DATE_FORMAT.DATE_WITH_DOT)}</p>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                <Checkbox
                  checked={!!rowSelection[option.id]}
                  onChange={(value) => {
                    onCheckItem(option.id, value);
                  }}
                />
              </div>
            </div>
            <div className='space-y-1'>
              <p className='title-14'>
                [{option.product_name}]<span className='text-text-brand ml-1.5'>{option.order_name}</span>
              </p>
              {option.notes && (
                <p className='caption-12 text-text-secondary wrap-break-word'>
                  {t('product.memo')}: {option.notes}
                </p>
              )}
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <Button
                size='sm'
                variant='outline'
                onClick={(e) => {
                  e.stopPropagation();
                  clickDelete(option.id);
                }}>
                {t('editor.delete')}
              </Button>
              <Button
                size='sm'
                variant='outline-primary'
                onClick={(e) => {
                  e.stopPropagation();
                  orderWithSavedOption(option);
                }}>
                {t('my.order_button')}
              </Button>
            </div>
          </div>
        );
      })}

      {hasNextPage && <div ref={loadMoreRef}>{isFetchingNextPage && <Loading />}</div>}

      <OptionDetailModal ref={detailModalRef} onClose={closeModal} detail={option} />

      <ConfirmModal
        ref={confirmDeleteModalRef}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        isLoading={isPendingDelete}
      />
    </section>
  );
};

export default OptionListCard;
