import MyDepositStatus from '@/components/ui/my/deposit-status';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('deposit_status.title'), description: t('deposit_status.description') };
}

const MyDepositStatusPage = () => {
  return <MyDepositStatus />;
};

export default MyDepositStatusPage;
