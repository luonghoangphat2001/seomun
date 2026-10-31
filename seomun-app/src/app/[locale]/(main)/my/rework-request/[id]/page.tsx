import { ReworkRequestDetail } from '@/components/ui/my/rework-request/ReworkRequestDetail';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('rework_request.title'), description: t('rework_request.description') };
}

const ReworkRequestDetailPage = () => {
  return <ReworkRequestDetail />;
};

export default ReworkRequestDetailPage;
