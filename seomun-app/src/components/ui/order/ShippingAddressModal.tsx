'use client';

import { useShippingAddressListQuery } from '@/apis/my/shipping-address/shipping-address.query';
import { ShippingAddressRESP } from '@/apis/my/shipping-address/shipping-address.response';
import { Button, Input, Modal, ModalHandle, Radio } from '@/components/common';
import { MyDataTable } from '@/components/common/table/my-data-table';
import { ShippingAddressFilterOptions } from '@/enums/shipping-address';
import { Search } from '@/icons';
import { cn, formatKoreanPhone, splitPhonePattern } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { OrderCheckOutFormValues } from './schema';
import { useMediaQuery } from '@/hooks';

const ShippingAddressModal = forwardRef<ModalHandle>((_, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { setValue } = useFormContext<OrderCheckOutFormValues>();
  const [search, setSearch] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const appliedAddressIdRef = useRef<number | null>(null);

  const { data, isLoading } = useShippingAddressListQuery({
    page: 1,
    per_page: 100,
    search_type: ShippingAddressFilterOptions.SHIPPING_ADDRESS,
    search: search.trim() || undefined,
  });

  const addresses = useMemo(() => data?.list ?? [], [data?.list]);
  const isEmpty = !isLoading && !search.trim() && addresses.length === 0;
  const defaultAddressId = useMemo(() => addresses.find((item) => item.is_default)?.id ?? addresses[0]?.id ?? null, [addresses]);
  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const columns = useMemo<ColumnDef<ShippingAddressRESP>[]>(
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
      // Same column order and labels as the shipping address management table.
      // {
      //   header: t('common.delivery_address'),
      //   cell: ({ row }) => (
      //     <div>
      //       <p>{row.original.recipient}</p>
      //       {row.original.is_default && (
      //         <span className='bg-primary mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] leading-3 text-white'>
      //           기본 배송지
      //         </span>
      //       )}
      //     </div>
      //   ),
      //   meta: { width: '100px', align: 'center' },
      // },
      {
        header: t('common.orderer'),
        accessorKey: 'recipient',
        meta: { width: '90px', align: 'center' },
      },
      {
        header: t('auth.address'),
        id: 'address',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {row.original.is_default && (
              <span className='caption-12 bg-text-brand shrink-0 rounded-lg px-2 py-0.5 text-white shadow-sm'>
                {t('common.default')}
              </span>
            )}
            <span className='break-words whitespace-normal'>
              [{row.original.postcode}]{row.original.address} {row.original.detailed_address ?? ''}
            </span>
          </div>
        ),
      },
      {
        header: t('auth.phone_number'),
        accessorKey: 'phone',
        cell: ({ row }) => formatKoreanPhone(row.original.phone),
        meta: { width: '136px' },
      },
    ],
    [selectedAddressId, t],
  );

  const table = useReactTable({
    data: addresses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (appliedAddressIdRef.current === null) {
      appliedAddressIdRef.current = defaultAddressId;
      setSelectedAddressId(defaultAddressId);
    }
  }, [defaultAddressId]);

  const closeModal = () => {
    if (ref && 'current' in ref) {
      ref.current?.close();
    }
  };

  const resetModal = () => {
    setSearch('');
    setSelectedAddressId(appliedAddressIdRef.current ?? defaultAddressId);
  };

  const openShippingAddressCreate = () => {
    window.open(ROUTES.MY_PAGE.SHIPPING_ADDRESS_CREATE, '_blank', 'noopener,noreferrer');
  };

  const applyShippingAddress = (address: ShippingAddressRESP) => {
    const phone = splitPhonePattern(address.phone);

    setValue('shippingInfo.ordererName', address.recipient, { shouldValidate: true });
    setValue('shippingInfo.phoneHead', phone?.part1 || '', { shouldValidate: true });
    setValue('shippingInfo.phoneBody', phone?.part2 || '', { shouldValidate: true });
    setValue('shippingInfo.phoneTail', phone?.part3 || '', { shouldValidate: true });
    setValue('shippingInfo.postCode', address.postcode || '', { shouldValidate: true });
    setValue('shippingInfo.address', address.address || '', { shouldValidate: true });
    setValue('shippingInfo.addressDetail', address.detailed_address || '', { shouldValidate: true });
    setValue('shippingInfo.message', address.delivery_message_preset || '', { shouldValidate: true });
    setValue('shippingInfo.detailNote', address.delivery_message_custom || '', { shouldValidate: true });
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
      size={'md'}
      className='max-w-200'
      title={<h2 className='title-20 md:title-24'>{t('order.shipping_address_list')}</h2>}
      titleContainerClassName='px-5 py-4 md:px-8 md:py-5'
      bodyClassName='bg-white'
      onClose={resetModal}
      footer={
        <div className='flex justify-end gap-3 px-1 md:px-4'>
          <Button variant='outline' onClick={closeModal}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSelect} disabled={!selectedAddress}>
            선택하기
          </Button>
        </div>
      }>
      <section className='border-border-soft space-y-4 border-y px-5 py-5 max-md:border-none md:px-8 md:py-6'>
        {isEmpty ? (
          <div className='flex min-h-100 flex-col items-center justify-center gap-4'>
            <p className='body-16'>{t('order.no_registered_delivery_address')}</p>
            <Button
              className='min-w-32 bg-[#FBBF24] hover:bg-[#FBBF24] active:bg-[#FBBF24]'
              size='sm'
              onClick={openShippingAddressCreate}>
              {t('order.register_delivery_address')}
            </Button>
          </div>
        ) : (
          <>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='주소로 검색'
              containerClassName='max-w-95'
              suffix={<Search className='text-text-secondary size-5' />}
            />

            <div className='grid grid-cols-1'>
              <div className='scrollbar-hide hidden max-h-80 overflow-auto md:block'>
                <MyDataTable
                  table={table}
                  columns={columns}
                  isLoading={isLoading}
                  emptyText='등록된 배송지가 없습니다.'
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
                    const fullAddress = `[${address.postcode}]${address.address} ${address.detailed_address ?? ''}`.trim();

                    return (
                      <button
                        key={address.id}
                        type='button'
                        className={cn(
                          'border-border-soft w-full rounded-xl border p-4 text-left',
                          isSelected && 'border-primary-200 bg-primary-50',
                        )}
                        onClick={() => setSelectedAddressId(address.id)}>
                        <div className='flex items-center justify-between gap-3'>
                          <Radio
                            label={address.recipient}
                            labelClassName='title-16'
                            value={address.id}
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(address.id)}
                          />
                          {address.is_default && (
                            <p className='bg-primary caption-12 w-fit shrink-0 rounded-full px-2 py-0.5 leading-3 text-white'>
                              기본 배송지
                            </p>
                          )}
                        </div>
                        <div className='border-border-soft my-4 border-t'></div>
                        <div className='body-16 space-y-2'>
                          <p>
                            {address.recipient} | {formatKoreanPhone(address.phone)}
                          </p>
                          <p className='break-words'>{fullAddress}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className='body-14 text-text-secondary py-10 text-center'>등록된 배송지가 없습니다.</div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </Modal>
  );
});

ShippingAddressModal.displayName = 'ShippingAddressModal';

export default ShippingAddressModal;
