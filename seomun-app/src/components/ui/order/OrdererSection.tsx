'use client';

import { Button, Description, ModalHandle } from '@/components/common';
import { FormCellphone, FormCheckbox, FormInput } from '@/components/form';
import { useWorkerListQuery } from '@/apis/my/worker/worker.query';
import { WorkerRESP } from '@/apis/my/worker/worker.response';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { PHONE_OPTIONS } from '@/constants/common';
import { useMediaQuery } from '@/hooks';
import { WorkerFilterTab } from '@/enums/worker';
import { splitPhonePattern } from '@/lib/utils';
import { OrderCheckOutFormValues } from './schema';
import { useRef, useState } from 'react';
import WorkerSelectModal from './WorkerSelectModal';

const OrdererInfoSection = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { control, setValue, watch } = useFormContext<OrderCheckOutFormValues>();
  const t = useTranslations();
  const workerSelectModalRef = useRef<ModalHandle>(null);
  const [isWorkerSuggestionOpen, setIsWorkerSuggestionOpen] = useState(false);
  const ordererName = watch('ordererInfo.ordererName');
  const workerKeyword = ordererName.trim();

  const { data: workerData, isFetching: isFetchingWorkers } = useWorkerListQuery(
    {
      page: 1,
      per_page: 10,
      search_type: WorkerFilterTab.WORKER,
      keyword: workerKeyword,
    },
    Boolean(workerKeyword),
  );
  const workers = workerData?.list ?? [];

  const openWorkerSelectModal = () => {
    workerSelectModalRef.current?.open();
  };

  const applyWorker = (worker: WorkerRESP) => {
    const phone = splitPhonePattern(worker.mobile);

    setValue('ordererInfo.ordererName', worker.name, { shouldValidate: true });
    setValue('ordererInfo.phoneHead', phone?.part1 || '', { shouldValidate: true });
    setValue('ordererInfo.phoneBody', phone?.part2 || '', { shouldValidate: true });
    setValue('ordererInfo.phoneTail', phone?.part3 || '', { shouldValidate: true });
    setIsWorkerSuggestionOpen(false);
  };

  return (
    <div>
      <Description
        mode='form'
        isCollapse={false}
        title={
          <div className='flex items-center gap-4'>
            <p>{t('order.contact_person_info')}</p>
            <FormCheckbox
              control={control}
              name='saveForWorker'
              label={t('order.save_order_info')}
              labelClassName='body-16'
              className='hidden md:inline-flex'
            />
          </div>
        }
        extra={
          <Button type='button' variant='outline' className='md:body-16 h-7 px-3 md:h-10 md:px-6' onClick={openWorkerSelectModal}>
            {t('order.view_orderer')}
          </Button>
        }>
        <div className='mt-3 space-y-4 md:max-w-125 md:space-y-6'>
          <div className='relative'>
            <FormInput
              control={control}
              name='ordererInfo.ordererName'
              placeholder={t('footer.preface_printing')}
              label={t('common.orderer')}
              labelPlacement={isDesktop ? 'left' : 'top'}
              labelClassName='w-[126px] gap-1'
              inputClassName='w-full md:w-[358px]'
              onFocus={() => setIsWorkerSuggestionOpen(true)}
              onBlur={() => setIsWorkerSuggestionOpen(false)}
              onValueChange={() => setIsWorkerSuggestionOpen(true)}
              required
            />
            {isWorkerSuggestionOpen && workerKeyword && (isFetchingWorkers || workers.length > 0) && (
              <div className='border-border-soft absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-white shadow-lg md:left-[142px] md:w-[358px]'>
                {isFetchingWorkers ? (
                  <p className='body-14 text-text-secondary px-4 py-3'>{t('common.loading')}...</p>
                ) : workers.length > 0 ? (
                  workers.map((worker) => (
                    <button
                      key={worker.id}
                      type='button'
                      className='hover:bg-fill-soft flex w-full items-center justify-between gap-3 px-4 py-3 text-left'
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyWorker(worker)}>
                      <span className='body-16'>{worker.name}</span>
                      <span className='body-14 text-text-secondary'>
                        {splitPhonePattern(worker.mobile)?.formatted || worker.mobile}
                      </span>
                    </button>
                  ))
                ) : null}
              </div>
            )}
          </div>
          <FormCellphone
            labelPlacement={isDesktop ? 'left' : 'top'}
            control={control}
            namePrefix='ordererInfo.phoneHead'
            name1='ordererInfo.phoneBody'
            name2='ordererInfo.phoneTail'
            label={t('auth.cellphone')}
            phoneOptions={PHONE_OPTIONS}
            // placeholderSelect={t('auth.select')}
            isPrefixInput
            labelClassName='w-[126px] mb-0'
            inputClassName='w-full md:w-[358px]'
            verificationClassName='hidden'
            required
          />
          <FormCheckbox
            control={control}
            name='saveForWorker'
            label={t('order.save_order_info')}
            labelClassName='body-16'
            className='md:hidden'
          />
        </div>
      </Description>
      <WorkerSelectModal ref={workerSelectModalRef} />
    </div>
  );
};

export default OrdererInfoSection;
