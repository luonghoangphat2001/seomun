import MyCoupon from '@/components/ui/my/coupon';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('coupon.title'), description: t('coupon.description') };
}

const MyCouponPage = () => {
  return <MyCoupon />;
};

export default MyCouponPage;
