import MyMainPage from '@/components/ui/my/main';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('my.title'), description: t('my.description') };
}

const MyRootPage = () => {
  return <MyMainPage />;
};

export default MyRootPage;
