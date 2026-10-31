import MyLoadSavedOptions from '@/components/ui/my/load-saved-options';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('load_saved_options.title'), description: t('load_saved_options.description') };
}

const MyLoadSavedOptionsPage = () => {
  return <MyLoadSavedOptions />;
};

export default MyLoadSavedOptionsPage;
