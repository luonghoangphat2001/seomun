'use client';

import {
  useShippingAddressDeleteMutation,
  useShippingAddressMobileListQuery,
} from '@/apis/my/shipping-address/shipping-address.query';
import { ShippingAddressListREQ } from '@/apis/my/shipping-address/shipping-address.request';
import { Button, Checkbox, ModalHandle } from '@/components/common';
import Loading from '@/components/common/loading';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { useRouter } from '@/i18n/navigation';
import { splitPhonePattern } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { RowSelectionState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type ShippingAddressListCardProps = {
  filter?: ShippingAddressListREQ;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
};

const ShippingAddressListCard = ({ rowSelection, setRowSelection, filter }: ShippingAddressListCardProps) => {
  const t = useTranslations();
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //api inifiniy list
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useShippingAddressMobileListQuery(filter);
  const addresses = data?.pages.flatMap((page) => page.data.addresses) ?? [];

  //api delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useShippingAddressDeleteMutation();

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
    <section className='-mt-4 space-y-4 md:mt-0 md:hidden'>
      {addresses.map((address) => (
        <div key={address.id} className='border-border-soft space-y-4 rounded-xl border p-4'>
          <div className='flex items-center justify-between gap-3'>
            <Checkbox
              // label={'남산사업자명'}
              label={`${address.is_default ? `(${t('common.default_shipping_address')}) ` : ''}${address.address}`}
              labelClassName='title-16 ml-1'
              checked={!!rowSelection[address.id]}
              onChange={(value) => {
                onCheckItem(address.id, value);
              }}
            />
            {/* <p
              className={cn(
                'caption-12 w-fit rounded-lg px-2 py-0.5',
                address.is_default ? 'bg-text-brand text-white shadow-sm' : 'bg-[#F5F5F5] text-[#171717]',
              )}>
              {address.is_default ? t('common.default_shipping_address') : t('common.default')}
            </p> */}
          </div>
          <div className='bg-border-soft h-px'></div>
          <div className='space-y-2'>
            <p>
              {address.recipient} | {splitPhonePattern(address.phone)?.formatted || ''}
            </p>
            <p>{`[${address.postcode}] ${address.address} ${address.detailed_address || ''}`}</p>
          </div>
          <div className='flex gap-2'>
            <Button size='sm' variant='outline' className='body-14 flex-1' onClick={() => clickDelete(address.id)}>
              {t('editor.delete')}
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='body-14 flex-1'
              onClick={() => router.push(ROUTES.MY_PAGE.SHIPPING_ADDRESS_DETAIL(address.id))}>
              {t('common.edit_button')}
            </Button>
          </div>
        </div>
      ))}

      {hasNextPage && <div ref={loadMoreRef}>{isFetchingNextPage && <Loading />}</div>}

      <ConfirmModal
        ref={confirmDeleteModalRef}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        isLoading={isPendingDelete}
      />
    </section>
  );
};

export default ShippingAddressListCard;
