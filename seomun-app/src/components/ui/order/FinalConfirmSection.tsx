'use client';

import { useRef, useState } from 'react';
import { Description, ModalHandle, PaymentSummary } from '@/components/common';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { OrderCheckOutFormValues } from './schema';
import { OrderQuoteRESP } from '@/apis/product/product.response';
import { CartQuoteRESP } from '@/apis/cart/cart.response';
import { formatDeliveryDate } from '@/lib/utils/helper';
import { formatCurrency } from '@/lib/utils';
import { useCreateOrderProductMutation } from '@/apis/order/order.query';
import { transformOrderCheckoutFormValuesToCreateOrderREQ } from '@/apis/order/order.service';
import { usePaymentByVirtualAccountMutation } from '@/apis/payment/payment.query';
import { ErrorRESP, ProductSelectedOptions } from '@/types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { handlePayment } from '@/lib/utils/payment';
import { refreshAuthProfile } from '@/lib/utils/auth';
import { useOrderCartItemMutation } from '@/apis/cart/cart.query';
import { transformFormValuesToCartOrderREQ } from '@/apis/cart/cart.service';
import { useAuthStore } from '@/hooks';
import { PopbillPaymentInput, PopbillPaymentModal } from './PopbillPaymentModal';
import { useCreateBankTransferPaymentMutation } from '@/apis/payment/payment.query';

type FinalConfirmSectionProps = {
  dataOrderQuotation?: OrderQuoteRESP;
  dataCartQuote?: CartQuoteRESP;
  cartItemIds?: number[];
  selectedOptions?: ProductSelectedOptions | null;
  selectedCouponId?: number;
};

const getPointUsed = (point: string | undefined, availablePoint: number) =>
  Math.min(Math.max(0, availablePoint), Math.max(0, Math.floor(Number(point) || 0)));

