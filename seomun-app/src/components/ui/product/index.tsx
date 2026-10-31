'use client';
import { Product } from '@/apis/product/product.response';
import { ProductInfoLeft } from './ProductInfoLeft';
import { ProductOrderForm } from './ProductOrderForm';

export interface ProductDetailProps {
  product: Product;
}

export const ProductDetail = ({ product }: ProductDetailProps) => {
  console.log('product', product);

  return (
    <section className='md:global-padding flex flex-col gap-3 bg-gray-50 md:gap-12 md:bg-white lg:flex-row'>
      <ProductInfoLeft product={product} />
      <div className='flex gap-3 2xl:gap-12'>
        <ProductOrderForm product={product} />
      </div>
    </section>
  );
};
