import { PaymentInquiryDetail } from '@/components/ui/my/payment-inquiry/PaymentInquiryDetail';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('payment_inquiry.title'), description: t('payment_inquiry.description') };
}

const PaymentInquiryDetailPage = () => {
  return <PaymentInquiryDetail />;
};

export default PaymentInquiryDetailPage;
