'use client';

import { usePaymentDetailQuery } from '@/apis/payment/payment.query';
import { PaymentTransactionStatus } from '@/apis/payment/payment.response';
import { orderQueryKeys } from '@/apis/order/order.query';
import { Button } from '@/components/common';
import { formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

type PopbillPaymentStatusProps = {
  orderNumber?: string;
  transactionId: string;
};

const ACTIVE_STATUSES: PaymentTransactionStatus[] = ['pending', 'processing'];

const STATUS_LABELS: Record<PaymentTransactionStatus, string> = {
  pending: '입금 확인 대기',
  processing: '입금 확인 중',
  paid: '결제가 완료되었습니다.',
  cancelled: '결제가 취소되었습니다.',
  failed: '결제에 실패했습니다.',
  expired: '결제 시간이 만료되었습니다.',
  refunded: '환불이 완료되었습니다.',
  partially_refunded: '부분 환불이 완료되었습니다.',
};

const PopbillPaymentStatus = ({ orderNumber, transactionId }: PopbillPaymentStatusProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidatedPaidOrderRef = useRef(false);
  const redirectedPaidOrderRef = useRef(false);
  const { data, error, isFetching, refetch } = usePaymentDetailQuery(transactionId);
  const transaction = data?.transaction;
  const bankTransfer = transaction?.bank_transfer;
  const status = transaction?.status;
  const isWaitingForPayment = !status || ACTIVE_STATUSES.includes(status);

  useEffect(() => {
    if (!isWaitingForPayment) return;

    const checkPaymentWhenVisible = () => {
      if (!document.hidden) void refetch();
    };
    const timer = window.setInterval(() => {
      if (!document.hidden) void refetch();
    }, 30_000);

    document.addEventListener('visibilitychange', checkPaymentWhenVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', checkPaymentWhenVisible);
    };
  }, [isWaitingForPayment, refetch]);

  useEffect(() => {
    if (status !== 'paid' || !orderNumber || invalidatedPaidOrderRef.current) return;

    invalidatedPaidOrderRef.current = true;
    void queryClient.invalidateQueries({ queryKey: [orderQueryKeys.ORDER_DETAIL, orderNumber] });
  }, [orderNumber, queryClient, status]);

  useEffect(() => {
    if (status !== 'paid' || !orderNumber || redirectedPaidOrderRef.current) return;

    redirectedPaidOrderRef.current = true;
    router.replace(`${ROUTES.ORDER_RESULT}?orderNumber=${encodeURIComponent(orderNumber)}`);
  }, [orderNumber, router, status]);

  const copyAccountNumber = async () => {
    if (!bankTransfer?.account_number) return;

    try {
      await navigator.clipboard.writeText(bankTransfer.account_number);
      toast.success('계좌번호가 복사되었습니다.');
    } catch {
      toast.error('계좌번호를 복사하지 못했습니다.');
    }
  };

  const errorMessage = error ? '결제 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.' : null;

  return (
    <main className='mx-auto mt-14 mb-12 max-w-180 space-y-6 px-4 md:mt-12 md:mb-24 md:space-y-8'>
      <header className='space-y-2 text-center'>
        <h1 className='title-20 md:title-32'>{status ? STATUS_LABELS[status] : '입금 정보를 불러오는 중입니다.'}</h1>
        {isWaitingForPayment && <p className='body-16 text-text-secondary'>아래 계좌로 정확한 금액을 입금해 주세요.</p>}
      </header>

      {errorMessage && <p className='rounded-lg bg-red-50 p-4 text-center text-red-600'>{errorMessage}</p>}

      <section className='border-border-soft overflow-hidden rounded-2xl border bg-white'>
        <div className='border-border-soft border-b px-5 py-4 md:px-6'>
          <h2 className='title-18'>입금 정보</h2>
        </div>
        {bankTransfer ? (
          <dl className='divide-border-soft divide-y'>
            <div className='flex items-center justify-between gap-4 px-5 py-4 md:px-6'>
              <dt className='body-14 text-text-secondary'>입금 금액</dt>
              <dd className='title-20 text-text-brand'>{formatCurrency(Number(transaction?.amount || 0))}</dd>
            </div>
            <div className='flex items-center justify-between gap-4 px-5 py-4 md:px-6'>
              <dt className='body-14 text-text-secondary'>입금 은행</dt>
              <dd className='body-16 font-semibold'>{bankTransfer.bank_name}</dd>
            </div>
            <div className='flex items-center justify-between gap-4 px-5 py-4 md:px-6'>
              <dt className='body-14 text-text-secondary'>계좌번호</dt>
              <dd className='flex items-center gap-2 text-right'>
                <span className='body-16 font-semibold break-all'>{bankTransfer.account_number}</span>
                <Button size='xs' variant='outline' onClick={() => void copyAccountNumber()}>
                  복사
                </Button>
              </dd>
            </div>
            <div className='flex items-center justify-between gap-4 px-5 py-4 md:px-6'>
              <dt className='body-14 text-text-secondary'>예금주</dt>
              <dd className='body-16 font-semibold'>{bankTransfer.account_holder}</dd>
            </div>
          </dl>
        ) : (
          <p className='body-16 text-text-secondary px-5 py-8 text-center'>입금 계좌 정보가 준비되지 않았습니다.</p>
        )}
      </section>

      {bankTransfer?.transfer_instructions && (
        <section className='rounded-xl bg-gray-50 p-5'>
          <h2 className='title-16 mb-2'>입금 안내</h2>
          <p className='body-14 text-text-secondary whitespace-pre-wrap'>{bankTransfer.transfer_instructions}</p>
        </section>
      )}

      <div className='flex flex-col justify-center gap-3 sm:flex-row'>
        <Button variant='outline' onClick={() => router.push(ROUTES.HOME)}>
          쇼핑 계속하기
        </Button>
        <Button loading={isFetching} onClick={() => void refetch()}>
          입금 확인
        </Button>
      </div>
    </main>
  );
};

export default PopbillPaymentStatus;
