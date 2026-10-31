'use client';

import Image from 'next/image';
import { forwardRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { Button, Modal, ModalHandle } from '@/components/common';
import { FormInput, FormRow, FormSelect } from '@/components/form';
import { BANK } from '@/enums/dedicated-account';
import { BANK_CODE_TO_BANK, BANK_OPTIONS } from '@/constants/dedicated-account';
import { useMediaQuery } from '@/hooks';
import { MyAccountChangeBankREQ } from '@/apis/my/account/account.request';
import { useMyAccountChangeBankMutation } from '@/apis/my/account/account.query';
import { MyAccountRESP } from '@/apis/my/account/account.response';
import { AxiosError } from 'axios';
import type { ErrorRESP } from '@/types';
import toast from 'react-hot-toast';

type ChangeRefundAccountModalProps = {
  account?: MyAccountRESP | null;
};

const getBankValue = (bankCode?: string) => {
  if (!bankCode) return BANK_OPTIONS[0].value;

  if (Object.values(BANK).includes(bankCode as BANK)) {
    return bankCode as BANK;
  }

  return BANK_CODE_TO_BANK[bankCode as keyof typeof BANK_CODE_TO_BANK] ?? BANK_OPTIONS[0].value;
};

export const ChangeRefundAccountModal = forwardRef<ModalHandle, ChangeRefundAccountModalProps>(({ account }, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { mutateAsync: changeBank, isPending } = useMyAccountChangeBankMutation();

  const defaultValues = useMemo<MyAccountChangeBankREQ>(
    () => ({
      bank_code: getBankValue(account?.bank_code),
      account_number: account?.account_number ?? '',
      account_holder: account?.account_holder ?? '',
    }),
    [account?.account_holder, account?.account_number, account?.bank_code],
  );

  const form = useForm<MyAccountChangeBankREQ>({
    mode: 'all',
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const closeModal = () => {
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.close();
    }
  };

  const resetModal = () => {
    form.reset(defaultValues);
  };

  const onSubmit = async (values: MyAccountChangeBankREQ) => {
    try {
      const resp = await changeBank(values);
      toast.success(resp.message ?? t('common.success_update'));
      closeModal();
    } catch (error) {
      const message = (error as AxiosError<ErrorRESP>)?.response?.data.errors;
      toast.error(message ?? t('common.fail_update'));
    }
  };

  const bankOptions = BANK_OPTIONS.map((bank) => ({
    value: bank.value,
    label: (
      <div className='flex items-center gap-2.5'>
        <Image src={bank.image} alt={bank.value} width={20} height={20} unoptimized />
        <span>{t(`bank.${bank.value}`)}</span>
      </div>
    ),
  }));

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      size='md'
      title={<h2 className='modal-title'>{t('my.refund_account_change_bank')}</h2>}
      titleClassName='pt-0'
      className='max-w-[560px]'
      onClose={resetModal}
      footer={
        <div className='flex gap-3'>
          <Button variant='outline' fullWidth disabled={isPending} onClick={closeModal}>
            {t('common.cancel')}
          </Button>
          <Button fullWidth loading={isPending} disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
            {t('common.save')}
          </Button>
        </div>
      }>
      <FormProvider {...form}>
        <div className='space-y-4 p-4 md:space-y-5 md:p-6'>
          <FormRow label={t('my.bank')} required labelPlacement='top'>
            <FormSelect
              control={form.control}
              name='bank_code'
              options={bankOptions}
              placeholder={t('placeholder.select')}
              selectClassname='h-11'
              renderSelectedValue={(option) => option.label}
            />
          </FormRow>
          <FormRow label={t('my.account_holder')} required labelPlacement='top'>
            <FormInput control={form.control} name='account_holder' placeholder={t('my.account_holder')} />
          </FormRow>
          <FormRow label={t('my.account_number')} required labelPlacement='top'>
            <FormInput control={form.control} name='account_number' placeholder={t('my.account_number')} numericOnly />
          </FormRow>
          <p className='caption-12 text-text-secondary'>{t('my.refund_account_change_bank_note')}</p>
        </div>
      </FormProvider>
    </Modal>
  );
});

ChangeRefundAccountModal.displayName = 'ChangeRefundAccountModal';
