'use client';

import { OrderHistoryListREQ } from '@/apis/my/order/order.request';
import { getDateRangeByOrderPeriod, getOrderFilterLabel, getOrderHistoryDateParams } from '@/apis/my/order/order.service';
import { Button, DateRangePicker, Input, Tabs } from '@/components/common';
import { PeriodFilter } from '@/enums/common';
import { OrderActionFilter } from '@/enums/order';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import { Download, Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

type OrderHistoryFilter = OrderHistoryListREQ & {
  dateRange?: DateRange;
};

type OrderFilterProps = {
  actionTab?: string;
  setActionTab?: (value: string) => void;
  periodTab?: string;
  setPeriodTab?: (value: string) => void;
  filter?: OrderHistoryFilter;
  handleFilterChange?: (filter: Partial<OrderHistoryFilter>) => void;
  onDownloadExcel?: () => void;
  isDownloadingExcel?: boolean;
};

const OrderFilter = ({
  actionTab,
  setActionTab,
  periodTab,
  setPeriodTab,
  filter,
  handleFilterChange,
  onDownloadExcel,
  isDownloadingExcel,
}: OrderFilterProps) => {
  const t = useTranslations();
  const [internalActionTab, setInternalActionTab] = useState<string>(OrderActionFilter.ALL);
  const [internalPeriodTab, setInternalPeriodTab] = useState<string>(PeriodFilter.SIX_MONTHS);
  const [internalFilter, setInternalFilter] = useState<OrderHistoryFilter>({});
  const currentActionTab = actionTab ?? internalActionTab;
  const currentPeriodTab = periodTab ?? internalPeriodTab;
  const currentFilter = filter ?? internalFilter;
  const changeFilter = handleFilterChange ?? ((nextFilter) => setInternalFilter((prev) => ({ ...prev, ...nextFilter })));

  const { orderActionFilterOptions, periodFilterOptions } = useEnumOptions(
    { orderActionFilterOptions: OrderActionFilter, periodFilterOptions: PeriodFilter },
    'filter',
  );

  const handleActionTabChange = (value: string) => {
    (setActionTab ?? setInternalActionTab)(value);
    changeFilter({ filter_label: getOrderFilterLabel(value) });
  };

  const handlePeriodTabChange = (value: string) => {
    (setPeriodTab ?? setInternalPeriodTab)(value);
    changeFilter(getOrderHistoryDateParams(getDateRangeByOrderPeriod(value)));
  };

  return (
    <div className='hidden space-y-3 md:block'>
      <div className='flex flex-wrap gap-3'>
        {/* <Select options={[]} placeholder={t('placeholder.select_all_products')} className='w-32' /> */}
        <Tabs options={orderActionFilterOptions} value={currentActionTab} onChange={handleActionTabChange} />
        <Tabs options={periodFilterOptions} value={currentPeriodTab} onChange={handlePeriodTabChange} />
        <DateRangePicker
          value={currentFilter.dateRange}
          onChange={(dateRange) => changeFilter(getOrderHistoryDateParams(dateRange))}
          className='w-55'
        />
      </div>
      <div className='flex flex-wrap justify-between gap-3'>
        <div className='flex flex-wrap gap-3'>
          <Input
            placeholder={t('placeholder.search_order_number')}
            suffix={<Search className='text-text-secondary h-5 w-5' />}
            containerClassName='w-[320px]'
            value={currentFilter.order_number_keyword || ''}
            onChange={(event) => changeFilter({ order_number_keyword: event.target.value })}
          />
          <Input
            placeholder={t('placeholder.search_order_name')}
            suffix={<Search className='text-text-secondary h-5 w-5' />}
            containerClassName='w-[320px]'
            value={currentFilter.product_name_keyword || ''}
            onChange={(event) => changeFilter({ product_name_keyword: event.target.value })}
          />
        </div>
        <Button rightIcon={<Download />} className='body-16' onClick={onDownloadExcel} loading={isDownloadingExcel}>
          {t('common.excel_download')}
        </Button>
      </div>
    </div>
  );
};

export default OrderFilter;
