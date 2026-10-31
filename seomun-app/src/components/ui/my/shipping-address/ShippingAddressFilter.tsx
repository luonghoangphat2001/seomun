'use client';

import { useShippingAddressDeleteMutation } from '@/apis/my/shipping-address/shipping-address.query';
import { ShippingAddressListREQ } from '@/apis/my/shipping-address/shipping-address.request';
import { Button, Input, ModalHandle } from '@/components/common';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { useRouter } from '@/i18n/navigation';
import { Plus, Search, Trash } from '@/icons';
import { ROUTES } from '@/routes';
import { RowSelectionState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import toast from 'react-hot-toast';

type ShippingAddressFilterProps = {
  // filterOptions: SelectOption[];
  filter: ShippingAddressListREQ;
  handleFilterChange: (filter: ShippingAddressListREQ) => void;
  rowSelection: RowSelectionState;
  resetRowSelection: () => void;
};

const ShippingAddressFilter = ({
  // filterOptions,
  filter,
  handleFilterChange,
  rowSelection,
  resetRowSelection,
}: ShippingAddressFilterProps) => {
  const t = useTranslations();
  const router = useRouter();
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const selectedIds = Object.keys(rowSelection).map(Number);

  //api delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useShippingAddressDeleteMutation();

  const closeConfirmModal = () => {
    confirmDeleteModalRef.current?.close();
  };

  const clickDelete = () => {
    confirmDeleteModalRef.current?.open();
  };

  const confirmDelete = () => {
    if (isPendingDelete) return;
    mutateDelete(selectedIds, {
      onSuccess: () => {
        resetRowSelection();
        closeConfirmModal();
        toast.success(t('common.success_delete'));
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_delete'));
      },
    });
  };

  const navigateToCreatePage = () => {
    router.push(ROUTES.MY_PAGE.SHIPPING_ADDRESS_CREATE);
  };

  return (
    <section className='flex flex-wrap items-center justify-between gap-2'>
      <div className='hidden flex-wrap items-center gap-x-4 gap-y-2 md:flex'>
        {/* <Select
          className='w-32'
          placeholder={t('common.entire')}
          options={filterOptions}
          value={filter.search_type}
          onChange={(value) => handleFilterChange({ search_type: value as string })}
        /> */}
        <Input
          className='py-2.25'
          placeholder={t('placeholder.search_input')}
          suffix={<Search className='text-text-secondary h-5 w-5' />}
          containerClassName='w-[320px]'
          value={filter.search || ''}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
        />
      </div>
      <div className='mobile-button flex flex-wrap items-center gap-4 md:flex-nowrap'>
        <div className='flex-1'>
          <Button
            variant='outline'
            className='body-16 h-12 w-full md:h-10 md:w-auto'
            rightIcon={<Trash className='size-6' />}
            disabled={selectedIds.length === 0}
            onClick={clickDelete}>
            {t('my.delivery_address')} {t('editor.delete')}
          </Button>
        </div>

        <div className='flex-1'>
          <Button
            className='body-16 h-12 w-full md:h-10 md:w-auto'
            rightIcon={<Plus className='size-6' />}
            onClick={navigateToCreatePage}>
            {t('my.delivery_address')} {t('common.add')}
          </Button>
        </div>
      </div>

      <ConfirmModal
        ref={confirmDeleteModalRef}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        isLoading={isPendingDelete}
        description={t('common.confirm_delete_selected', { count: selectedIds.length })}
      />
    </section>
  );
};

export default ShippingAddressFilter;
