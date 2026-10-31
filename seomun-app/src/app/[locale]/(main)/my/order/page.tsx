import MyOrderComponent from '@/components/ui/my/order';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('my_order.title'), description: t('my_order.description') };
}

const MyOrderPage = () => {
  return <MyOrderComponent />;
};

export default MyOrderPage;
