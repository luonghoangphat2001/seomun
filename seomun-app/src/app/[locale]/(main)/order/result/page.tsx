import OrderResultComponent from '@/components/ui/order/result';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('order_result.title'), description: t('order_result.description') };
}

const OrderResultPage = () => {
  return (
    <div>
      <OrderResultComponent />
    </div>
  );
};

export default OrderResultPage;
