import { MyLayoutComponent } from '@/components/layout';
import { PropsWithChildren } from 'react';

const MyLayout = ({ children }: PropsWithChildren) => {
  return <MyLayoutComponent>{children}</MyLayoutComponent>;
};

export default MyLayout;
