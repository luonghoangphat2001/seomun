import MyReview from '@/components/ui/my/review';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('review.title'), description: t('review.description') };
}

const MyReviewPage = () => {
  return <MyReview />;
};

export default MyReviewPage;
