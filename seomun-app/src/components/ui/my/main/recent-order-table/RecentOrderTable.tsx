'use client';

import { DashboardRESP } from '@/apis/my/dashboard/dashboard.response';
import { Button } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { ChevronRightThin } from '@/icons';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import OrderTable from '../../components/OrderTable';

type RecentOrderTableProps = {
  dataDashboard?: DashboardRESP;
  isLoading?: boolean;
};

const RecentOrderTable = ({ dataDashboard, isLoading }: RecentOrderTableProps) => {
  const tMy = useTranslations('my.order');
  const tCommon = useTranslations('common');
  const router = useRouter();

  return (
    <section className='grid grid-cols-1'>
      <div className='mb-4 flex items-center justify-between'>
        <p className='title-20'>{tMy('recent_order_history')}</p>
        <Button
          variant={'ghost'}
          className='md:border-border-soft h-9 px-0 md:border md:px-6'
          onClick={() => router.push(ROUTES.MY_PAGE.ORDER)}>
          <div className='flex items-center gap-2'>
            <p className='body-14 md:body-16'>{tCommon('see_more')}</p>
            <ChevronRightThin className='size-5 md:size-6' />
          </div>
        </Button>
      </div>
      <OrderTable orders={dataDashboard?.recent_orders ?? []} showPagination={false} isLoading={isLoading} />
      {/* <OrderCardList orders={DUMMY_ORDERS} /> */}
    </section>
  );
};

export default RecentOrderTable;
