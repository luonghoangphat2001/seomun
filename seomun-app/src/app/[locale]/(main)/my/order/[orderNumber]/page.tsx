import MyOrderDetailComponent from '@/components/ui/my/order/detail';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('my_order.title'), description: t('my_order.description') };
}

const MyOrderDetailPage = () => {
  return <MyOrderDetailComponent />;
};

export default MyOrderDetailPage;
