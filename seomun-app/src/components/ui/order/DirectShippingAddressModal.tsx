'use client';

import { useDirectShippingListQuery } from '@/apis/customer-service/direct-shipping/direct-shipping.query';
import { Button, Input, Modal, ModalHandle, Radio } from '@/components/common';
import { MyDataTable } from '@/components/common/table/my-data-table';
import { useMediaQuery } from '@/hooks';
import { Search } from '@/icons';
import { cn, formatKoreanPhone, splitPhonePattern } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { DirectDeliveryRequest } from '@/types/inquiry';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { OrderCheckOutFormValues } from './schema';

const getFullAddress = (address: DirectDeliveryRequest) =>
  [address.postcode ? `[${address.postcode}]` : '', address.baseAddress ?? address.address, address.detailedAddress]
    .filter(Boolean)
    .join(' ');

const DirectShippingAddressModal = forwardRef<ModalHandle>((_, ref) => {
  const t = useTranslations();
  const tInquiry = useTranslations('inquiry');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { setValue } = useFormContext<OrderCheckOutFormValues>();
  const [search, setSearch] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const appliedAddressIdRef = useRef<number | null>(null);

  const { data, isLoading } = useDirectShippingListQuery({
    page: 1,
    per_page: 100,
    search: search.trim() || undefined,
    search_by: 'entire',
    status: 'confirmed',
  });

  const addresses = useMemo(() => data?.list ?? [], [data?.list]);
  const isEmpty = !isLoading && !search.trim() && addresses.length === 0;
  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const columns = useMemo<ColumnDef<DirectDeliveryRequest>[]>(
    () => [
      {
        id: 'select',
        header: '',
        cell: ({ row }) => (
          <Radio
            value={row.original.id}
            checked={selectedAddressId === row.original.id}
            onChange={() => setSelectedAddressId(row.original.id)}
          />
        ),
        meta: { width: '60px', align: 'center' },
      },
      {
        header: tInquiry('delivery_address'),
        accessorKey: 'type',
        cell: ({ row }) => row.original.type || '-',
        meta: { width: '100px', align: 'center' },
      },
      {
        header: tInquiry('name'),
        accessorKey: 'name',
        meta: { width: '90px', align: 'center' },
      },
      {
        header: tInquiry('cell_phone'),
        accessorKey: 'phone',
        cell: ({ row }) => formatKoreanPhone(row.original.phone),
        meta: { width: '136px' },
      },
      {
        header: tInquiry('address'),
        id: 'address',
        cell: ({ row }) => <div className='break-words whitespace-normal'>{getFullAddress(row.original)}</div>,
      },
    ],
    [selectedAddressId, tInquiry],
  );

  const table = useReactTable({
    data: addresses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (appliedAddressIdRef.current === null) {
      const firstAddressId = addresses[0]?.id ?? null;
      appliedAddressIdRef.current = firstAddressId;
      setSelectedAddressId(firstAddressId);
    }
  }, [addresses]);

  const closeModal = () => {
    if (ref && 'current' in ref) {
      ref.current?.close();
    }
  };

  const resetModal = () => {
    setSearch('');
    setSelectedAddressId(appliedAddressIdRef.current);
  };

  const openDirectShippingRequestCreate = () => {
    window.open(ROUTES.MY_PAGE.DIRECT_SHIPPING_REQUEST_CREATE, '_blank', 'noopener,noreferrer');
  };

  const applyShippingAddress = (address: DirectDeliveryRequest) => {
    const phone = splitPhonePattern(address.phone);

    setValue('shippingInfo.ordererName', address.name, { shouldValidate: true });
    setValue('shippingInfo.phoneHead', phone?.part1 || '', { shouldValidate: true });
    setValue('shippingInfo.phoneBody', phone?.part2 || '', { shouldValidate: true });
    setValue('shippingInfo.phoneTail', phone?.part3 || '', { shouldValidate: true });
    setValue('shippingInfo.postCode', address.postcode ?? '', { shouldValidate: true });
    setValue('shippingInfo.address', address.baseAddress ?? address.address, { shouldValidate: true });
    setValue('shippingInfo.addressDetail', address.detailedAddress ?? '', { shouldValidate: true });
    setValue('shippingInfo.message', '', { shouldValidate: true });
    setValue('shippingInfo.detailNote', address.detailRequest ?? '', { shouldValidate: true });
  };

  const handleSelect = () => {
    if (!selectedAddress) return;

    appliedAddressIdRef.current = selectedAddress.id;
    applyShippingAddress(selectedAddress);
    closeModal();
  };

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      titleClassName='pt-0'
      size='md'
      className='max-w-200'
      title={<h2 className='title-20 md:title-24'>{t('sidebar.items.delivery_request')}</h2>}
      titleContainerClassName='px-5 py-4 md:px-8 md:py-5'
      bodyClassName='bg-white'
      onClose={resetModal}
      footer={
        <div className='flex justify-end gap-3 px-1 md:px-4'>
          <Button variant='outline' onClick={closeModal}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSelect} disabled={!selectedAddress}>
            {t('common.select')}
          </Button>
        </div>
      }>
      {isEmpty ? (
        <section className='border-border-soft flex min-h-100 flex-col items-center justify-center gap-4 border-y px-5 py-5 max-md:border-none md:px-8 md:py-6'>
          <p className='body-16'>{t('order.no_registered_delivery_address')}</p>
          <Button
            className='min-w-32 bg-[#FBBF24] hover:bg-[#FBBF24] active:bg-[#FBBF24]'
            size='sm'
            onClick={openDirectShippingRequestCreate}>
            {t('inquiry.delivery_request')}
          </Button>
        </section>
      ) : (
        <section className='border-border-soft space-y-4 border-y px-5 py-5 max-md:border-none md:px-8 md:py-6'>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tInquiry('address')}
            containerClassName='max-w-95'
            suffix={<Search className='text-text-secondary size-5' />}
          />

          <div className='grid grid-cols-1'>
            <div className='scrollbar-hide hidden max-h-80 overflow-auto md:block'>
              <MyDataTable
                table={table}
                columns={columns}
                isLoading={isLoading}
                emptyText={t('common.no_data')}
                onRowClick={(address) => setSelectedAddressId(address.id)}
                classNames={{
                  header: 'bg-[#F5F5F5]',
                  bodyRow: (address) => (selectedAddressId === address.id ? 'bg-primary-50/60' : ''),
                  cell: 'whitespace-normal',
                }}
              />
            </div>

            <div className='scrollbar-hide max-h-100 space-y-3 overflow-auto md:hidden'>
              {isLoading ? (
                <div className='py-10 text-center'>{t('common.loading')}...</div>
              ) : addresses.length > 0 ? (
                addresses.map((address) => {
                  const isSelected = selectedAddressId === address.id;

                  return (
                    <button
                      key={address.id}
                      type='button'
                      className={cn(
                        'border-border-soft w-full rounded-xl border p-4 text-left',
                        isSelected && 'border-primary-200 bg-primary-50',
                      )}
                      onClick={() => setSelectedAddressId(address.id)}>
                      <Radio
                        label={address.name}
                        labelClassName='title-16'
                        value={address.id}
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <div className='border-border-soft my-4 border-t'></div>
                      <div className='body-16 space-y-2'>
                        <p>
                          {address.name} | {formatKoreanPhone(address.phone)}
                        </p>
                        <p className='break-words'>{getFullAddress(address)}</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className='body-14 text-text-secondary py-10 text-center'>{t('common.no_data')}</div>
              )}
            </div>
          </div>
        </section>
      )}
    </Modal>
  );
});

DirectShippingAddressModal.displayName = 'DirectShippingAddressModal';

export default DirectShippingAddressModal;
