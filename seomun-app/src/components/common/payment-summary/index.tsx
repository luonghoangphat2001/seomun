'use client';

import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import { OptionsModal } from '@/components/ui/product/OptionsModal';
import { Calculator, CardHolder, HelpCircle, Shoppingbag, StackSimple, Truck } from '@/icons';
import { cn, formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Button } from '../button';
import { ModalHandle } from '../modal';
import { Popover } from '../popover';
import { Skeleton } from '../skeleton';

type PaymentSummaryProps = {
  className?: string;
  priceContainerClassName?: string;
  paymentAmount: number;
  paymentAmountClassName?: string;
  paymentAmountTitleClassName?: string;
  supplyPrice: number;
  productVAT: number;
  supplyVATClassName?: string;
  shippingSchedule?: string;
  box: number;
  weight: string;
  onPayment: () => void;
  displayNote?: boolean;
  displayCartButton?: boolean;
  onCart?: () => void;
  onCalculate?: () => void;
  displayCalculateButton?: boolean;
  paymentButtonTitle?: string;
  buttonContainerClassName?: string;
  displayShippingQuantity?: boolean;
  shippingQuantityContainerClassName?: string;
  displayPaymentIcon?: boolean;
  isLoading?: boolean;
  isCartLoading?: boolean;
  onApplySavedOption?: (item: SavedOptionRESP) => void;
  productId?: number;
  paymentButtonClassname?: string;
};

export const PaymentSummary = ({
  className,
  priceContainerClassName,
  paymentAmount,
  paymentAmountClassName,
  paymentAmountTitleClassName,
  supplyPrice,
  productVAT,
  supplyVATClassName,
  shippingSchedule,
  box,
  weight,
  onPayment,
  displayNote,
  displayCartButton,
  onCart,
  displayCalculateButton,
  onCalculate,
  paymentButtonTitle,
  buttonContainerClassName,
  displayShippingQuantity,
  shippingQuantityContainerClassName,
  displayPaymentIcon,
  isLoading,
  isCartLoading,
  onApplySavedOption,
  productId,
  paymentButtonClassname,
}: PaymentSummaryProps) => {
  const t = useTranslations('');

  const optionsModalRef = useRef<ModalHandle>(null);

  return (
    <section
      className={cn(
        'product-order-form-mobile border-border-soft fixed bottom-0 left-0 z-50 w-full border-t bg-white p-4 pb-6 shadow-[0px_-4px_20px_0px_#0000001A,-2px_-31px_30px_0px_#00000005] md:static md:z-auto md:p-0 md:shadow-none',
        className,
      )}>
      <div className={cn('flex items-start justify-between', priceContainerClassName)}>
        <p className={cn('title-18 md:title-20', paymentAmountTitleClassName)}>{t('product.payment_amount_main')}</p>
        <div className='space-y-1 text-right'>
          {isLoading ? (
            <>
              <Skeleton className='ml-auto h-8 w-32 md:h-10 md:w-45' />
              <Skeleton className='ml-auto h-5 w-52 md:w-68' />
            </>
          ) : (
            <>
              <p className={cn('title-24 md:title-32 text-text-brand', paymentAmountClassName)}>
                {formatCurrency(paymentAmount)}
              </p>
              <div className={cn('body-14 text-text-secondary flex justify-end', supplyVATClassName)}>
                ({t('product.supply_price')}: {formatCurrency(supplyPrice)} + {t('product.vat')}: {formatCurrency(productVAT)})
              </div>
            </>
          )}
        </div>
      </div>

      {displayShippingQuantity && (
        <div className={cn('grid grid-cols-2 gap-2 md:gap-4', shippingQuantityContainerClassName)}>
          <div className='border-border-soft bg-border-light caption-12 md:title-14 flex items-center justify-center gap-1.5 rounded-sm border px-2 py-2 md:gap-2 md:rounded-lg md:bg-transparent md:py-4'>
            <Truck className='size-5' />
            <p className=''>{t('order.shipping_schedule', { date: shippingSchedule || '' })}</p>
            <Popover align='right' contentClassName='w-[300px]' trigger={<HelpCircle className='size-4.5 text-[#917965]' />}>
              {t.rich('product.schedule_release_note', {
                b: (chunks) => <b>{chunks}</b>,
                br: () => <br />,
              })}
            </Popover>
          </div>
          <div className='border-border-soft bg-border-light caption-12 md:title-14 flex flex-wrap items-center justify-center gap-1.5 rounded-sm border px-2 py-2 md:gap-2 md:rounded-lg md:bg-transparent md:py-4'>
            <p>
              {t('order.box')}: {box} 개
            </p>
            <div className='vertical-seperator'></div>
            <p>
              {t('product.weight')}: {weight}
            </p>
          </div>
        </div>
      )}
      <div className={cn('flex justify-end gap-2 md:gap-4', buttonContainerClassName)}>
        <div className={cn(displayCalculateButton ? 'block md:hidden' : 'hidden')}>
          <Button
            variant='outline'
            size='lg'
            className='h-12 w-12 px-0 md:hidden'
            onClick={() => optionsModalRef.current?.open()}>
            <StackSimple className='size-6' />
          </Button>

          <Button variant='outline' size='lg' className='ml-2 h-12 w-12 px-0' onClick={onCalculate}>
            <Calculator className='size-6' />
          </Button>
        </div>
        {displayCartButton && (
          <>
            <Button
              variant='outline'
              size='lg'
              className='body-18 hidden h-14 max-w-50 flex-1 md:inline-flex'
              leftIcon={<Shoppingbag className='size-7' />}
              onClick={onCart}
              loading={isCartLoading}
              disabled={isCartLoading}>
              {t('product.shopping_cart')}
            </Button>
            <Button
              variant='outline'
              size='lg'
              className='h-12 w-12 px-0 md:hidden'
              onClick={onCart}
              loading={isCartLoading}
              disabled={isCartLoading}>
              <Shoppingbag className='size-6' />
            </Button>
          </>
        )}
        <Button
          type='button'
          size='lg'
          className={cn('body-16 flex-1', paymentButtonClassname)}
          onClick={onPayment}
          leftIcon={displayPaymentIcon && <CardHolder className='size-6 md:size-7' />}>
          {paymentButtonTitle || t('order.make_payment')}
        </Button>
      </div>
      {displayNote && <p className='body-14 text-text-secondary mt-3 hidden text-center md:block'>{t('order.payment_note')}</p>}

      <OptionsModal ref={optionsModalRef} onApplySavedOption={onApplySavedOption} productId={productId} />
    </section>
  );
};
