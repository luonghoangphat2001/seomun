'use client';

import { useMyDashboardQuery } from '@/apis/my/dashboard/dashboard.query';
import Membership from './membership/Membership';
import RecentOrderStatistic from './recent-order-statistic/RecentOrderStatistic';
import RecentOrderTable from './recent-order-table/RecentOrderTable';
import RecentPost from './recent-post/RecentPost';

const MyMainPage = () => {
  const { data: dataDashboard, isLoading } = useMyDashboardQuery();

  return (
    <div className='-mb-12 space-y-4 md:m-0 md:space-y-8'>
      <Membership dataDashboard={dataDashboard} />
      {/* <div className='mobile-seperator'></div> */}
      <RecentOrderStatistic dataDashboard={dataDashboard} />
      <div className='mobile-seperator'></div>
      <RecentOrderTable dataDashboard={dataDashboard} isLoading={isLoading} />
      <div className='mobile-seperator'></div>
      <RecentPost dataDashboard={dataDashboard} />
    </div>
  );
};

export default MyMainPage;
