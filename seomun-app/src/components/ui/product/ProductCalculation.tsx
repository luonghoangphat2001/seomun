'use client';

import { Button, Counter, ModalHandle, Popover } from '@/components/common';
import { useAuthStore, useScrollDirection } from '@/hooks';
import { Calculator, HelpCircle, Truck } from '@/icons';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { formatDeliveryDate } from '@/lib/utils/helper';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { RefObject, useEffect, useRef, useState } from 'react';
import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import { LoadOptionsModal } from './LoadOptionsModal';
import { SaveOptionsModal } from './SaveOptionsModal';
import { useProductStore } from './store/useProductStore';

type ProductCalculationProps = {
  productId?: number;
  openSpineModal?: () => void;
  onPayment?: () => void;
  onApplySavedOption?: (item: SavedOptionRESP) => void;
};

export const ProductCalculation = ({ productId, openSpineModal, onPayment, onApplySavedOption }: ProductCalculationProps) => {
  const t = useTranslations('product');
  const tHome = useTranslations('home');
  const { direction } = useScrollDirection();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const quotation = useProductStore((state) => state.quotation);
  const loadOptionsModalRef = useRef<ModalHandle>(null);
  const saveOptionsModalRef = useRef<ModalHandle>(null);

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

  const openAuthenticatedModal = (modalRef: RefObject<ModalHandle | null>) => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      const currentQueryString = searchParams.toString();
      const returnUrl = currentQueryString ? `${pathname}?${currentQueryString}` : pathname;
      const loginParams = new URLSearchParams({ returnUrl });

      router.push(`${ROUTES.LOGIN}?${loginParams.toString()}`);
      return;
    }

    modalRef.current?.open();
  };

  return (
    <div className='relative hidden max-2xl:min-w-[250px] md:block'>
      <div
        className={cn(
          'absolute z-10 w-[250px] shrink-0 bg-white transition-all duration-300 lg:fixed',
          direction == 'up' ? 'lg:top-42' : 'lg:top-10',
        )}>
        <div className='border-primary-200 overflow-hidden rounded-[12px] border bg-white shadow-md'>
          <div className='bg-primary-100 border-primary-200 flex items-center justify-center gap-1.5 border-b pt-4 pb-2'>
            <h2 className='title-20 font-semibold'>{t('estimate')}</h2>
            <Calculator className='size-6' />
          </div>

          <div className='space-y-3 px-6 pt-3 pb-4'>
            <div className='space-y-3'>
              {items.map((item, idx) => (
                <div key={idx} className='flex items-center justify-between'>
                  <span className='body-14'>{item.label}</span>
                  <span className='body-14'>
                    <Counter value={item.value} suffix={'원'} />
                  </span>
                </div>
              ))}

              <div className='border-border-soft h-1 border-t border-dashed' />

              <div className='space-y-3'>
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

              <div className='border-border-soft h-1 border-t border-dashed' />

              <div className='flex items-center justify-between'>
                <span className='title-16 font-semibold'>{t('payment_amount')}</span>
                <span className='title-16 text-text-brand font-bold'>
                  <Counter value={values.total} suffix='원' />
                </span>
              </div>
            </div>

            <div className='bg-border-light border-border-soft space-y-2 rounded-lg border p-3'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Truck className='size-5' />
                  <p className='body-16'>출고 예정</p>
                  <Popover
                    align='right'
                    contentClassName='w-[300px]'
                    trigger={<HelpCircle className='size-4.5 text-[#917965]' />}>
                    {t.rich('schedule_release_note', {
                      b: (chunks) => <b>{chunks}</b>,
                      br: () => <br />,
                    })}
                  </Popover>
                </div>
                <p className='title-20 text-right'>
                  {quotation?.estimated_production_days && formatDeliveryDate(quotation?.estimated_production_days)}
                  {/* {t('scheduled')} */}
                </p>
              </div>
              <div className='border-border-soft h-1 border-t' />
              <div className='body-14 flex items-center justify-between'>
                <span>{t('box_count_pieces', { count: quotation?.box_count || 1 })}</span>
                <span className='text-text-third'>•</span>
                <span className=''>
                  {t('weight')}: {quotation?.weight ? quotation.weight.toFixed(1) + 'kg' : '-'}
                </span>
              </div>
            </div>

            <div className='space-y-2'>
              <Button variant='outline' className='body-16 h-10 w-full' onClick={openSpineModal}>
                {tHome('book_spine')}
              </Button>
              <Button variant='primary' className='body-16 bg-primary-500 h-10 w-full' onClick={onPayment}>
                {t('direct_order')}
              </Button>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='body-14 h-10 w-full px-0'
                  onClick={() => openAuthenticatedModal(loadOptionsModalRef)}>
                  {t('load_options')}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='body-14 h-10 w-full px-0'
                  onClick={() => openAuthenticatedModal(saveOptionsModalRef)}>
                  {t('save_options')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoadOptionsModal ref={loadOptionsModalRef} onApply={onApplySavedOption} productId={productId} />
      <SaveOptionsModal ref={saveOptionsModalRef} />
    </div>
  );
};
