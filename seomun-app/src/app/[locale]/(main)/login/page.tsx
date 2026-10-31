import LoginPage from '@/components/ui/login';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('login.title'), description: t('login.description') };
}

export default function Page() {
  return <LoginPage />;
}
