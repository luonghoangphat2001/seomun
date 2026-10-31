import CustomerServiceSideBar from '@/components/ui/sidebar/CustomerServiceSideBar';
import { PropsWithChildren } from 'react';

const CustomerServiceLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className='global-padding mb-9 md:mt-4 md:mb-37.5'>
        <div className='flex flex-col gap-4 md:flex-row md:gap-14'>
          <CustomerServiceSideBar />
          <div className='flex min-w-0 flex-1 flex-col gap-4 md:gap-6'>{children}</div>
        </div>
      </div>
      {/* <CustomerService /> */}
    </>
  );
};

export default CustomerServiceLayout;
