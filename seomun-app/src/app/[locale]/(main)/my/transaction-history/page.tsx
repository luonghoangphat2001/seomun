import MyTransactionHistory from '@/components/ui/my/transaction-history';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('transaction_history.title'), description: t('transaction_history.description') };
}

const MyTransactionHistoryPage = () => {
  return <MyTransactionHistory />;
};

export default MyTransactionHistoryPage;
