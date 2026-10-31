import { ReworkRequestManagement } from '@/components/ui/my/rework-request';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('rework_request.title'), description: t('rework_request.description') };
}

const ReworkRequestPage = () => {
  return <ReworkRequestManagement />;
};

export default ReworkRequestPage;
