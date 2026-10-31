'use client';

import { BANK_CODE_TO_BANK, BANK_OPTIONS } from '@/constants/dedicated-account';
import { BANK } from '@/enums/dedicated-account';
import { RefundHistoryStatus } from '@/enums/refund-account';
import { formatCurrency } from '@/lib/utils';
import { RefundAccount } from '@/types/refund-account';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ReactNode } from 'react';

type RefundAccountListCardProps = {
  data: RefundAccount[];
};

const RefundAccountListCard = ({ data }: RefundAccountListCardProps) => {
  const t = useTranslations();
  const refundHistoryStatusLabels: Record<RefundHistoryStatus, string> = {
    [RefundHistoryStatus.PENDING]: t('my.refund_history_status.pending'),
    [RefundHistoryStatus.COMPLETED]: t('my.refund_history_status.completed'),
    [RefundHistoryStatus.FAILED]: t('my.refund_history_status.failed'),
  };

  const getBankImage = (bankCode?: string) => {
    const bankKey = bankCode
      ? Object.values(BANK).includes(bankCode as BANK)
        ? bankCode
        : BANK_CODE_TO_BANK[bankCode as keyof typeof BANK_CODE_TO_BANK]
      : undefined;

    return BANK_OPTIONS.find((bank) => bank.value === bankKey)?.image ?? BANK_OPTIONS[0].image;
  };

  return (
    <section className='space-y-4 md:hidden'>
      {data.length === 0 && <p className='title-14 py-22.5 text-center'>{t('my.no_refund_history')}</p>}
      {data.map((item) => (
        <div key={item.id} className='border-border-soft space-y-4 rounded-xl border p-4'>
          <div className='title-16 flex items-center gap-3'>
            <p>{item.accountHolder}</p>
            <div className='bg-text-third size-1.5 rounded-full'></div>
            <p>{item.accountNumber}</p>
          </div>
          <div className='bg-border-soft h-px'></div>
          <div className='grid grid-cols-2 gap-y-4'>
            <InfoGroup label={t('my.settlement_date')} value={item.settlementDate} />
            <InfoGroup label={t('my.refund_amount')} value={formatCurrency(item.refundAmount)} />
            <InfoGroup
              label={t('my.bank')}
              value={
                <div className='flex items-center gap-1.5'>
                  <p>{item.bankName}</p>
                  <Image src={getBankImage(item.bankCode)} alt={item.bankName} width={20} height={20} unoptimized />
                </div>
              }
            />
            <InfoGroup label={t('my.account_number')} value={item.accountNumber} />
            <InfoGroup label={t('my.deposit_date')} value={item.depositDate} />
            <InfoGroup
              label={t('my.account_status')}
              value={
                <p className='caption-12 w-fit rounded-lg bg-[#6BB77A] px-2.5 py-1 font-bold text-white'>
                  {refundHistoryStatusLabels[item.status]}
                </p>
              }
            />
          </div>
        </div>
      ))}
    </section>
  );
};

export default RefundAccountListCard;

const InfoGroup = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <div className='flex flex-col gap-1'>
      <p className='body-14'>{label}</p>
      <div className='title-14'>{value}</div>
    </div>
  );
};
