import { RefundRequestDetail } from '@/components/ui/my/refund-request/RefundRequestDetail';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('refund_request.title'), description: t('refund_request.description') };
}

const RefundRequestDetailPage = () => {
  return <RefundRequestDetail />;
};

export default RefundRequestDetailPage;
