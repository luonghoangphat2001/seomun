import OrderComponent from '@/components/ui/order';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('order.title'), description: t('order.description') };
}

const OrderPage = () => {
  return (
    <div className='global-padding mt-6 mb-12 md:mb-37.5'>
      <OrderComponent />
    </div>
  );
};

export default OrderPage;
