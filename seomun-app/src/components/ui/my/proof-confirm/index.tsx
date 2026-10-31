'use client';

import { useOrderHistoryListQuery } from '@/apis/my/order/order.query';
import { useTranslations } from 'next-intl';
import OrderFilterModal from '../components/OrderFilterModal';
import OrderFilter from '../components/OrderFilter';
import OrderTable from '../components/OrderTable';
import PageTitle from '../components/PageTitle';

const MyProofConfirmComponent = () => {
  const tSidebar = useTranslations('sidebar.items');
  const { data: orderHistoryData, isLoading } = useOrderHistoryListQuery({ page: 1, per_page: 10 });

  return (
    <div className='space-y-4 md:space-y-6'>
      <PageTitle title={tSidebar('draft_confirmation')} />
      <OrderFilterModal />
      <OrderFilter />
      <OrderTable orders={orderHistoryData?.list ?? []} isLoading={isLoading} />
    </div>
  );
};

export default MyProofConfirmComponent;
