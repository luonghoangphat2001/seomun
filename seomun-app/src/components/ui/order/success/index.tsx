'use client';

import { useEffect, useRef, useState } from 'react';
import { PROFILE_QUERY_KEYS } from '@/apis/my/profile/profile.query';
import { useInitPaymentMutation, useConfirmPaymentMutation } from '@/apis/payment/payment.query';
import { Button } from '@/components/common';
import { TOSS_AMOUNT, TOSS_ORDER_ID, TOSS_PAYMENT_KEY } from '@/constants/common';
import { OrderPaymentMethod } from '@/enums/order';
import { useRouter } from '@/i18n/navigation';
import { refreshAuthProfile } from '@/lib/utils/auth';
import { ROUTES } from '@/routes';
import { ErrorRESP } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

const OrderSuccessReturn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const hasProcessedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutateAsync: initPayment } = useInitPaymentMutation();
  const { mutateAsync: confirmPayment } = useConfirmPaymentMutation();

  useEffect(() => {
    const processPayment = async () => {
      const paymentKey = searchParams.get(TOSS_PAYMENT_KEY);
      const orderId = searchParams.get(TOSS_ORDER_ID);
      const amountParam = searchParams.get(TOSS_AMOUNT);
      const amount = Number(amountParam);

      const showError = (message: string) => {
        setErrorMessage(message);
        toast.error(message);
      };

      if (!paymentKey || !orderId || !amountParam || Number.isNaN(amount)) {
        showError(t('common.error'));
        return;
      }

      try {
        await initPayment({
          order_number: orderId,
          payment_method: OrderPaymentMethod.CARD,
        });

        await confirmPayment({
          paymentKey,
          orderId,
          amount,
        });

        try {
          await refreshAuthProfile();
          await queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEYS.GET] });
        } catch {
          // Payment was confirmed successfully, so a profile refresh failure must not block the result page.
        }

        router.push(`${ROUTES.ORDER_RESULT}?orderNumber=${encodeURIComponent(orderId)}`);
      } catch (error) {
        const message = (error as AxiosError<ErrorRESP>).response?.data.message ?? t('common.error');

        showError(message);
      }
    };

    if (hasProcessedRef.current) return;

    hasProcessedRef.current = true;
    void processPayment();
  }, [confirmPayment, initPayment, queryClient, router, searchParams, t]);

  if (errorMessage) {
    return (
      <main className='flex min-h-[52vh] items-center justify-center px-4 py-16'>
        <section className='border-border-soft w-full max-w-125 rounded-lg border bg-white px-5 py-8 text-center shadow-sm md:px-10 md:py-12'>
          <div className='bg-error/10 text-error mx-auto mb-5 flex size-12 items-center justify-center rounded-full text-2xl font-semibold'>
            !
          </div>
          <h1 className='title-20 md:title-24 mb-3'>결제 처리에 실패했습니다</h1>
          <p className='body-16 text-text-secondary mx-auto mb-8 max-w-90 break-words'>{errorMessage}</p>
          <Button variant='outline-primary' className='h-11 px-8' onClick={() => router.back()}>
            이전 페이지로 돌아가기
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className='flex min-h-[52vh] items-center justify-center px-4 py-16'>
      <section className='border-border-soft w-full max-w-125 rounded-lg border bg-white px-5 py-8 text-center shadow-sm md:px-10 md:py-12'>
        <div className='border-primary mx-auto mb-6 size-12 animate-spin rounded-full border-4 border-t-transparent' />
        <p className='title-18 md:title-24 mb-3'>결제를 승인하고 있습니다</p>
        <p className='body-16 text-text-secondary mx-auto max-w-90'>
          TossPayments 결제 결과를 확인하고 주문 정보를 저장하는 중입니다. 잠시만 기다려 주세요.
        </p>
      </section>
    </main>
  );
};

export default OrderSuccessReturn;
