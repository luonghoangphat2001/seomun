import MyRefundAccount from '@/components/ui/my/refund-account';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('refund_account.title'), description: t('refund_account.description') };
}

const MyRefundAccountPage = () => {
  return <MyRefundAccount />;
};

export default MyRefundAccountPage;
