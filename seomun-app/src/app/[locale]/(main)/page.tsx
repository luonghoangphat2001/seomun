import { BannerApi } from '@/apis/banner/banner.api';
import { Banner, BannerSkeleton, HomeMembership, PopularProduct, PopupModal } from '@/components/ui/home';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('home.title'), description: t('home.description') };
}

export default async function Page() {
  const bannerResp = await BannerApi.getList('homepage').catch(() => null);
  const banners = bannerResp?.data?.banners || [];

  return (
    <>
      <Suspense fallback={<BannerSkeleton />}>
        <Banner banners={banners} />
      </Suspense>
      <PopupModal />
      {/* <HomeMembership /> */}
      {/* <MobileNavigation /> */}
      <PopularProduct />
      {/* <CustomerService /> */}
    </>
  );
}
