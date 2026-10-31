'use client';

import { BankAccountRESP } from '@/apis/payment/payment.response';
import { usePaymentMethodsQuery } from '@/apis/payment/payment.query';
import { Button, Input, Modal, ModalHandle, SafeImage, Select } from '@/components/common';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

export type PopbillPaymentInput = {
  bankAccountKey: string;
  bankAccountHolder: string;
};

type PopbillPaymentModalProps = {
  onConfirm: (input: PopbillPaymentInput) => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
};

const FALLBACK_BANK_ACCOUNTS: BankAccountRESP[] = [
  { bank_account_key: 'woori', bank_name: '우리은행' },
  { bank_account_key: 'hana', bank_name: '하나은행' },
  { bank_account_key: 'im', bank_name: 'iM뱅크' },
];

const BANK_PRESENTATIONS: Record<string, { label: string; image: string }> = {
  woori: { label: '우리은행', image: '/images/bank/woori-bank.png' },
  hana: { label: '하나은행', image: '/images/bank/hana-bank.png' },
  im: { label: 'iM뱅크', image: '/images/bank/im-bank.png' },
};

const BankOptionLabel = ({ account }: { account: BankAccountRESP }) => {
  const presentation = BANK_PRESENTATIONS[account.bank_account_key.toLowerCase()];

  return (
    <span className='flex items-center gap-2'>
      {presentation?.image && (
        <SafeImage src={presentation.image} alt={presentation.label} width={24} height={24} className='size-6 object-contain' />
      )}
      <span>{presentation?.label || account.bank_name}</span>
    </span>
  );
};

export const PopbillPaymentModal = forwardRef<ModalHandle, PopbillPaymentModalProps>(
  ({ onConfirm, onClose, isLoading = false }, ref) => {
    const modalRef = useRef<ModalHandle>(null);
    const { data: paymentMethods, isFetching } = usePaymentMethodsQuery();
    const [bankAccountKey, setBankAccountKey] = useState('');
    const [bankAccountHolder, setBankAccountHolder] = useState('');
    const [holderError, setHolderError] = useState('');

    const bankAccounts = useMemo(
      () => (paymentMethods?.bank_accounts?.length ? paymentMethods.bank_accounts : FALLBACK_BANK_ACCOUNTS),
      [paymentMethods?.bank_accounts],
    );
    const bankOptions = useMemo(
      () => bankAccounts.map((account) => ({ label: <BankOptionLabel account={account} />, value: account.bank_account_key })),
      [bankAccounts],
    );

    const selectedBankAccountKey = bankAccounts.some((account) => account.bank_account_key === bankAccountKey)
      ? bankAccountKey
      : (bankAccounts[0]?.bank_account_key ?? '');

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }));

    const handleClosed = () => {
      setHolderError('');
      onClose();
    };

    const requestClose = () => {
      if (isLoading) return;

      modalRef.current?.close();
    };

    const handleConfirm = () => {
      const holder = bankAccountHolder.trim();

      if (!holder) {
        setHolderError('입금자명을 입력해 주세요.');
        return;
      }

      if (holder.length > 100) {
        setHolderError('입금자명은 100자 이하여야 합니다.');
        return;
      }

      setHolderError('');
      void onConfirm({ bankAccountKey: selectedBankAccountKey, bankAccountHolder: holder });
    };

    return (
      <Modal
        ref={modalRef}
        size='sm'
        title='무통장 입금'
        description='입금 은행과 실제 입금자명을 입력해 주세요.'
        closeOnOverlayClick={false}
        closeOnEsc={!isLoading}
        onClose={handleClosed}
        footer={
          <div className='flex gap-2'>
            <Button variant='outline' fullWidth disabled={isLoading} onClick={requestClose}>
              취소
            </Button>
            <Button fullWidth loading={isLoading} onClick={handleConfirm}>
              주문 및 결제정보 생성
            </Button>
          </div>
        }>
        <div className='space-y-5 p-4'>
          <Select
            label='입금 은행'
            required
            options={bankOptions}
            value={selectedBankAccountKey}
            onChange={(value) => setBankAccountKey(String(value))}
            placeholder={isFetching ? '은행 정보를 불러오는 중입니다.' : '은행을 선택해 주세요.'}
            disabled={isLoading || bankOptions.length === 0}
          />
          <Input
            label='입금자명'
            required
            value={bankAccountHolder}
            onChange={(event) => setBankAccountHolder(event.target.value)}
            placeholder='은행 앱에 표시될 입금자명'
            error={holderError}
            maxLength={100}
            disabled={isLoading}
          />
          <p className='caption-12 text-text-secondary'>입금자명은 은행 거래내역의 이름과 정확히 일치해야 자동으로 확인됩니다.</p>
        </div>
      </Modal>
    );
  },
);

PopbillPaymentModal.displayName = 'PopbillPaymentModal';
