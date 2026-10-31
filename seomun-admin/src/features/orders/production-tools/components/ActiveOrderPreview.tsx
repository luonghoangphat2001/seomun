import { Barcode } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ProductionOrder } from '../types/production-tools.type';
import { formatCurrency, getStatusStyle } from '../utils/production-tools.utils';

type ActiveOrderPreviewProps = {
  previewOrder: ProductionOrder | null;
};

export function ActiveOrderPreview({ previewOrder }: ActiveOrderPreviewProps) {
  return (
    <Card className='shadow-md'>
      <CardHeader className='border-b pb-4'>
        <CardTitle className='flex items-center gap-2 text-lg font-semibold'>Active Scanned Order</CardTitle>
      </CardHeader>
      <CardContent className='pt-5'>
        {previewOrder ? (
          <div className='space-y-5 text-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-muted-foreground text-xs tracking-wider uppercase'>Order Number</div>
                <div className='text-primary mt-0.5 text-lg font-bold'>{previewOrder.order_number}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(previewOrder.production_status)}`}>
                {previewOrder.production_status_label}
              </span>
            </div>

            <Separator />

            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='text-muted-foreground text-xs'>Customer Name</div>
                <div className='mt-0.5 text-sm font-medium'>{previewOrder.user.name}</div>
              </div>
              <div>
                <div className='text-muted-foreground text-xs'>Company</div>
                <div className='mt-0.5 text-sm font-medium'>{previewOrder.contact.company_name || '-'}</div>
              </div>
            </div>

            <div className='space-y-1'>
              <div className='text-muted-foreground text-xs'>Product Details</div>
              <div className='bg-muted/40 rounded-lg border p-3 text-sm font-medium'>{previewOrder.product.name}</div>
            </div>

            <div className='bg-accent/20 flex items-center justify-between rounded-lg border p-3'>
              <div className='text-muted-foreground text-xs font-medium'>Total Paid Amount</div>
              <div className='text-primary text-base font-bold'>{formatCurrency(Number(previewOrder.totals.total))}</div>
            </div>

            <div className='text-muted-foreground flex items-center justify-between pt-2 text-xs'>
              <div>
                Operator: <span className='font-medium'>{previewOrder.last_operator}</span>
              </div>
              <div>
                Time: <span className='font-medium'>{previewOrder.last_scanned_at}</span>
              </div>
            </div>

            <Button type='button' size='sm' variant='outline' className='mt-2 w-full' asChild>
              <Link to='/orders/$orderId' params={{ orderId: previewOrder.order_number }}>
                Inspect Complete Order Details
              </Link>
            </Button>
          </div>
        ) : (
          <div className='text-muted-foreground flex flex-col items-center justify-center py-12 text-center'>
            <Barcode className='mb-3 size-12 stroke-[1.2] opacity-40' />
            <p className='text-sm font-medium'>No order currently selected.</p>
            <p className='mt-1 max-w-[240px] text-xs'>Scan a barcode or click any scan from the history below to inspect.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
