'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/hooks';
import Loading from '@/components/common/loading';
import { DATE_FORMAT } from '@/constants/common';
import { formatDate } from '@/lib/utils';
import { refreshAuthProfile } from '@/lib/utils/auth';
import type { ErrorRESP } from '@/types';
import { AxiosError } from 'axios';
import { BANK } from '@/enums/dedicated-account';
import {
  useMyVirtualAccountQuery,
  useVirtualAccountCreateMutation,
  useVirtualAccountUpdateMutation,
} from '@/apis/my/virtual-account/virtual-account.query';
import { BANK_CODE_MAP, BANK_CODE_TO_BANK, BANK_OPTIONS } from '@/constants/dedicated-account';
import { Button, Radio, RadioGroup } from '@/components/common';
import PageTitle from '../components/PageTitle';

const MyDedicatedAccount = () => {
  const t = useTranslations();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [selectedBank, setSelectedBank] = useState<BANK>(BANK_OPTIONS[0].value);
  const { data: virtualAccount, isLoading } = useMyVirtualAccountQuery({
    enabled: isHydrated && isAuthenticated,
  });
  const { mutateAsync: createVirtualAccount, isPending: isPendingCreate } = useVirtualAccountCreateMutation();
  const { mutateAsync: updateVirtualAccount, isPending: isPendingUpdate } = useVirtualAccountUpdateMutation();

  useEffect(() => {
    if (virtualAccount?.bank_code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBank(BANK_CODE_TO_BANK[virtualAccount.bank_code as keyof typeof BANK_CODE_TO_BANK] ?? BANK_OPTIONS[0].value);
    }
  }, [virtualAccount?.bank_code]);

  const notices = [
    t('my.dedicated_account_note_1'),
    t('my.dedicated_account_note_2'),
    t('my.dedicated_account_note_3'),
    t('my.dedicated_account_note_4'),
    t('my.dedicated_account_note_5'),
    t('my.dedicated_account_note_6'),
    t('my.dedicated_account_note_7'),
    t('my.dedicated_account_note_8'),
    t('my.dedicated_account_note_9'),
  ];

  const handleCreate = async () => {
    try {
      const resp = await createVirtualAccount({ bank_code: BANK_CODE_MAP[selectedBank] });
      await refreshAuthProfile();
      toast.success(t('common.success_create'));
    } catch (error) {
      const message = (error as AxiosError<ErrorRESP>)?.response?.data.errors;
      toast.error(message ?? t('common.fail_create'));
    }
  };

  const handleUpdate = async () => {
    try {
      const resp = await updateVirtualAccount({ bank_code: BANK_CODE_MAP[selectedBank] });
      await refreshAuthProfile();
      toast.success(t('common.success_update'));
    } catch (error) {
      const message = (error as AxiosError<ErrorRESP>)?.response?.data.errors;
      toast.error(message ?? t('common.fail_update'));
    }
  };

  if (!isHydrated || !isAuthenticated) return null;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className='relative'>
      <PageTitle title={t('sidebar.items.account_management')} />
      <section className='mt-6 space-y-12 md:mt-8 md:max-w-230'>
        {virtualAccount && (
          <div className='border-border-soft space-y-2.5 rounded-xl border py-8 text-center'>
            <h2 className='title-20 md:title-24'>{virtualAccount.customer_name}</h2>
            <h2 className='title-24 text-text-brand'>
              {t(`bank.${BANK_CODE_TO_BANK[virtualAccount.bank_code as keyof typeof BANK_CODE_TO_BANK] ?? selectedBank}`)} (
              {virtualAccount.account_number})
            </h2>
            <p className='body-14 md:body-18 text-text-secondary'>
              {t('common.application_date')}: {formatDate(virtualAccount.issued_at, DATE_FORMAT.DEFAULT)}
            </p>
          </div>
        )}
        <div>
          <p className='body-16 md:body-18'>{t('my.please_select_bank')}</p>
          <div className='mt-4 md:mt-6 md:pr-6'>
            <RadioGroup
              className='grid grid-cols-2 gap-x-6 gap-y-4 min-[960px]:grid-cols-4! md:grid-cols-3 md:gap-x-8 md:gap-y-6'
              value={selectedBank}
              onChange={(value) => setSelectedBank(value as BANK)}>
              {BANK_OPTIONS.map((bank) => (
                <Radio
                  key={bank.value}
                  value={bank.value}
                  label={
                    <div className='flex items-center gap-2.5'>
                      <Image src={bank.image} alt={bank.value} width={28} height={28} unoptimized />
                      <p className='input-15'>{t(`bank.${bank.value}`)}</p>
                    </div>
                  }
                />
              ))}
            </RadioGroup>
          </div>
        </div>
        <div className='bg-border-light rounded-lg p-3 md:p-5'>
          <p className='title-14 md:title-18 text-text-secondary'>{t('my.dedicated_account_note')}</p>
          <ul className='text-text-secondary mt-3 list-disc space-y-1 pl-5 md:pl-6'>
            {notices.map((item, index) => (
              <li className='body-14 md:body-16' key={index}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className='mobile-button flex flex-wrap justify-center gap-4'>
          <div className='flex-1 md:max-w-50'>
            <Button
              size='lg'
              variant='outline'
              className='body-16 w-full px-3'
              onClick={handleUpdate}
              loading={isPendingUpdate}
              disabled={!virtualAccount}>
              {t('common.change')}
            </Button>
          </div>
          <div className='flex-1 md:max-w-50'>
            <Button
              size='lg'
              className='body-16 w-full px-3'
              onClick={handleCreate}
              loading={isPendingCreate}
              disabled={!!virtualAccount}>
              {t('my.dedicated_account_issuance')}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MyDedicatedAccount;
