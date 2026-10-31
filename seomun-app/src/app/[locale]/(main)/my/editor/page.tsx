import MyEditorComponent from '@/components/ui/my/editor';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('my_editor.title'), description: t('my_editor.description') };
}

const MyEditorPage = () => {
  return <MyEditorComponent />;
};

export default MyEditorPage;
