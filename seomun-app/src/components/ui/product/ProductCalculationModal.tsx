'use client';

import { Button, Counter, Modal, ModalHandle } from '@/components/common';
import { HelpCircle, Printer, Truck } from '@/icons';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useProductStore } from './store/useProductStore';
import { ScheduleReleaseModal } from './ScheduleReleaseModal';
import { formatDeliveryDate } from '@/lib/utils/helper';

type ProductCalculationModalProps = {
  onPayment: () => void;
};

export const ProductCalculationModal = forwardRef<ModalHandle, ProductCalculationModalProps>(({ onPayment }, ref) => {
  const t = useTranslations('product');
  const scheduleReleaseModalRef = useRef<ModalHandle>(null);
  const quotation = useProductStore((state) => state.quotation);
  const isLoadingQuotation = useProductStore((state) => state.isLoadingQuotation);

  const [values, setValues] = useState({
    paperFee: 0,
    plateFee: 0,
    printFee: 0,
    binding: 0,
    order: 0,
    sum: 0,
    vat: 0,
    total: 0,
  });

  const openScheduleReleaseModal = () => {
    scheduleReleaseModalRef.current?.open();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setValues({
        paperFee: quotation?.paper_price || 0,
        plateFee: 0,
        printFee: quotation?.printing_price || 0,
        binding: quotation?.post_processing_price || 0,
        order: 0,
        sum: quotation?.sub_total || 0,
        vat: (quotation?.sub_total || 0) * 0.1,
        total: quotation?.total || 0,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [quotation]);

  const items = [
    { label: t('yongjidae'), value: values.paperFee },
    // { label: t('panbi'), value: values.plateFee },
    { label: t('printing_cost'), value: values.printFee },
    { label: t('binding'), value: values.binding },
    // { label: t('order'), value: values.order },
  ];

  return (
    <Modal ref={ref} position='bottom' size='sm' title={t('estimate')}>
      <div className='space-y-4 px-4 py-8'>
        <div className='space-y-3'>
          {items.map((item, idx) => (
            <div key={idx} className='flex items-center justify-between'>
              <span className='body-14'>{item.label}</span>
              <span className='body-14'>
                <Counter value={item.value} suffix='원' />
              </span>
            </div>
          ))}

          <div className='border-border-soft h-px border-t border-dashed' />

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='body-14'>{t('total')}</span>
              <span className='body-14'>
                <Counter value={values.sum} suffix='원' />
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='body-14'>{t('vat')}</span>
              <span className='body-14'>
                <Counter value={values.vat} suffix='원' />
              </span>
            </div>
          </div>

          <div className='border-border-soft h-px border-t border-dashed' />

          <div className='flex items-center justify-between'>
            <span className='title-16 font-semibold'>{t('payment_amount')}</span>
            <span className='title-16 text-text-brand font-semibold'>
              <Counter value={values.total} suffix='원' />
            </span>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div className='border-border-soft bg-border-light flex flex-1 items-center gap-2 rounded-sm border px-3 py-2'>
              <Truck className='size-4.5' />
              <span className='caption-12'>
                {' '}
                {quotation?.estimated_production_days && formatDeliveryDate(quotation?.estimated_production_days)}
              </span>
              <div onClick={openScheduleReleaseModal}>
                <HelpCircle className='size-4 text-[#917965]' />
              </div>
            </div>
            <div className='border-border-soft bg-border-light flex flex-1 items-center gap-1 rounded-sm border px-3 py-2'>
              <span className='caption-12'>{t('box_count_pieces', { count: quotation?.box_count || 1 })}</span>
              <span className='text-text-third'>•</span>
              <span className='caption-12'>
                {t('weight')}: {quotation?.weight ? quotation.weight.toFixed(1) + 'kg' : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          {/* <div className='border-border-soft flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border'>
            <Printer className='size-6' />
          </div> */}
          <Button variant='primary' size='lg' className='w-full' onClick={onPayment}>
            {t('direct_order')}
          </Button>
        </div>
      </div>

      <ScheduleReleaseModal ref={scheduleReleaseModalRef} />
    </Modal>
  );
});

ProductCalculationModal.displayName = 'ProductCalculationModal';
