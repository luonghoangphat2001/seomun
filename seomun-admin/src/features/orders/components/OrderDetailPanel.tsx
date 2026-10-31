import { AlertCircle, CheckCircle2, Loader2, Printer, UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

import { useApproveDesignWorkFlowMutation, usePrintWorkInstructionMutation, useOrderDetailQuery } from '../api';
import { OrderStatus } from '../enums';
import { OrderOrdererInfo, OrderPaymentInfo } from './OrderBasicInfo';
import { OrderProductInfo } from './OrderProductInfo';
import { OrderShippingInfo } from './OrderShippingInfo';
import { OrderStatusHistory } from './OrderStatusHistory';
import { DesignerListModal } from './DesignerListModal';

interface OrderDetailPanelProps {
  orderNumber: string;
  hideHeader?: boolean;
}

const ASSIGNABLE_DESIGNER_ORDER_STATUSES = new Set<string>([OrderStatus.CONFIRMED, OrderStatus.PURCHASE_CONFIRMED, OrderStatus.PENDING_RECEPTION]);

export function OrderDetailPanel({ orderNumber, hideHeader = false }: OrderDetailPanelProps) {
  const { t } = useTranslation('page');

  const { data: order, isLoading, isError, refetch, isFetching } = useOrderDetailQuery(orderNumber);
  const printMutation = usePrintWorkInstructionMutation();
  const approveDesignMutation = useApproveDesignWorkFlowMutation();
  const [isDesignerListOpen, setIsDesignerListOpen] = useState(false);

  function handlePrint() {
    if (!order) return;

    printMutation.mutate(String(order.id), {
      onSuccess: (res) => {
        window.open(res.data.pdf_url, '_blank');
        toast.success(t('orders.list.messages.print_success'));
      },
      onError: () => toast.error(t('orders.list.messages.print_error')),
    });
  }

  function handleApproveDesign() {
    approveDesignMutation.mutate(orderNumber, {
      onSuccess: () => toast.success(t('orders.detail.design.approve_success')),
      onError: () => toast.error(t('orders.detail.design.approve_error')),
    });
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='text-primary size-8 animate-spin' />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
        <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
          <AlertCircle className='size-6' />
        </div>

        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>{t('orders.detail.error.load_title')}</h2>
          <p className='text-muted-foreground text-sm'>{t('orders.detail.error.load_description')}</p>
        </div>

        <Button type='button' variant='outline' onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
          {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
          {t('orders.detail.retry')}
        </Button>
      </div>
    );
  }

  const printButton = (
    <Button variant='outline' size='sm' onClick={handlePrint} disabled={printMutation.isPending}>
      {printMutation.isPending ? <Loader2 className='mr-1 size-4 animate-spin' /> : <Printer className='mr-1 size-4' />}
      {t('orders.list.actions.print')}
    </Button>
  );

  const assignedDesigners = order.assigned_designers ?? [];
  const hasAssignedDesigners = assignedDesigners.length > 0;
  const canAssignDesigner = ASSIGNABLE_DESIGNER_ORDER_STATUSES.has(order.status);
  const canApproveDesign = order.status === OrderStatus.DESIGN_CONFIRMED;

  return (
    <div className='@container space-y-4'>
      <div className='flex items-center justify-between gap-2'>
        {hideHeader ? <span /> : <h2 className='text-lg font-semibold'>{order.order_number}</h2>}
        <div className='flex items-center gap-2'>
          {hasAssignedDesigners ? (
            <div className='flex max-w-64 flex-wrap items-center gap-x-1 text-xs font-medium'>
              <span className='text-muted-foreground'>{t('orders.detail.assign_designer.assigned_to')}</span>
              {assignedDesigners.map((designer) => (
                <Link
                  key={designer.id}
                  to='/administrators/$administratorId'
                  params={{ administratorId: String(designer.id) }}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-700 underline'
                >
                  {designer.name ? `${designer.name} (${designer.username})` : designer.username}
                </Link>
              ))}
            </div>
          ) : null}
          <Button
            variant='outline'
            size='sm'
            onClick={() => canAssignDesigner && setIsDesignerListOpen(true)}
            disabled={hasAssignedDesigners || !canAssignDesigner}
          >
            <UserRoundPlus className='mr-1 size-4' />
            {t('orders.detail.assign_designer.assign')}
          </Button>
          {canApproveDesign ? (
            <Button size='sm' onClick={handleApproveDesign} disabled={approveDesignMutation.isPending}>
              {approveDesignMutation.isPending ? <Loader2 className='mr-1 size-4 animate-spin' /> : <CheckCircle2 className='mr-1 size-4' />}
              {t('orders.detail.design.approve')}
            </Button>
          ) : null}
          {printButton}
        </div>
      </div>

      <div className='grid items-start gap-4 @2xl:grid-cols-2'>
        <div className='space-y-4'>
          <OrderOrdererInfo order={order} />
          <OrderPaymentInfo order={order} />
        </div>

        <OrderShippingInfo order={order} />
      </div>

      <OrderProductInfo
        items={order.product_information?.items ?? []}
        orderItems={order.items}
        orderNumber={order.order_number}
        orderStatus={order.status}
      />

      <OrderStatusHistory orderNumber={order.order_number} />

      <DesignerListModal
        orderNumber={order.order_number}
        open={isDesignerListOpen && canAssignDesigner}
        onOpenChange={(open) => setIsDesignerListOpen(open && canAssignDesigner)}
      />
    </div>
  );
}
