import MyWorker from '@/components/ui/my/worker';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('worker.title'), description: t('worker.description') };
}

const MyWorkerPage = () => {
  return <MyWorker />;
};

export default MyWorkerPage;
