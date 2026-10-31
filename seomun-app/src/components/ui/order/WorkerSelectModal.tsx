'use client';

import { useWorkerListQuery } from '@/apis/my/worker/worker.query';
import { WorkerRESP } from '@/apis/my/worker/worker.response';
import { Button, Input, Modal, ModalHandle, MyDataTable, Radio } from '@/components/common';
import { WorkerFilterTab } from '@/enums/worker';
import { Search } from '@/icons';
import { cn, splitPhonePattern } from '@/lib/utils';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { OrderCheckOutFormValues } from './schema';
import { useMediaQuery } from '@/hooks';

const WorkerSelectModal = forwardRef<ModalHandle>((_, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { setValue } = useFormContext<OrderCheckOutFormValues>();
  const [search, setSearch] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const appliedWorkerIdRef = useRef<number | null>(null);

  const { data, isLoading } = useWorkerListQuery({
    page: 1,
    per_page: 100,
    search_type: WorkerFilterTab.ALL,
    keyword: search.trim() || undefined,
  });

  const workers = useMemo(() => data?.list ?? [], [data?.list]);
  const selectedWorker = useMemo(
    () => workers.find((worker) => worker.id === selectedWorkerId) ?? null,
    [selectedWorkerId, workers],
  );

  const columns = useMemo<ColumnDef<WorkerRESP>[]>(
    () => [
      {
        id: 'select',
        header: '',
        cell: ({ row }) => (
          <Radio
            value={row.original.id}
            checked={selectedWorkerId === row.original.id}
            onChange={() => setSelectedWorkerId(row.original.id)}
          />
        ),
        meta: { width: '60px', align: 'center' },
      },
      {
        header: t('common.worker'),
        accessorKey: 'name',
        meta: { width: '180px', align: 'center' },
      },
      {
        header: t('common.mobile_phone'),
        accessorKey: 'mobile',
        cell: ({ row }) => splitPhonePattern(row.original.mobile)?.formatted || row.original.mobile,
        meta: { width: '180px', align: 'center' },
      },
    ],
    [selectedWorkerId, t],
  );

  const table = useReactTable({
    data: workers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (selectedWorkerId && !workers.some((worker) => worker.id === selectedWorkerId)) {
      setSelectedWorkerId(null);
    }
  }, [selectedWorkerId, workers]);

  const closeModal = () => {
    if (ref && 'current' in ref) {
      ref.current?.close();
    }
  };

  const resetModal = () => {
    setSearch('');
    setSelectedWorkerId(appliedWorkerIdRef.current);
  };

  const applyWorker = (worker: WorkerRESP) => {
    const phone = splitPhonePattern(worker.mobile);

    setValue('ordererInfo.ordererName', worker.name, { shouldValidate: true });
    setValue('ordererInfo.phoneHead', phone?.part1 || '', { shouldValidate: true });
    setValue('ordererInfo.phoneBody', phone?.part2 || '', { shouldValidate: true });
    setValue('ordererInfo.phoneTail', phone?.part3 || '', { shouldValidate: true });
  };

  const handleSelect = () => {
    if (!selectedWorker) return;

    appliedWorkerIdRef.current = selectedWorker.id;
    applyWorker(selectedWorker);
    closeModal();
  };

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      titleClassName='pt-0'
      size='md'
      className='max-w-160'
      title={<h2 className='title-20 md:title-24'>{t('common.worker')}</h2>}
      titleContainerClassName='px-5 py-4 md:px-8 md:py-5'
      bodyClassName='bg-white'
      onClose={resetModal}
      footer={
        <div className='flex justify-end gap-3 px-1 md:px-4'>
          <Button type='button' variant='outline' onClick={closeModal}>
            {t('common.cancel')}
          </Button>
          <Button type='button' onClick={handleSelect} disabled={!selectedWorker}>
            {t('common.select')}
          </Button>
        </div>
      }>
      <section className='border-border-soft space-y-4 border-y px-5 py-5 max-md:border-none md:px-8 md:py-6'>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('placeholder.search_input')}
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
              onRowClick={(worker) => setSelectedWorkerId(worker.id)}
              classNames={{
                header: 'bg-[#F5F5F5]',
                bodyRow: (worker) => (selectedWorkerId === worker.id ? 'bg-primary-50/60' : ''),
              }}
            />
          </div>

          <div className='scrollbar-hide max-h-100 space-y-3 overflow-auto md:hidden'>
            {isLoading ? (
              <div className='py-10 text-center'>{t('common.loading')}...</div>
            ) : workers.length > 0 ? (
              workers.map((worker) => {
                const isSelected = selectedWorkerId === worker.id;

                return (
                  <button
                    key={worker.id}
                    type='button'
                    className={cn(
                      'border-border-soft w-full rounded-xl border p-4 text-left',
                      isSelected && 'border-primary-200 bg-primary-50',
                    )}
                    onClick={() => setSelectedWorkerId(worker.id)}>
                    <div className='flex items-center justify-between gap-3'>
                      <Radio
                        label={worker.name}
                        labelClassName='title-16'
                        value={worker.id}
                        checked={isSelected}
                        onChange={() => setSelectedWorkerId(worker.id)}
                      />
                    </div>
                    <div className='border-border-soft my-4 border-t'></div>
                    <p className='body-16'>{splitPhonePattern(worker.mobile)?.formatted || worker.mobile}</p>
                  </button>
                );
              })
            ) : (
              <div className='body-14 text-text-secondary py-10 text-center'>{t('common.no_data')}</div>
            )}
          </div>
        </div>
      </section>
    </Modal>
  );
});

WorkerSelectModal.displayName = 'WorkerSelectModal';

export default WorkerSelectModal;