const FinalConfirmSection = ({
  dataOrderQuotation,
  dataCartQuote,
  cartItemIds = [],
  selectedOptions,
  selectedCouponId,
}: FinalConfirmSectionProps) => {
  const confirmPaymentModalRef = useRef<ModalHandle>(null);
  const popbillPaymentModalRef = useRef<ModalHandle>(null);
  const router = useRouter();
  const t = useTranslations('');
  const { handleSubmit, control, setValue } = useFormContext<OrderCheckOutFormValues>();
  const appliedPoint = useWatch({ control, name: 'appliedPoint' });
  const { profile } = useAuthStore();
  const [pendingPaymentInput, setPendingPaymentInput] = useState<OrderCheckOutFormValues | null>(null);
  const [pendingPopbillOrderNumber, setPendingPopbillOrderNumber] = useState<string | null>(null);

  //api create order
  const { mutateAsync: createOrder, isPending: isPendingCreateOrder } = useCreateOrderProductMutation();
  //api create order from cart
  const { mutateAsync: orderCartItem, isPending: isPendingOrderCartItem } = useOrderCartItemMutation();
  //api payment by virtualAccount
  const { mutateAsync: paymentByVirtualAccount, isPending: isPendingPaymentByVA } = usePaymentByVirtualAccountMutation();
  const { mutateAsync: createBankTransferPayment, isPending: isPendingBankTransferPayment } =
    useCreateBankTransferPaymentMutation();

  const hasCartOrder = cartItemIds.length > 0;
  const isLoading = isPendingCreateOrder || isPendingOrderCartItem || isPendingPaymentByVA || isPendingBankTransferPayment;
  const cartCheckoutSummary = dataCartQuote?.checkout_summary;
  const orderQuoteSummary = dataOrderQuotation?.quote.summary;
  // const productAmount = cartCheckoutSummary?.amount_supply || orderQuoteSummary?.subtotal || 0;
  const shippingFee = cartCheckoutSummary?.shipping_fee || orderQuoteSummary?.shipping_fee || 0;
  const paymentAmount = cartCheckoutSummary?.total_payment || orderQuoteSummary?.total || 0;
  const availablePoint = Math.max(0, Number(profile?.point.balance) || 0);
  const pointUsed = getPointUsed(appliedPoint, availablePoint);
  const couponDiscount = cartCheckoutSummary?.amount_discount ?? orderQuoteSummary?.discount ?? 0;
  const totalDiscount = couponDiscount + pointUsed;
  const supplyPrice = cartCheckoutSummary?.amount_supply || orderQuoteSummary?.subtotal || 0;
  const productVAT = cartCheckoutSummary?.amount_vat ?? orderQuoteSummary?.tax ?? 0;
  // Points are applied to the VAT-inclusive total, so they do not reduce the taxable supply price or VAT.
  const finalPaymentAmount = Math.max(paymentAmount - pointUsed, 0);
  const shippingSchedule = formatDeliveryDate(
    cartCheckoutSummary?.estimated_production_days || orderQuoteSummary?.estimated_production_days || 1,
    'short',
  );
  const box = cartCheckoutSummary?.package_estimate.box_count || orderQuoteSummary?.box_count || 1;
  const weight = cartCheckoutSummary?.package_estimate.shipping_weight || orderQuoteSummary?.shipping_weight || 0;

  const closeConfirmPaymentModal = () => {
    if (isLoading) return;

    confirmPaymentModalRef.current?.close();
    setPendingPaymentInput(null);
  };

  const openConfirmPaymentModal = (input: OrderCheckOutFormValues) => {
    if ((!selectedOptions && !hasCartOrder) || isLoading) return;

    setPendingPaymentInput(input);

    if (input.isBankTransfer) {
      popbillPaymentModalRef.current?.open();
      return;
    }

    confirmPaymentModalRef.current?.open();
  };

  const handleOpenConfirmPaymentModal = () => {
    void handleSubmit(openConfirmPaymentModal)();
  };

  const makePayment = async (input: OrderCheckOutFormValues) => {
    if ((!selectedOptions && !hasCartOrder) || isLoading) return;

    try {
      const orderInput = { ...input, point: String(getPointUsed(input.appliedPoint, availablePoint)) };
      const createOrderResponse =
        hasCartOrder && cartItemIds.length > 0
          ? await orderCartItem(transformFormValuesToCartOrderREQ(orderInput, cartItemIds, selectedCouponId))
          : await createOrder(
              transformOrderCheckoutFormValuesToCreateOrderREQ(
                orderInput,
                selectedOptions as ProductSelectedOptions,
                selectedCouponId,
              ),
            );
      const orderNumber = createOrderResponse.data.order.order_number;
      let resultOrderNumber = orderNumber;

      //card by Toss
      if (input.isOtherPayment) {
        confirmPaymentModalRef.current?.close();
        setPendingPaymentInput(null);
        await handlePayment(() => {}, createOrderResponse.data.order);
        return;
      }

      //pay by virtual account
      if (input.isVirtualAccount) {
        const paymentResponse = await paymentByVirtualAccount({ order_number: orderNumber });
        resultOrderNumber = paymentResponse.data.order.order_number;
        await refreshAuthProfile();
      }

      closeConfirmPaymentModal();
      router.push(`${ROUTES.ORDER_RESULT}?orderNumber=${encodeURIComponent(resultOrderNumber)}`);
    } catch (error) {
      const message = (error as AxiosError<ErrorRESP>).response?.data.message ?? t('common.error');

      toast.error(message);
    }
  };

  const makePopbillPayment = async ({ bankAccountKey, bankAccountHolder }: PopbillPaymentInput) => {
    if (!pendingPaymentInput || (!selectedOptions && !hasCartOrder) || isLoading) return;

    try {
      setValue('bankAccountKey', bankAccountKey, { shouldDirty: true });
      setValue('bankAccountHolder', bankAccountHolder, { shouldDirty: true });
      const orderInput = {
        ...pendingPaymentInput,
        point: String(getPointUsed(pendingPaymentInput.appliedPoint, availablePoint)),
      };
      let orderNumber = pendingPopbillOrderNumber;

      if (!orderNumber) {
        const createOrderResponse =
          hasCartOrder && cartItemIds.length > 0
            ? await orderCartItem(transformFormValuesToCartOrderREQ(orderInput, cartItemIds, selectedCouponId))
            : await createOrder(
                transformOrderCheckoutFormValuesToCreateOrderREQ(
                  orderInput,
                  selectedOptions as ProductSelectedOptions,
                  selectedCouponId,
                ),
              );

        orderNumber = createOrderResponse.data.order.order_number;
        setPendingPopbillOrderNumber(orderNumber);
      }

      const paymentResponse = await createBankTransferPayment({
        order_number: orderNumber,
        payment_method: 'bank_transfer',
        bank_account_key: bankAccountKey,
        bank_account_holder: bankAccountHolder,
      });

      if (!paymentResponse.data.bank_transfer) {
        toast.error('입금 계좌 정보를 불러오지 못했습니다. 관리자에게 문의해 주세요.');
        return;
      }

      setPendingPaymentInput(null);
      router.push(
        `${ROUTES.ORDER_RESULT}?orderNumber=${encodeURIComponent(orderNumber)}&transactionId=${encodeURIComponent(paymentResponse.data.transaction_id)}`,
      );
    } catch (error) {
      const message = (error as AxiosError<ErrorRESP>).response?.data.message ?? t('common.error');

      toast.error(message);
    }
  };

  const closePopbillPaymentModal = () => {
    if (isLoading) return;

    setPendingPaymentInput(null);
  };

  return (
    <div>
      <Description mode='form' isCollapse={false} title={t('order.final_confirm_payment')}>
        <>
          <section className='mt-4 space-y-3'>
            <div className='body-16 flex items-center justify-between'>
              <p className='text-text-secondary'>{t('order.total_product_amount')}</p>
              <p>{formatCurrency(supplyPrice + productVAT)}</p>
            </div>
            <div className='body-16 flex items-center justify-between'>
              <p className='text-text-secondary'>{t('order.discount_amount')}</p>
              <p>-{formatCurrency(totalDiscount)}</p>
            </div>
            <div className='body-16 flex items-center justify-between'>
              <p className='text-text-secondary'>{t('common.shipping_fee')}</p>
              <p>+{formatCurrency(shippingFee)}</p>
            </div>
          </section>
          <div className='border-border-soft my-6 border-t border-dashed'></div>
          <PaymentSummary
            className='md:border-none'
            paymentAmount={finalPaymentAmount}
            supplyPrice={supplyPrice}
            productVAT={productVAT}
            shippingSchedule={shippingSchedule}
            box={box}
            weight={weight > 0 ? `${weight}kg` : '-'}
            onPayment={handleOpenConfirmPaymentModal}
            displayNote
            displayShippingQuantity
            shippingQuantityContainerClassName='my-3 md:mt-4 md:mb-6'
          />
        </>
      </Description>
      <ConfirmModal
        ref={confirmPaymentModalRef}
        title={t('order.final_confirm_payment')}
        description={t('order.payment_note')}
        textConfirm={t('order.make_payment')}
        isLoading={isLoading}
        onClose={closeConfirmPaymentModal}
        onConfirm={() => {
          if (!pendingPaymentInput) return;

          void makePayment(pendingPaymentInput);
        }}
      />
      <PopbillPaymentModal
        ref={popbillPaymentModalRef}
        isLoading={isLoading}
        onClose={closePopbillPaymentModal}
        onConfirm={makePopbillPayment}
      />
    </div>
  );
};

export default FinalConfirmSection;
