import MyCartComponent from '@/components/ui/my/cart';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('cart.title'), description: t('cart.description') };
}

const MyCartPage = () => {
  return <MyCartComponent />;
};

export default MyCartPage;
