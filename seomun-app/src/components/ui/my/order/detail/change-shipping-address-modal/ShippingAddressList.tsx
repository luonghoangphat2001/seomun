'use client';

import { ShippingAddressRESP } from '@/apis/my/shipping-address/shipping-address.response';
import { Radio } from '@/components/common';
import { cn, formatKoreanPhone } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { getShippingAddressFullAddress, getShippingAddressName, isDefaultShippingAddress } from './shipping-address-display';

type ShippingAddressListProps = {
  data: ShippingAddressRESP[];
  addressId: number | null;
  setAddressId: (value: number | null) => void;
};

const ShippingAddressList = ({ data, addressId, setAddressId }: ShippingAddressListProps) => {
  const t = useTranslations();

  return (
    <div className='scrollbar-hide max-h-100 space-y-3 overflow-auto md:hidden'>
      {data.map((address) => (
        <div
          key={address.id}
          className={cn(
            'border-border-soft rounded-xl border p-4',
            addressId === address.id && 'border-primary-200 bg-primary-50',
          )}>
          <div className='flex items-center justify-between'>
            <Radio
              label={getShippingAddressName(address)}
              labelClassName='title-16'
              value={address.id}
              checked={addressId === address.id}
              onChange={() => setAddressId(address.id)}
            />
            {isDefaultShippingAddress(address) && (
              <p className='bg-primary caption-12 w-fit rounded-full px-2 py-0.5 leading-3 text-white'>
                {t('common.default_shipping_address')}
              </p>
            )}
          </div>
          <div className='border-border-soft my-4 border-t'></div>

          <div className='body-16 space-y-2'>
            <p>
              {address.recipient} | {formatKoreanPhone(String(address.phone ?? ''))}
            </p>
            <p>{getShippingAddressFullAddress(address)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShippingAddressList;
