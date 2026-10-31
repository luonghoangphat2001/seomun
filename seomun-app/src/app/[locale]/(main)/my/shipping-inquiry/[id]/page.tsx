import { ShippingInquiryDetail } from '@/components/ui/my/shipping-inquiry/ShippingInquiryDetail';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('shipping_inquiry.title'), description: t('shipping_inquiry.description') };
}

const ShippingInquiryDetailPage = () => {
  return <ShippingInquiryDetail />;
};

export default ShippingInquiryDetailPage;
