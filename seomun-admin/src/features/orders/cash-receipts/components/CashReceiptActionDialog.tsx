import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppLabel } from '@/components/shared/app-label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type CashReceiptActionDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  isPending: boolean;
  variant?: 'default' | 'destructive';
  // Labels of currently selected rows. When provided, they are listed and the confirm button is disabled while empty.
  items?: string[];
  // When provided, a note textarea is rendered and its value/onChange are controlled here.
  note?: string;
  onNoteChange?: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function CashReceiptActionDialog({
  isOpen,
  title,
  description,
  confirmText,
  isPending,
  variant = 'default',
  items,
  note,
  onNoteChange,
  onClose,
  onConfirm,
}: CashReceiptActionDialogProps) {
  const { t } = useTranslation('page');

  const hasItems = items === undefined || items.length > 0;

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' onClick={onClose} disabled={isPending}>
        {t('orders.cash_receipts.actions.cancel')}
      </Button>
      <Button variant={variant} onClick={onConfirm} disabled={isPending || !hasItems}>
        {isPending ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
        {confirmText}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={isOpen} setIsOpen={onClose} title={title} width={460} footer={footer}>
      <div className='flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
        <AlertCircle className='mt-0.5 size-4 shrink-0 text-yellow-600' />
        <p className='text-sm text-yellow-800'>{description}</p>
      </div>
      {items ? (
        <div className='mt-3'>
          <p className='text-muted-foreground mb-1.5 text-xs font-medium'>
            {t('orders.cash_receipts.actions.selected_count', { count: items.length })}
          </p>
          {items.length > 0 ? (
            <ul className='max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2'>
              {items.map((item) => (
                <li key={item} className='font-mono text-xs'>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {onNoteChange ? (
        <div className='mt-3 space-y-1.5'>
          <AppLabel label={t('orders.cash_receipts.actions.note')} htmlFor='cash-receipt-action-note' />
          <Textarea
            id='cash-receipt-action-note'
            value={note ?? ''}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={t('orders.cash_receipts.actions.note_placeholder')}
            rows={3}
          />
        </div>
      ) : null}
    </AppDialogModal>
  );
}
