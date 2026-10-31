'use client';

import { WORKER_TAB_OPTIONS } from '@/constants/worker';
import { WorkerFilterTab } from '@/enums/worker';
import { RowSelectionState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import PageTitle from '../components/PageTitle';
import WorkerFilter from './WorkerFilter';
import WorkerFilterModal from './WorkerFilterModal';
import WorkerListCard from './WorkerListCard';
import WorkerListTable from './WorkerListTable';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { WorkerListREQ } from '@/apis/my/worker/worker.request';
import { getInitFilterWorker } from '@/apis/my/worker/worker.service';
import { useWorkerListQuery } from '@/apis/my/worker/worker.query';
import { PAGINATION } from '@/constants/common';

const MyWorker = () => {
  const t = useTranslations();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const tabOptions = useMemo(() => WORKER_TAB_OPTIONS.map((option) => ({ ...option, label: t(option.label) })), [t]);

  //desktop table filter
  const { filter, debouncedFilter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<WorkerListREQ>({
    getInitialFilter: getInitFilterWorker,
  });

  //api list
  const { data: dataWorker, isLoading } = useWorkerListQuery(debouncedFilter);

  //mobile filter
  const [mobileFilter, setMobileFilter] = useState<WorkerListREQ>({
    keyword: '',
    search_type: WorkerFilterTab.ALL,
    page: PAGINATION.DEFAULT_PAGE,
    per_page: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  const resetRowSelection = () => {
    setRowSelection({});
  };

  return (
    <main className='relative w-full space-y-4 md:space-y-6'>
      <PageTitle
        title={t('sidebar.items.worker_management')}
        extra={<WorkerFilterModal tabOptions={tabOptions} filter={mobileFilter} setMobileFilter={setMobileFilter} />}
      />
      <WorkerFilter
        tabOptions={tabOptions}
        filter={filter}
        handleFilterChange={handleFilterChange}
        rowSelection={rowSelection}
        resetRowSelection={resetRowSelection}
      />
      <WorkerListTable
        data={dataWorker?.list || []}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
        totalPage={dataWorker?.pagination?.total_page || 1}
      />
      <WorkerListCard filter={mobileFilter} rowSelection={rowSelection} setRowSelection={setRowSelection} />
    </main>
  );
};

export default MyWorker;
