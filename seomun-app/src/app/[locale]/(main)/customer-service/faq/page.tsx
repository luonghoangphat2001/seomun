import { FaqList } from '@/components/ui/customer-service/faq';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('faq.title'), description: t('faq.description') };
}

const FaqPage = () => {
  return <FaqList />;
};

export default FaqPage;
