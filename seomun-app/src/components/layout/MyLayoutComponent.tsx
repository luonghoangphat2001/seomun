import BoardNoticeGate from '../ui/my/components/BoardNoticeGate';
import MySidebar from '../ui/sidebar/MySidebar';

type Props = {
  children: React.ReactNode;
};

export const MyLayoutComponent = ({ children }: Props) => {
  return (
    <div className='global-padding mb-12 md:mt-8 md:mb-37.5'>
      <div className='flex gap-12'>
        <MySidebar />
        <div className='flex-1'>
          <BoardNoticeGate>{children}</BoardNoticeGate>
        </div>
      </div>
    </div>
  );
};
