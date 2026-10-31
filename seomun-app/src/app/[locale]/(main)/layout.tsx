import { SmoothScrolling } from '@/components/common';
import { Footer } from '@/components/ui/footer';
import FloatingToolbar from '@/components/ui/floating-toolbar/FloatingToolbar';
import { Header } from '@/components/ui/header';
import { PropsWithChildren } from 'react';

export default async function layout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <div className='mt-4'>
        <SmoothScrolling>{children}</SmoothScrolling>
      </div>
      <FloatingToolbar />
      <Footer />
    </>
  );
}
