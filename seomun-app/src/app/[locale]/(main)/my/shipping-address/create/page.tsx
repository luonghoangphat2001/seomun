import MyShippingAddressUpsert from '@/components/ui/my/shipping-address/upsert';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('shipping_address.title'), description: t('shipping_address.description') };
}

const MyShippingAddressCreatePage = () => {
  return <MyShippingAddressUpsert />;
};

export default MyShippingAddressCreatePage;
