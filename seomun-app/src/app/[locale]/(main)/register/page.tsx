import RegisterPage from '@/components/ui/register';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('register.title'), description: t('register.description') };
}

export default function Page() {
  return <RegisterPage />;
}
