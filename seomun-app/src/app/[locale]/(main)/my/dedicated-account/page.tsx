import MyDedicatedAccount from '@/components/ui/my/dedicated-account';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('dedicated_account.title'), description: t('dedicated_account.description') };
}

const MyDedicatedAccountPage = () => {
  return <MyDedicatedAccount />;
};

export default MyDedicatedAccountPage;
