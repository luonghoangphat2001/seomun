'use client';

import { useTranslations } from 'next-intl';
import PageTitle from '../components/PageTitle';
import OptionFilter from './OptionFilter';
import OptionListTable from './OptionListTable';
import OptionGuide from './OptionGuide';
import { RowSelectionState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { DepositStatusPeriod } from '@/enums/deposit-status';
import { SAVED_OPTION_PERIOD_TABS } from '@/constants/deposit-status';
import OptionListCard from './OptionListCard';
import { Button } from '@/components/common';
import OptionFilterModal from './OptionFilterModal';
import { Check } from '@/icons';
import { cn } from '@/lib/utils';
import { getDateRangeBySavedOptionPeriod, getInitFilterSavedOption } from '@/apis/my/saved-options/saved-options.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { SavedOptionListREQ } from '@/apis/my/saved-options/saved-options.request';
import { useDebounce } from '@/hooks';
import { useSavedOptionListQuery } from '@/apis/my/saved-options/saved-options.query';
import { format } from 'date-fns';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { DateRange } from 'react-day-picker';

type SavedOptionFilter = SavedOptionListREQ & {
  dateRange?: DateRange;
};

const MyLoadSavedOptions = () => {
  const t = useTranslations();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [tab, setTab] = useState<string>(DepositStatusPeriod.ONE_YEAR);
  const [mobileTab, setMobileTab] = useState<string>(DepositStatusPeriod.ONE_YEAR);

  const periodTabs = useMemo(() => SAVED_OPTION_PERIOD_TABS.map((option) => ({ ...option, label: t(option.label) })), [t]);
  const defaultMobileDateRange = useMemo(() => getDateRangeBySavedOptionPeriod(DepositStatusPeriod.ONE_YEAR), []);
  const [mobileFilter, setMobileFilter] = useState<SavedOptionFilter>({
    search: '',
    page: PAGINATION.DEFAULT_PAGE,
    per_page: PAGINATION.DEFAULT_PAGE_SIZE,
    start_date: defaultMobileDateRange?.from ? format(defaultMobileDateRange.from, DATE_FORMAT.DEFAULT) : undefined,
    end_date: defaultMobileDateRange?.to ? format(defaultMobileDateRange.to, DATE_FORMAT.DEFAULT) : undefined,
    dateRange: defaultMobileDateRange,
  });

  //desktop table filter
  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<SavedOptionListREQ>({
    getInitialFilter: (params) => {
      const initialFilter = getInitFilterSavedOption(params);
      const defaultDateRange = getDateRangeBySavedOptionPeriod(DepositStatusPeriod.ONE_YEAR);
      const dateRange =
        initialFilter.start_date || initialFilter.end_date
          ? {
              from: initialFilter.start_date ? new Date(initialFilter.start_date) : undefined,
              to: initialFilter.end_date ? new Date(initialFilter.end_date) : undefined,
            }
          : defaultDateRange;

      return {
        ...initialFilter,
        start_date: initialFilter.start_date || (dateRange?.from ? format(dateRange.from, DATE_FORMAT.DEFAULT) : undefined),
        end_date: initialFilter.end_date || (dateRange?.to ? format(dateRange.to, DATE_FORMAT.DEFAULT) : undefined),
        dateRange,
      };
    },
  });
  const requestFilter = useMemo(() => {
    const { dateRange: _, ...rest } = filter;

    return rest;
  }, [filter]);
  const debouncedFilter = useDebounce(requestFilter, 300);

  //api list
  const { data: dataSavedOptions, isLoading } = useSavedOptionListQuery(debouncedFilter, true);
  const savedOptionList = useMemo(() => {
    if (!dataSavedOptions) return [];
    return dataSavedOptions.list;
  }, [dataSavedOptions]);

  const isAllSelected = savedOptionList.length > 0 && savedOptionList.every((item) => rowSelection[item.id]);

  const handleSelectAll = () => {
    // unselect all
    if (isAllSelected) {
      setRowSelection({});
      return;
    }

    // select all
    const nextSelection = savedOptionList.reduce<RowSelectionState>((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {});

    setRowSelection(nextSelection);
  };

  return (
    <main className='space-y-4 md:space-y-6'>
      <PageTitle title={t('sidebar.items.load_save_options')} />
      <OptionFilter periodTabs={periodTabs} tab={tab} setTab={setTab} filter={filter} handleFilterChange={handleFilterChange} />
      <section className='flex items-center justify-between md:hidden'>
        <div className='flex gap-2'>
          <OptionFilterModal
            periodTabs={periodTabs}
            tab={mobileTab}
            filter={mobileFilter}
            onApply={(nextTab, nextFilter) => {
              setMobileTab(nextTab);
              setMobileFilter(nextFilter);
            }}
          />
          <Button
            variant='outline-gray'
            size='sm'
            onClick={handleSelectAll}
            rightIcon={<Check className='size-5' />}
            className={cn('input-15 rounded-full px-3', isAllSelected && 'bg-primary-500/80')}>
            {t('common.all')}
          </Button>
        </div>
      </section>
      <OptionListTable
        data={dataSavedOptions?.list || []}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
        totalPage={dataSavedOptions?.pagination.total_page || 1}
        totalRecord={dataSavedOptions?.pagination.total_item || 0}
      />
      <OptionListCard filter={mobileFilter} rowSelection={rowSelection} setRowSelection={setRowSelection} />
      <div className='mobile-seperator'></div>
      <OptionGuide />
    </main>
  );
};

export default MyLoadSavedOptions;
