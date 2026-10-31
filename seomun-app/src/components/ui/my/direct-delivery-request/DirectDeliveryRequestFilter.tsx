'use client';

import { Button, Input, Select } from '@/components/common';
import { SelectOption } from '@/components/common/select';
import { getDirectDeliveryStatusConfig, getDirectDeliveryTypeLabel } from '@/constants/inquiry';
import { DirectDeliveryStatus, DirectDeliveryType } from '@/enums/inquiry';
import { useRouter } from '@/i18n/navigation';
import { Pencil, Search } from '@/icons';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';

type DirectDeliveryRequestFilterProps = {
  selectValue: string;
  searchValue: string;
  onSelectChange: (value: string | number) => void;
  onSearchChange: (value: string) => void;
};

export const DirectDeliveryRequestFilter = ({
  selectValue,
  searchValue,
  onSelectChange,
  onSearchChange,
}: DirectDeliveryRequestFilterProps) => {
  const t = useTranslations();
  const tInquiry = useTranslations('inquiry');
  const router = useRouter();
  const statusConfig = getDirectDeliveryStatusConfig(tInquiry);
  const searchByOptions: SelectOption[] = [
    { value: 'entire', label: tInquiry('entire') },
    { value: 'shipping_name', label: tInquiry('delivery_address') },
    { value: 'recipient_name', label: tInquiry('name') },
    { value: 'phone', label: tInquiry('cell_phone') },
    { value: 'address', label: tInquiry('address') },
    { value: 'status', label: tInquiry('situation') },
  ];
  const selectOptions: SelectOption[] =
    selectValue === 'shipping_name'
      ? Object.values(DirectDeliveryType).map((type) => ({
          value: type,
          label: getDirectDeliveryTypeLabel(tInquiry, type),
        }))
      : selectValue === 'status'
        ? Object.values(DirectDeliveryStatus).map((status) => ({
            value: status,
            label: statusConfig[status].label,
          }))
        : [];
  const isSelectSearch = selectValue === 'shipping_name' || selectValue === 'status';

  return (
    <section className='flex flex-wrap items-center justify-between gap-2'>
      <div className='hidden flex-wrap items-center gap-x-4 gap-y-2 md:flex'>
        <Select
          className='w-32'
          placeholder={t('common.entire')}
          options={searchByOptions}
          value={selectValue}
          onChange={onSelectChange}
        />
        {isSelectSearch ? (
          <Select
            className='w-[320px]'
            placeholder={t('common.entire')}
            options={selectOptions}
            value={searchValue}
            onChange={(value) => onSearchChange(String(value))}
          />
        ) : (
          <Input
            className='py-2.25'
            placeholder={t('placeholder.search_input')}
            suffix={<Search className='text-text-secondary h-5 w-5' />}
            containerClassName='w-[320px]'
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}
      </div>
      <div className='mobile-button md:flex-nowrap'>
        <div className='flex-1'>
          <Button
            className='body-16 h-12 w-full md:h-10 md:w-auto'
            rightIcon={<Pencil className='size-6' />}
            onClick={() => router.push(ROUTES.MY_PAGE.DIRECT_SHIPPING_REQUEST_CREATE)}>
            {t('inquiry.contact_us')}
          </Button>
        </div>
      </div>
    </section>
  );
};
