'use client';

import { OrderHistoryListREQ } from '@/apis/my/order/order.request';
import { getDateRangeByOrderPeriod, getOrderFilterLabel, getOrderHistoryDateParams } from '@/apis/my/order/order.service';
import { Button, DateRangePicker, Input, Modal, ModalHandle, Select, Tabs } from '@/components/common';
import { PeriodFilter } from '@/enums/common';
import { OrderActionFilter } from '@/enums/order';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import { Funnel, Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';

type OrderHistoryFilter = OrderHistoryListREQ & {
  dateRange?: DateRange;
};

type OrderFilterModalProps = {
  actionTab?: string;
  periodTab?: string;
  filter?: OrderHistoryFilter;
  onApply?: (actionTab: string, periodTab: string, filter: OrderHistoryFilter) => void;
};

const OrderFilterModal = ({ actionTab, periodTab, filter, onApply }: OrderFilterModalProps) => {
  const t = useTranslations();
  const modalBottomRef = useRef<ModalHandle>(null);
  const currentActionTab = actionTab ?? OrderActionFilter.ALL;
  const currentPeriodTab = periodTab ?? PeriodFilter.SIX_MONTHS;
  const currentFilter = filter ?? {};
  const [draftActionTab, setDraftActionTab] = useState(currentActionTab);
  const [draftPeriodTab, setDraftPeriodTab] = useState(currentPeriodTab);
  const [draftFilter, setDraftFilter] = useState<OrderHistoryFilter>(currentFilter);

  const { orderActionFilterOptions, periodFilterOptions } = useEnumOptions(
    { orderActionFilterOptions: OrderActionFilter, periodFilterOptions: PeriodFilter },
    'filter',
  );

  const openModal = () => {
    setDraftActionTab(currentActionTab);
    setDraftPeriodTab(currentPeriodTab);
    setDraftFilter(currentFilter);
    modalBottomRef.current?.open();
  };

  const closeModal = () => {
    modalBottomRef.current?.close();
  };

  const handleActionTabChange = (value: string) => {
    setDraftActionTab(value);
    setDraftFilter((prev) => ({ ...prev, filter_label: getOrderFilterLabel(value) }));
  };

  const handlePeriodTabChange = (value: string) => {
    setDraftPeriodTab(value);
    setDraftFilter((prev) => ({ ...prev, ...getOrderHistoryDateParams(getDateRangeByOrderPeriod(value)) }));
  };

  const handleApply = () => {
    onApply?.(draftActionTab, draftPeriodTab, draftFilter);
    closeModal();
  };

  return (
    <div className='block md:hidden'>
      <Button variant='outline-gray' size='sm' onClick={openModal} className='rounded-full px-3'>
        <div className='flex gap-2'>
          <p className='input-15'>{t('common.filter')}</p>
          <Funnel className='size-5' />
        </div>
      </Button>
      <Modal
        ref={modalBottomRef}
        position='bottom'
        title={t('common.filter')}
        className='rounded-t-2xl'
        footer={
          <div className='flex justify-end gap-4'>
            <Button size={'sm'} variant={'ghost'} onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button size={'sm'} onClick={handleApply}>
              {t('common.apply')}
            </Button>
          </div>
        }>
        <div>
          <div className='space-y-3 px-4 py-6'>
            <Tabs
              options={orderActionFilterOptions}
              value={draftActionTab}
              onChange={handleActionTabChange}
              tabClassName='flex-1'
            />
            <Tabs options={periodFilterOptions} value={draftPeriodTab} onChange={handlePeriodTabChange} tabClassName='flex-1' />
            <DateRangePicker
              value={draftFilter.dateRange}
              onChange={(dateRange) => setDraftFilter((prev) => ({ ...prev, ...getOrderHistoryDateParams(dateRange) }))}
            />
            <Select options={[]} placeholder={t('placeholder.select_all_products')} />
            <Input
              placeholder={t('placeholder.search_order_number')}
              suffix={<Search className='text-text-secondary h-5 w-5' />}
              value={draftFilter.order_number_keyword || ''}
              onChange={(event) => setDraftFilter((prev) => ({ ...prev, order_number_keyword: event.target.value }))}
            />
            <Input
              placeholder={t('placeholder.search_order_name')}
              suffix={<Search className='text-text-secondary h-5 w-5' />}
              value={draftFilter.product_name_keyword || ''}
              onChange={(event) => setDraftFilter((prev) => ({ ...prev, product_name_keyword: event.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderFilterModal;
