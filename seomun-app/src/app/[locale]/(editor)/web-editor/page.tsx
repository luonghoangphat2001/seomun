import { WebEditorCore } from '@/components/ui/web-editor';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('web_editor.title'), description: t('web_editor.description') };
}

export default async function Page() {
  return <WebEditorCore />;
}
