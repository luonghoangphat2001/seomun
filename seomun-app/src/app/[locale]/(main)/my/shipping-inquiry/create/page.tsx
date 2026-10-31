import { ShippingInquiryCreate } from '@/components/ui/my/shipping-inquiry/ShippingInquiryCreate';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('shipping_inquiry.title'), description: t('shipping_inquiry.description') };
}

const ShippingInquiryCreatePage = () => {
  return <ShippingInquiryCreate />;
};

export default ShippingInquiryCreatePage;
