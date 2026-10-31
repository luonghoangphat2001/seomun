import { BaseLayout } from '@/components/layout';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import NotFoundContent from '@/components/ui/not-found';
import { getLocale } from 'next-intl/server';

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <html className='scrollbar-thin h-dvh' lang={locale}>
      <body className='bg-background font-noto-sans text-text-main relative h-full'>
        <BaseLayout locale={locale}>
          <div className='flex min-h-screen flex-col'>
            <Header />
            <NotFoundContent />
            <Footer />
          </div>
        </BaseLayout>
      </body>
    </html>
  );
}
