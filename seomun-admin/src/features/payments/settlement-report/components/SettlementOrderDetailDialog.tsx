import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OrderBasicInfo, OrderProductInfo, useOrderDetailQuery } from '@/features/orders';

// === Type definitions ===

type SettlementOrderDetailDialogProps = {
  orderNumber: string | null;
  onClose: () => void;
};

export function SettlementOrderDetailDialog({ orderNumber, onClose }: SettlementOrderDetailDialogProps) {
  const { t } = useTranslation('page');

  const { data: order, isLoading } = useOrderDetailQuery(orderNumber ?? '', { enabled: orderNumber !== null });

  return (
    <Dialog open={orderNumber !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className='scrollbar-slim sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('orders.detail.title', { order_number: orderNumber ?? '' })}</DialogTitle>
          <DialogDescription>{t('orders.detail.description')}</DialogDescription>
        </DialogHeader>

        {isLoading || !order ? (
          <div className='text-muted-foreground flex items-center justify-center py-12'>
            <Loader2 className='size-5 animate-spin' />
          </div>
        ) : (
          <div className='max-h-[70vh] space-y-6 overflow-y-auto py-1'>
            <OrderBasicInfo order={order} readOnly />
            <OrderProductInfo items={order.product_information?.items ?? []} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
