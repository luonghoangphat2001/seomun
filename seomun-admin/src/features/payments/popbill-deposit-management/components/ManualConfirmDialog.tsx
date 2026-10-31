import dayjs from 'dayjs';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppLabel } from '@/components/shared/app-label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { usePaymentsQuery } from '@/features/payments/payment-list/api';
import { PaymentMethod, PaymentStatus } from '@/features/payments/payment-list/enums';
import { formatKrw } from '@/utils/format-currency';

import type { BankDepositRESP } from '../api';
import { useConfirmBankDepositMutation } from '../api';

type ManualConfirmDialogProps = {
  deposit: BankDepositRESP | null;
  onClose: () => void;
};

const normalizeAmount = (value: string) => {
  const [whole, decimal = ''] = value.split('.');
  return `${whole.replace(/^0+(?=\d)/, '')}.${decimal.padEnd(2, '0')}`;
};

export function ManualConfirmDialog({ deposit, onClose }: ManualConfirmDialogProps) {
  const { t } = useTranslation('page');
  const [selectedPaymentId, setSelectedPaymentId] = useState<number>();
  const [note, setNote] = useState('');
  const isOpen = Boolean(deposit);

  const {
    data: paymentResponse,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
  } = usePaymentsQuery({ page: 1, per_page: 100, payment_method: PaymentMethod.BANK_TRANSFER, status: PaymentStatus.PENDING }, { enabled: isOpen });
  const candidatePayments = useMemo(
    () =>
      paymentResponse?.data.payments.filter((payment) => (deposit ? normalizeAmount(payment.amount) === normalizeAmount(deposit.amount) : false)) ??
      [],
    [deposit, paymentResponse?.data.payments],
  );

  const closeAndReset = () => {
    setSelectedPaymentId(undefined);
    setNote('');
    onClose();
  };

  const confirmMutation = useConfirmBankDepositMutation({
    onSuccess: () => {
      toast.success(t('payments.popbill_deposits.manual_confirm.success', 'Bank deposit confirmed.'));
      closeAndReset();
    },
    onError: () => {
      toast.error(t('payments.popbill_deposits.manual_confirm.error', 'Unable to confirm bank deposit.'));
    },
  });

  const handleConfirm = () => {
    if (!deposit || !selectedPaymentId || !note.trim()) return;

    confirmMutation.mutate({
      depositId: deposit.id,
      payload: { payment_transaction_id: selectedPaymentId, note: note.trim() },
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !confirmMutation.isPending) closeAndReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-3xl' showCloseButton={!confirmMutation.isPending}>
        <DialogHeader>
          <DialogTitle>{t('payments.popbill_deposits.manual_confirm.title', 'Manually confirm bank deposit')}</DialogTitle>
          <DialogDescription>
            {t(
              'payments.popbill_deposits.manual_confirm.description',
              'Select the pending bank-transfer payment that matches this deposit, then record the reason for confirmation.',
            )}
          </DialogDescription>
        </DialogHeader>

        {deposit ? (
          <div className='bg-muted/40 grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-3'>
            <div>
              <p className='text-muted-foreground text-xs'>{t('payments.popbill_deposits.manual_confirm.deposit_amount', 'Deposit amount')}</p>
              <p className='font-medium'>{formatKrw(deposit.amount)}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>{t('payments.popbill_deposits.manual_confirm.sender', 'Sender / remark')}</p>
              <p className='font-medium'>{deposit.remarks[0] ?? '-'}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs'>{t('payments.popbill_deposits.manual_confirm.deposited_at', 'Deposited at')}</p>
              <p className='font-medium'>{dayjs(deposit.deposited_at).format('YYYY-MM-DD HH:mm')}</p>
            </div>
          </div>
        ) : null}

        <div className='space-y-2'>
          <AppLabel required>{t('payments.popbill_deposits.manual_confirm.candidates', 'Matching pending payments')}</AppLabel>
          {isPaymentsLoading ? (
            <div className='text-muted-foreground flex min-h-24 items-center justify-center gap-2 rounded-lg border border-dashed text-sm'>
              <Loader2 className='size-4 animate-spin' />
              {t('common.message.loading', 'Loading...')}
            </div>
          ) : isPaymentsError ? (
            <p className='text-destructive rounded-lg border border-dashed p-3 text-sm'>
              {t('payments.popbill_deposits.manual_confirm.load_error', 'Unable to load payment candidates.')}
            </p>
          ) : candidatePayments.length ? (
            <RadioGroup
              value={selectedPaymentId?.toString()}
              onValueChange={(value) => setSelectedPaymentId(Number(value))}
              className='max-h-60 overflow-y-auto rounded-lg border p-1'
            >
              {candidatePayments.map((payment) => (
                <label key={payment.id} className='hover:bg-muted flex cursor-pointer items-start gap-3 rounded-md p-3'>
                  <RadioGroupItem value={payment.id.toString()} className='mt-1' />
                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
                      <span className='font-mono text-xs'>{payment.transaction_id}</span>
                      <span className='font-medium'>{formatKrw(payment.amount)}</span>
                    </div>
                    <p className='text-sm font-medium'>{payment.order.order_number}</p>
                    <p className='text-muted-foreground text-xs'>
                      {payment.order.contact.company_name ?? payment.order.user.name} · {dayjs(payment.created_at).format('YYYY-MM-DD HH:mm')}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          ) : (
            <p className='text-muted-foreground rounded-lg border border-dashed p-3 text-sm'>
              {t('payments.popbill_deposits.manual_confirm.no_candidates', 'No pending bank-transfer payments with the same amount were found.')}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <AppLabel required htmlFor='manual-confirm-note'>
            {t('payments.popbill_deposits.manual_confirm.note', 'Confirmation note')}
          </AppLabel>
          <Textarea
            id='manual-confirm-note'
            value={note}
            maxLength={1000}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('payments.popbill_deposits.manual_confirm.note_placeholder', 'Describe why this deposit matches the selected payment.')}
            disabled={confirmMutation.isPending}
          />
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={closeAndReset} disabled={confirmMutation.isPending}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPaymentId || !note.trim() || confirmMutation.isPending}>
            {confirmMutation.isPending ? <Loader2 className='size-4 animate-spin' /> : null}
            {t('payments.popbill_deposits.manual_confirm.submit', 'Confirm manually')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
