'use client';

import { Button } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

const OrderFailReturn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorMessage = searchParams.get('message');
  const errorCode = searchParams.get('code');
  const orderNumber = searchParams.get('orderNumber') || searchParams.get('orderId');

  return (
    <main className='flex min-h-[52vh] items-center justify-center px-4 py-16'>
      <section className='border-border-soft w-full max-w-125 rounded-lg border bg-white px-5 py-8 text-center shadow-sm md:px-10 md:py-12'>
        <div className='bg-error/10 text-error mx-auto mb-5 flex size-12 items-center justify-center rounded-full text-2xl font-semibold'>
          !
        </div>
        <h1 className='title-20 md:title-24 mb-3'>결제가 완료되지 않았습니다</h1>
        <p className='body-16 text-text-secondary mx-auto mb-4 max-w-90 break-words'>
          TossPayments 결제 과정에서 문제가 발생했습니다. 결제 정보를 확인한 뒤 다시 시도해 주세요.
        </p>
        {(errorMessage || errorCode || orderNumber) && (
          <div className='bg-fill-soft mx-auto mb-8 max-w-95 space-y-1 rounded-lg px-4 py-3 text-left'>
            {errorMessage && <p className='body-14 text-text-main break-words'>{errorMessage}</p>}
            {errorCode && <p className='caption-12 text-text-secondary break-words'>오류 코드: {errorCode}</p>}
            {orderNumber && <p className='caption-12 text-text-secondary break-words'>주문번호: {orderNumber}</p>}
          </div>
        )}
        <Button variant='outline-primary' className='h-11 px-8' onClick={() => router.back()}>
          이전 페이지로 돌아가기
        </Button>
      </section>
    </main>
  );
};

export default OrderFailReturn;
