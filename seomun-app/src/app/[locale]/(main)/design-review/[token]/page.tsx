import DesignReview from '@/components/ui/design-review';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return { title: t('design_review.title'), description: t('design_review.description') };
}

const DesignReviewPage = () => {
  return <DesignReview />;
};

export default DesignReviewPage;
