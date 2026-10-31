'use client';

import { useWithdrawalCheckQuery } from '@/apis/my/withdrawal/withdrawal.query';
import { useTranslations } from 'next-intl';
import PageTitle from '../components/PageTitle';
import { Info } from '@/icons';
import { MEMBERSHIP_WITHDRAWAL_POLICIES, MEMBERSHIP_WITHDRAWAL_REASONS } from '@/constants/membership-withdrawal';
import { FormProvider, useForm } from 'react-hook-form';
import { FormTextarea } from '@/components/form';
import { Button, ModalHandle } from '@/components/common';
import { membershipWithDrawalDefault, MembershipWithDrawalFormValues, MembershipWithDrawalSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { ConfirmPasswordModal } from './ConfirmPasswordModal';
import { MemberShipWithdrawalReason } from '@/enums/membership-withdrawal';
import { cn } from '@/lib/utils';
import { Link, useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';

const MyMembershipWithdrawal = () => {
  const t = useTranslations();
  const confirmPasswordModalRef = useRef<ModalHandle>(null);
  const router = useRouter();

  //api withdrawal check
  const { data: withdrawalCheck, isFetching: isFetchingWithdrawalCheck } = useWithdrawalCheckQuery();

  //hook form
  const form = useForm<MembershipWithDrawalFormValues>({
    mode: 'all',
    defaultValues: membershipWithDrawalDefault,
    resolver: zodResolver(MembershipWithDrawalSchema(t)),
  });

  const { control, watch, setValue } = form;
  const reasonWatch = watch('reason');

  const onSelectReason = (value: MemberShipWithdrawalReason) => {
    setValue('reason', value);
  };

  const openConfirmPasswordModal = () => {
    confirmPasswordModalRef.current?.open();
  };

  const closeConfirmPasswordModal = () => {
    confirmPasswordModalRef.current?.close();
  };

  const info = [
    {
      label: t('my.point_schedule_expiration'),
      value: withdrawalCheck?.current_balance.s_point ?? 0,
    },
    {
      label: t('my.expired_refund_amount'),
      value: withdrawalCheck?.current_balance.pending_refund_amount ?? 0,
    },
    {
      label: t('my.money_schedule_expiration'),
      value: withdrawalCheck?.current_balance.c_coupons ?? 0,
      href: ROUTES.MY_PAGE.COUPON,
    },
  ];

  return (
    <FormProvider {...form}>
      <main className='space-y-4 md:space-y-6'>
        <PageTitle title={t('sidebar.items.withdraw_membership')} />
        <div className='mobile-seperator'></div>
        <section className='max-w-230 space-y-4 md:space-y-12'>
          <section className='space-y-2 text-center'>
            <h2 className='title-20 md:title-24'>{t('my.thank_you_using')}</h2>
            <p className='body-14 md:body-16 -tracking-[0.25px] md:tracking-normal'>{t('my.withdrawal_description')}</p>
          </section>
          <div className='mobile-seperator'></div>
          <section className='border-border-soft space-y-4 rounded-2xl md:space-y-5 md:border md:p-6'>
            <p className='title-16 md:title-18'>{t('my.current_balance')}</p>
            <div className='-mt-2 flex flex-wrap gap-x-5 gap-y-2 md:mt-0 md:gap-x-30 md:gap-y-4'>
              {info.map((item) => (
                <div key={item.label} className='body-14 md:body-16 flex items-center gap-3'>
                  <p className='w-45'>{item.label}</p>
                  <span className='flex items-center'>
                    <p className='w-25'>
                      <span className='title-16 md:title-18 text-text-brand mr-1.5'>{item.value}</span> 원
                    </p>
                    {item.href && (
                      <Link href={item.href} className='text-text-secondary hover:text-text-brand inline-flex w-5 items-center'>
                        <Info className='size-4 md:size-5' />
                      </Link>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {/* <div className='bg-border-soft h-px'></div>
            <div className='flex items-start gap-2 md:items-center'>
              <WarningCircle className='text-error size-4 stroke-2 md:size-6' />
              <p className='caption-12 md:body-16 text-text-secondary flex-1'>{t('my.withdrawal_warning')}</p>
            </div> */}
          </section>
          <div className='mobile-seperator'></div>
          <section className='space-y-4'>
            <p className='title-16 md:title-18'>{t('my.please_check_inconveniences')}</p>
            <div className='grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4'>
              {MEMBERSHIP_WITHDRAWAL_REASONS.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div
                    key={reason.value}
                    onClick={() => onSelectReason(reason.value)}
                    className={cn(
                      'border-border-soft flex cursor-pointer flex-col items-center gap-3 rounded-lg border py-6 hover:opacity-70',
                      reasonWatch === reason.value && 'bg-primary-50 border-border-brand text-text-brand',
                    )}>
                    <Icon className='size-8' />
                    <p className='body-14 md:input-15 px-2 text-center'>{t(reason.title)}</p>
                  </div>
                );
              })}
            </div>
          </section>
          <FormTextarea
            control={control}
            name='additionalComment'
            label={t('placeholder.please_write_down_complaint')}
            containerClassName='mt-6 md:mt-0'
            labelPlacement='top'
            rows={9}
          />
          <section className='bg-border-light text-text-secondary body-14 md:body-16 mt-6 rounded-lg p-3 md:mt-0 md:p-5'>
            <ol className='list-inside list-decimal space-y-2'>
              {MEMBERSHIP_WITHDRAWAL_POLICIES.map((policy, index) => (
                <li key={index}>
                  {t(policy.title)}

                  {policy.items && (
                    <ul className='mt-1 ml-6 list-disc space-y-1 marker:text-[8px]'>
                      {policy.items.map((item, i) => (
                        <li key={i}>{t(item)}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </section>
          <div className='mobile-button flex flex-wrap justify-center gap-4'>
            <div className='flex-1 md:max-w-37.5'>
              <Button
                size='lg'
                variant='outline'
                className='body-16 w-full px-3'
                onClick={() => router.push(ROUTES.MY_PAGE.MAIN)}>
                {t('order.print')}
              </Button>
            </div>
            <div className='flex-1 md:max-w-37.5'>
              <Button
                size='lg'
                className='body-16 w-full px-3'
                onClick={openConfirmPasswordModal}
                disabled={!withdrawalCheck?.can_withdraw}>
                {t('my.withdraw')}
              </Button>
            </div>
          </div>
        </section>

        <ConfirmPasswordModal
          ref={confirmPasswordModalRef}
          canWithdraw={withdrawalCheck?.can_withdraw}
          blockingReason={withdrawalCheck?.blocking_reason}
          isCheckingWithdrawal={isFetchingWithdrawalCheck}
          onClose={closeConfirmPasswordModal}
        />
      </main>
    </FormProvider>
  );
};

export default MyMembershipWithdrawal;
