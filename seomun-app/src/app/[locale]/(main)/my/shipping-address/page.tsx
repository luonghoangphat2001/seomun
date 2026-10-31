import MyShippingAddress from '@/components/ui/my/shipping-address';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('shipping_address.title'), description: t('shipping_address.description') };
}

const MyShippingAddressPage = () => {
  return <MyShippingAddress />;
};

export default MyShippingAddressPage;
