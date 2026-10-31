import { DirectDeliveryRequestUpsert } from '@/components/ui/my/direct-delivery-request/DirectDeliveryRequestUpsert';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('direct_delivery_request.title'), description: t('direct_delivery_request.description') };
}

const DirectDeliveryCreatePage = () => {
  return <DirectDeliveryRequestUpsert />;
};

export default DirectDeliveryCreatePage;
