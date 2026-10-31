import MyWorkerUpsert from '@/components/ui/my/worker/upsert';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('worker.title'), description: t('worker.description') };
}

const MyWorkerDetailPage = () => {
  return <MyWorkerUpsert />;
};

export default MyWorkerDetailPage;
