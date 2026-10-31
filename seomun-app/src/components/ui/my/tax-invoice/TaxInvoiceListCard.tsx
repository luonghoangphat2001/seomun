'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { CashReceipt } from '@/types/cash-receipt';
import { useTranslations } from 'next-intl';

type TaxInvoiceListCardProps = {
  data: CashReceipt[];
};

const TaxInvoiceListCard = ({ data }: TaxInvoiceListCardProps) => {
  const t = useTranslations();

  const infos = [
    { label: t('my.order_cost'), key: 'orderAmount' },
    { label: t('common.shipping_fee'), key: 'shippingFee' },
    { label: t('order.discount_amount'), key: 'discountAmount' },
    { label: t('my.total_amount'), key: 'totalAmount' },
    { label: t('my.supply_price'), key: 'supplyPrice' },
    { label: t('product.vat'), key: 'vat' },
  ];

  return (
    <section className='-mx-4 md:hidden'>
      {data.map((item) => (
        <div key={item.id} className='border-border-soft even:bg-border-light border-t p-4 last:border-b'>
          <div className='body-16 flex items-center justify-between'>
            <button
              type='button'
              className='text-text-brand cursor-pointer'
              onClick={() => window.open(ROUTES.MY_PAGE.ORDER_DETAIL(item.approvalNumber), '_blank', 'noopener,noreferrer')}>
              {item.approvalNumber}
            </button>
            <p>{item.issueDate}</p>
          </div>
          <div className='mt-3 space-y-2'>
            {infos.map((info) => (
              <div key={info.key} className='flex items-center justify-between'>
                <p className='title-14'>{info.label}</p>
                <p className={cn('body-16', info.key === 'vat' && 'title-16')}>
                  {formatCurrency(item[info.key as keyof CashReceipt], false)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default TaxInvoiceListCard;
