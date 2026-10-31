import MyFaqComponent from '@/components/ui/my/faq';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('my_faq.title'), description: t('my_faq.description') };
}

const MyFaqPage = () => {
  return <MyFaqComponent />;
};

export default MyFaqPage;
