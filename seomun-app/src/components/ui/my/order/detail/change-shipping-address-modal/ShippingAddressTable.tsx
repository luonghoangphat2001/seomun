'use client';

import { ShippingAddressRESP } from '@/apis/my/shipping-address/shipping-address.response';
import { Button, Input, MyDataTable, Radio } from '@/components/common';
import { Plus, Search } from '@/icons';
import { cn, formatKoreanPhone } from '@/lib/utils';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import ShippingAddressList from './ShippingAddressList';
import { getShippingAddressFullAddress, getShippingAddressName, isDefaultShippingAddress } from './shipping-address-display';

type ShippingAddressTableProps = {
  data: ShippingAddressRESP[];
  isLoading: boolean;
  search: string;
  setSearch: (value: string) => void;
  setIsAdd: (value: boolean) => void;
  addressId: number | null;
  setAddressId: (value: number | null) => void;
  displayAddButton?: boolean;
};

const ShippingAddressTable = ({
  data,
  isLoading,
  search,
  setSearch,
  setIsAdd,
  addressId,
  setAddressId,
  displayAddButton,
}: ShippingAddressTableProps) => {
  const t = useTranslations();

  const columns: ColumnDef<ShippingAddressRESP>[] = [
    {
      id: 'select',
      header: '',
      cell: ({ row }) => (
        <div>
          <Radio value={row.original.id} checked={addressId === row.original.id} onChange={() => setAddressId(row.original.id)} />
        </div>
      ),
      meta: { width: '76px', align: 'center' },
    },
    {
      id: 'shippingName',
      header: t('common.delivery_address'),
      accessorFn: getShippingAddressName,
      cell: ({ row }) => (
        <div>
          <p>{getShippingAddressName(row.original)}</p>
          {isDefaultShippingAddress(row.original) && (
            <p className='bg-primary mt-1 w-fit rounded-full px-1.5 py-0.5 text-[8px] leading-3 text-white'>
              {t('common.default_shipping_address')}
            </p>
          )}
        </div>
      ),
      meta: { width: '113px' },
    },
    {
      header: t('common.recipient'),
      accessorKey: 'recipient',
      meta: { width: '76px' },
    },
    {
      header: t('common.address'),
      accessorKey: 'address',
      cell: ({ row }) => (
        <div style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}>{getShippingAddressFullAddress(row.original)}</div>
      ),
      meta: { width: '351px' },
    },
    {
      header: t('common.cell_phone'),
      accessorKey: 'phone',
      cell: ({ row }) => formatKoreanPhone(String(row.original.phone ?? '')),
      meta: { width: '136px' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn('border-border-soft space-y-4 border-y px-4 py-6 max-md:border-none md:p-6')}>
      <div className='flex flex-wrap justify-between gap-y-2'>
        <Input
          containerClassName='w-[440px]'
          placeholder={t('header.enter_name')}
          suffix={<Search className='text-text-secondary h-5 w-5' />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {displayAddButton && (
          <Button type='button' variant='outline-primary' onClick={() => setIsAdd(true)}>
            <div className='flex items-center gap-2'>
              <p>{t('common.add_new_address')}</p>
              <Plus />
            </div>
          </Button>
        )}
      </div>
      <div className='grid grid-cols-1'>
        <div className='scrollbar-hide hidden max-h-85 overflow-auto md:block'>
          <MyDataTable table={table} columns={columns} isLoading={isLoading} classNames={{ header: 'bg-[#F5F5F5]' }} />
        </div>
        <ShippingAddressList data={data} addressId={addressId} setAddressId={setAddressId} />
      </div>
    </div>
  );
};

export default ShippingAddressTable;
