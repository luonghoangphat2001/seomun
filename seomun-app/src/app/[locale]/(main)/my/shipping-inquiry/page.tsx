import { ShippingInquiryManagement } from '@/components/ui/my/shipping-inquiry';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('shipping_inquiry.title'), description: t('shipping_inquiry.description') };
}

const ShippingInquiryPage = () => {
  return <ShippingInquiryManagement />;
};

export default ShippingInquiryPage;
