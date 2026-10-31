'use client';

import { Description, Popover, Radio } from '@/components/common';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { OrderCheckOutFormValues } from './schema';
import { HelpCircle, KakaoPay, NaverPay } from '@/icons';
import { useAuthStore } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

const PaymentSection = () => {
  const t = useTranslations('');
  const { profile } = useAuthStore();
  const { setValue, watch } = useFormContext<OrderCheckOutFormValues>();
  const isVirtualAccount = watch('isVirtualAccount');
  const isOtherPayment = watch('isOtherPayment');
  const isBankTransfer = watch('isBankTransfer');

  const selectVirtualAccount = () => {
    setValue('isVirtualAccount', true, { shouldDirty: true, shouldValidate: true });
    setValue('isOtherPayment', false, { shouldDirty: true, shouldValidate: true });
    setValue('isBankTransfer', false, { shouldDirty: true, shouldValidate: true });
  };

  const selectOtherPayment = () => {
    setValue('isVirtualAccount', false, { shouldDirty: true, shouldValidate: true });
    setValue('isOtherPayment', true, { shouldDirty: true, shouldValidate: true });
    setValue('isBankTransfer', false, { shouldDirty: true, shouldValidate: true });
  };

  const selectBankTransfer = () => {
    setValue('isVirtualAccount', false, { shouldDirty: true, shouldValidate: true });
    setValue('isOtherPayment', false, { shouldDirty: true, shouldValidate: true });
    setValue('isBankTransfer', true, { shouldDirty: true, shouldValidate: true });
  };

  const notes = [
    t('order.account_note_1'),
    t('order.account_note_2'),
    t('order.account_note_3'),
    t('order.account_note_4'),
    t('order.account_note_5'),
  ];

  return (
    <div>
      <Description mode='form' isCollapse={false} title={t('customer_service.payment')}>
        {/**desktop */}
        <div className='border-border-soft mt-4 rounded-2xl border p-4 md:block md:p-5'>
          <div className='flex flex-col justify-between gap-3 md:flex-row md:flex-wrap md:items-center md:gap-0'>
            <div className='flex items-center gap-2'>
              <Radio
                value='virtual_account'
                checked={!!isVirtualAccount}
                onChange={selectVirtualAccount}
                label={<p className='title-20'>{t('my.dedicated_account')}</p>}
              />
              <p className='caption-12 border-border-soft bg-border-light w-fit rounded-full border px-1.5 py-1'>
                {t('order.install_payment')}
              </p>
            </div>
            <div className='bg-primary-100 flex flex-col items-center gap-1.5 rounded-lg py-2.5 md:flex-row md:gap-3 md:rounded-none md:bg-transparent md:py-0'>
              <p className='caption-12 md:body-16'>
                {t('my.dedicated_account')}
                <span className='title-14 md:title-18 text-text-brand ml-1.5'>
                  {profile?.virtual_account?.bank.name} {profile?.virtual_account?.account_number}
                </span>
              </p>
              <p className='bg-primary-100 body-14 md:body-16 rounded-md px-2 py-1'>
                {t('order.held_amount')}:
                <span className='title-14 md:title-16 md:text-text-brand ml-2'>
                  {formatCurrency(profile?.balance?.balance || 0)}
                </span>
              </p>
            </div>
          </div>
          <div className='mt-3 rounded-lg bg-gray-50 p-3 md:mt-6 md:p-5'>
            <p className='title-14 text-text-secondary'>{t('order.what_dedicated_account')}</p>
            <ul className='mt-1.5 flex list-disc flex-col items-start gap-1 pl-5 md:mt-2 md:gap-2'>
              {notes.map((text, i) => (
                <li key={i} className='body-14 text-text-secondary'>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/**mobile */}
        <div className='mt-4 rounded-[10px] bg-gray-50 px-4 py-3 md:hidden'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-1.5'>
                <p className='button-13 text-text-secondary'>{t('my.dedicated_account')} </p>
                <Popover
                  align='left'
                  contentClassName='w-[180px]'
                  trigger={<HelpCircle className='text-text-secondary size-4' />}>
                  {''}
                </Popover>
              </div>
              <p className='title-14'>20,900원</p>
            </div>

            <p className='caption-12 border-border-soft bg-border-light w-fit rounded-full border px-1.5 py-1'>
              {t('order.install_payment')}
            </p>
          </div>
          <div className='mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2.5'>
            <p className='caption-12'>전용계좌:</p>
            <p className='title-14 text-text-brand'>기업은행 00106796097680</p>
          </div>
        </div>

        <div className='border-border-soft mt-6 space-y-3 rounded-2xl border p-4 md:p-6'>
          <Radio
            value='bank_transfer'
            checked={!!isBankTransfer}
            onChange={selectBankTransfer}
            label='무통장 입금 (POPBiLL)'
            labelClassName='title-20'
          />
          <p className='body-14 text-text-secondary'>결제하기를 누른 후 입금 은행과 입금자명을 입력해 주세요.</p>
        </div>

        <div className='border-border-soft mt-6 space-y-6 rounded-2xl border p-4 md:p-6'>
          <Radio
            value='other_payments'
            checked={!!isOtherPayment}
            onChange={selectOtherPayment}
            label={t('order.other_payment')}
            labelClassName='title-20'
          />
          <div className='flex gap-3'>
            <div className='flex w-23.75 justify-center rounded-md bg-gray-50 py-4'>
              <KakaoPay className='h-5 w-11.5' />
            </div>
            <div className='flex w-23.75 justify-center rounded-md bg-gray-50 py-4'>
              <NaverPay className='h-5 w-11.5' />
            </div>
            <div className='flex w-25 justify-center rounded-md bg-gray-50 py-4'>
              <p className='input-15'>{t('order.credit_card')}</p>
            </div>
          </div>
          <p className='body-14 text-text-secondary'>{t('order.other_payment_note')}</p>
        </div>
      </Description>
    </div>
  );
};

export default PaymentSection;
