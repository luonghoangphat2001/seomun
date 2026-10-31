'use client';

import { useShippingAddressCreateMutation, useShippingAddressListQuery } from '@/apis/my/shipping-address/shipping-address.query';
import { transformShippingAddressFormValuesToCreateREQ } from '@/apis/my/shipping-address/shipping-address.service';
import { useChangeOrderHistoryAddressMutation } from '@/apis/my/order/order.query';
import { Button, Modal, ModalHandle } from '@/components/common';
import { ShippingAddressFilterOptions } from '@/enums/shipping-address';
import { useMediaQuery } from '@/hooks';
import { ChevronRightThin } from '@/icons';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { shippingAddressDefaultValues, ShippingAddressFormValues, shippingAddressSchema } from '../../schema';
import ShippingAddressAddForm from './ShippingAddressAddForm';
import { isDefaultShippingAddress } from './shipping-address-display';
import ShippingAddressTable from './ShippingAddressTable';

type ChangeShippingAddressModalProps = {
  displayAddButton?: boolean;
  orderNumber?: string;
};

export const ChangeShippingAddressModal = forwardRef<ModalHandle, ChangeShippingAddressModalProps>(
  ({ displayAddButton = true, orderNumber }, ref) => {
    const t = useTranslations();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [isAdd, setIsAdd] = useState(false);
    const [addressId, setAddressId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useShippingAddressListQuery({
      page: 1,
      per_page: 100,
      search_type: ShippingAddressFilterOptions.SHIPPING_ADDRESS,
      search: search.trim() || undefined,
    });
    const { mutate: createShippingAddress, isPending: isCreatingShippingAddress } = useShippingAddressCreateMutation();
    const { mutate: changeOrderHistoryAddress, isPending: isChangingOrderHistoryAddress } =
      useChangeOrderHistoryAddressMutation();

    const addresses = useMemo(() => data?.list ?? [], [data?.list]);
    const defaultAddressId = useMemo(() => addresses.find(isDefaultShippingAddress)?.id ?? addresses[0]?.id ?? null, [addresses]);

    const form = useForm<ShippingAddressFormValues>({
      mode: 'all',
      defaultValues: shippingAddressDefaultValues,
      resolver: zodResolver(shippingAddressSchema(t)),
    });

    const onClose = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.close();
      }
    };

    const onSaveNew = (input: ShippingAddressFormValues) => {
      if (isCreatingShippingAddress) return;

      createShippingAddress(transformShippingAddressFormValuesToCreateREQ(input), {
        onSuccess: () => {
          toast.success(t('common.success_create'));
          form.reset(shippingAddressDefaultValues);
          setSearch('');
          setIsAdd(false);
        },
        onError: (error) => {
          toast.error(error.response?.data.message ?? t('common.fail_create'));
        },
      });
    };

    const onChangeAddress = () => {
      if (!orderNumber || !addressId || isChangingOrderHistoryAddress) return;

      changeOrderHistoryAddress(
        { orderNumber, address_book_id: addressId },
        {
          onSuccess: () => {
            toast.success(t('common.success_update'));
            onClose();
          },
          onError: (error) => {
            toast.error(error.response?.data.message ?? t('common.fail_update'));
          },
        },
      );
    };

    const resetModal = () => {
      setIsAdd(false);
      setAddressId(defaultAddressId);
      setSearch('');
      form.reset(shippingAddressDefaultValues);
    };

    useEffect(() => {
      setAddressId(defaultAddressId);
    }, [defaultAddressId]);

    return (
      <Modal
        ref={ref}
        position={isDesktop ? 'center' : 'bottom'}
        onClose={resetModal}
        title={
          <div
            className={cn('flex items-center gap-2 md:px-6 md:pt-2.5 md:pb-0.5', isAdd && 'cursor-pointer hover:opacity-80')}
            onClick={() => setIsAdd(false)}>
            {isAdd && <ChevronRightThin className='size-6 rotate-180' />}
            <p className='title-18 md:title-24'>{t('common.change_delivery_address')}</p>
          </div>
        }
        titleClassName='pt-0'
        size='md'
        className='max-w-200'
        footer={
          <div className='flex justify-end gap-3 md:gap-4 md:px-6 md:pt-2'>
            <Button variant='outline' onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={isAdd ? form.handleSubmit(onSaveNew) : onChangeAddress}
              loading={isAdd ? isCreatingShippingAddress : isChangingOrderHistoryAddress}
              disabled={!isAdd && (!orderNumber || !addressId)}>
              {isAdd ? t('common.add_address') : t('common.change')}
            </Button>
          </div>
        }>
        {isAdd ? (
          <FormProvider {...form}>
            <ShippingAddressAddForm />
          </FormProvider>
        ) : (
          <ShippingAddressTable
            data={addresses}
            isLoading={isLoading}
            search={search}
            setSearch={setSearch}
            setIsAdd={setIsAdd}
            addressId={addressId}
            setAddressId={setAddressId}
            displayAddButton={displayAddButton}
          />
        )}
      </Modal>
    );
  },
);

ChangeShippingAddressModal.displayName = 'ChangeShippingAddressModal';
