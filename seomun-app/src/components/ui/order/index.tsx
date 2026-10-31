'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import OrdererInfoSection from './OrdererSection';
import PaymentSection from './PaymentSection';
import ShippingSection from './ShippingSection';
import ProductSection from './ProductSection';
import PointSection from './PointSection';
import CouponSection from './CouponSection';
import FinalConfirmSection from './FinalConfirmSection';
import { useTranslations } from 'next-intl';
import { orderCheckOutDefaultValues, OrderCheckOutFormValues, orderCheckOutSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import SenderSection from './SenderSection';
import { LOCAL_STORAGE_KEYS, LocalStorage } from '@/lib/storages';
import { ProductSelectedOptions } from '@/types';
import { useAuthStore } from '@/hooks';
import { splitPhonePattern } from '@/lib/utils';
import { useOrderQuotationQuery, useProductBySlugQuery } from '@/apis/product/product.query';
import { useSearchParams } from 'next/navigation';
import { useShippingAddressListQuery } from '@/apis/my/shipping-address/shipping-address.query';
import { useCartListQuery, useCartQuoteQuery } from '@/apis/cart/cart.query';

const OrderComponent = () => {
  const t = useTranslations();
  const [selectedOptions, setSelectedOptions] = useState<ProductSelectedOptions | null>(null);
  const [cartItemIds, setCartItemIds] = useState<number[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<number>();
  const [couponEligibleAmount, setCouponEligibleAmount] = useState(0);
  const { profile } = useAuthStore();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('productSlug') || undefined;
  const productQuoteRequest = productSlug ? selectedOptions?.quoteRequest : undefined;

  //hook form
  const form = useForm<OrderCheckOutFormValues>({
    mode: 'all',
    defaultValues: orderCheckOutDefaultValues,
    resolver: zodResolver(orderCheckOutSchema(t)),
  });
  const { setValue } = form;
  const shippingMethod = useWatch({ control: form.control, name: 'shippingInfo.shippingMethod' });
  const cartQuoteRequest = useMemo(
    () =>
      !productSlug && cartItemIds.length > 0
        ? {
            item_ids: cartItemIds,
            shipping_method: shippingMethod,
            ...(selectedCouponId ? { user_coupon_id: selectedCouponId } : {}),
          }
        : undefined,
    [cartItemIds, productSlug, selectedCouponId, shippingMethod],
  );
  const orderQuoteRequest = useMemo(
    () =>
      productQuoteRequest
        ? {
            ...productQuoteRequest,
            shipping_method: shippingMethod,
            ...(selectedCouponId ? { user_coupon_id: selectedCouponId } : {}),
          }
        : undefined,
    [productQuoteRequest, selectedCouponId, shippingMethod],
  );

  //api quotation
  const { data: dataCartQuote } = useCartQuoteQuery(cartQuoteRequest);
  const { data: dataOrderQuotation } = useOrderQuotationQuery(orderQuoteRequest);
  const quotedCouponEligibleAmount =
    (dataCartQuote?.checkout_summary.amount_supply ?? dataOrderQuotation?.quote.summary.subtotal ?? 0) +
    (dataCartQuote?.checkout_summary.amount_vat ?? dataOrderQuotation?.quote.summary.tax ?? 0);

  //api product detail
  const { data: productDetail } = useProductBySlugQuery(productSlug);

  //api cart list
  const { data: dataCart } = useCartListQuery(undefined, { enabled: !productSlug && cartItemIds.length > 0 });
  const cartItems = useMemo(() => {
    const items = dataCart?.items || [];

    return cartItemIds.flatMap((id) => {
      const item = items.find((cartItem) => cartItem.id === id);

      return item ? [item] : [];
    });
  }, [cartItemIds, dataCart]);

  //api shipping address
  const { data: dataShippingAddress } = useShippingAddressListQuery({ per_page: 100 });

  useEffect(() => {
    if (productSlug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedOptions(LocalStorage.get<ProductSelectedOptions>(LOCAL_STORAGE_KEYS.PRODUCT_SELECTED_OPTIONS));
      setCartItemIds([]);
      setSelectedCouponId(undefined);
      setCouponEligibleAmount(0);
      return;
    }

    setSelectedOptions(null);
    setCartItemIds(LocalStorage.get<number[]>(LOCAL_STORAGE_KEYS.CART_SELECTED_ITEM_IDS) || []);
    setSelectedCouponId(undefined);
    setCouponEligibleAmount(0);
  }, [productSlug]);

  useEffect(() => {
    if (!selectedCouponId && quotedCouponEligibleAmount > 0) {
      // Keep the coupon eligibility amount based on the pre-coupon quote while a coupon is selected.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCouponEligibleAmount(quotedCouponEligibleAmount);
    }
  }, [quotedCouponEligibleAmount, selectedCouponId]);

  useEffect(() => {
    if (profile) {
      const phone = splitPhonePattern(profile.profile.mobile);

      setValue('ordererInfo.ordererName', profile.profile.name);
      setValue('ordererInfo.phoneHead', phone?.part1 || '');
      setValue('ordererInfo.phoneBody', phone?.part2 || '');
      setValue('ordererInfo.phoneTail', phone?.part3 || '');
    }
  }, [profile, setValue]);

  useEffect(() => {
    if (!dataShippingAddress) return;

    const defaultShippingAddress = dataShippingAddress.list.find((address) => address.is_default);
    const profileData = profile?.profile;

    if (!defaultShippingAddress && !profileData) return;

    const phone = splitPhonePattern(defaultShippingAddress ? defaultShippingAddress.phone : (profileData?.mobile ?? ''));

    setValue('shippingInfo.ordererName', defaultShippingAddress ? defaultShippingAddress.recipient : (profileData?.name ?? ''));
    setValue('shippingInfo.phoneHead', phone?.part1 || '');
    setValue('shippingInfo.phoneBody', phone?.part2 || '');
    setValue('shippingInfo.phoneTail', phone?.part3 || '');
    setValue('shippingInfo.postCode', defaultShippingAddress ? defaultShippingAddress.postcode : (profileData?.postcode ?? ''));
    setValue('shippingInfo.address', defaultShippingAddress ? defaultShippingAddress.address : (profileData?.address ?? ''));
    setValue(
      'shippingInfo.addressDetail',
      defaultShippingAddress ? defaultShippingAddress.detailed_address || '' : (profileData?.detailed_address ?? ''),
    );
    setValue('shippingInfo.message', defaultShippingAddress?.delivery_message_preset || '');
    setValue('shippingInfo.detailNote', defaultShippingAddress?.delivery_message_custom || '');
  }, [dataShippingAddress, profile, setValue]);

  return (
    <main>
      <h2 className='title-24'>{t('order.fill_out_form')}</h2>
      <FormProvider {...form}>
        <form className='mt-4 flex flex-col gap-4 min-[1200px]:gap-30! md:mt-12 md:flex-row md:flex-wrap md:gap-12'>
          {/* LEFT */}
          <section className='flex flex-1 flex-col gap-4 md:min-w-122.5 md:gap-17'>
            <div className='mobile-seperator'></div>
            <OrdererInfoSection />
            <div className='mobile-seperator'></div>
            <ShippingSection />
            <SenderSection />
            <div className='mobile-seperator'></div>
            <PaymentSection />
          </section>

          {/* RIGHT */}
          <section className='flex w-full min-w-50 shrink flex-col gap-4 min-[977px]:basis-90! min-[1200px]:basis-100! md:gap-12'>
            <div className='mobile-seperator'></div>
            <ProductSection
              productDetail={productDetail}
              selectedOptions={selectedOptions}
              dataOrderQuotation={dataOrderQuotation}
              dataCartQuote={dataCartQuote}
              cartItems={cartItems}
            />
            <div className='mobile-seperator'></div>
            <PointSection />
            <CouponSection
              amount={couponEligibleAmount}
              selectedCouponId={selectedCouponId}
              onSelectCoupon={setSelectedCouponId}
            />
            <FinalConfirmSection
              dataOrderQuotation={dataOrderQuotation}
              dataCartQuote={dataCartQuote}
              cartItemIds={cartItemIds}
              selectedOptions={selectedOptions}
              selectedCouponId={selectedCouponId}
            />
          </section>
        </form>
      </FormProvider>
    </main>
  );
};

export default OrderComponent;
