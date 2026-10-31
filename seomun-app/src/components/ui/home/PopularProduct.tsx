import { CategoryApi } from '@/apis/category/category.api';
import { ProductApi } from '@/apis/product/product.api';
import { PopularCarouselSegment } from './PopularCarouselSegment';
import { PopularGridSegment } from './PopularGridSegment';

export const PopularProduct = async () => {
  const [popularProductsRes, categoriesRes] = await Promise.all([
    ProductApi.getPopularProducts({ limit: 10 }).catch(() => null),
    CategoryApi.getList().catch(() => null),
  ]);

  const popularProducts = popularProductsRes?.data?.products || [];
  const categories = categoriesRes?.data?.categories || [];

  return (
    <section className='global-padding space-y-8 pt-6 pb-12 sm:space-y-22 sm:pt-15 sm:pb-30'>
      <PopularCarouselSegment products={popularProducts} />
      <PopularGridSegment categories={categories} />
    </section>
  );
};
