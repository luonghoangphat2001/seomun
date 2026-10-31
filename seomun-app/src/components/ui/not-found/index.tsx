import { Button } from '@/components/common';
import { Link } from '@/i18n/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function NotFoundContent() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <main className='global-padding flex flex-1 flex-col items-center justify-center gap-4 pb-4 text-center'>
      <h1 className='text-primary text-[80px] leading-none font-black opacity-50 select-none md:text-[120px]'>404</h1>

      <div className='space-y-3'>
        <h2 className='title-20 md:title-24'>{t('page_not_found')}</h2>
        <p className='body-16 md:body-18 text-text-secondary max-w-md'>{t('sorry_not_found')}</p>
      </div>

      <Link href='/'>
        <Button size='md' className='px-12'>
          {t('go_to_home')}
        </Button>
      </Link>
    </main>
  );
}
