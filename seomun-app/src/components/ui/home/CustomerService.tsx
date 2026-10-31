import { SafeImage } from '@/components/common';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export const CustomerService = () => {
  const t = useTranslations('home');

  const categories = [
    {
      title: t('announcement'),
      url: '',
    },
    {
      title: t('faq'),
      url: '',
    },
    {
      title: t('product_inquiry'),
      url: '',
    },
    {
      title: t('quote'),
      url: '',
    },
    {
      title: t('shipping_delivery'),
      url: '',
    },
  ];

  return (
    <section className='border-border-soft hidden border-t border-solid py-10 sm:block'>
      <div className='global-padding flex flex-wrap items-start justify-between gap-y-8'>
        <div className='flex flex-col gap-6 lg:w-[310px]'>
          <h3 className='title-24 text-text-main'>{t('customer_service')}</h3>
          <div className='space-y-2'>
            <p className='title-40 text-text-brand'>1600-5499</p>
            <div className='body-16 text-text-secondary'>
              <p>
                <span className='title-16'>{t('weekday')}</span>: 00:00 ~ 00:00
              </p>
              <p>
                <span className='title-16'>{t('lunchtime')}</span>: <span className='text-text-brand'>00:00 ~ 00:00</span>
              </p>
              <p>{t('closed_on_weekend')}</p>
            </div>
          </div>
        </div>

        <div className='body-16 flex flex-col gap-3 xl:hidden'>
          <span className='title-16 font-semibold'>{t('customer_service')}</span>
          <div className='flex flex-col gap-2'>
            {categories.map((item) => (
              <Link
                key={`footer-nav-${item.title}`}
                href={item.url}
                className='hover:text-text-brand transition-all duration-300'>
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className='flex gap-2 max-md:hidden'>
          <SafeImage
            src='/images/customer_footer_1.png'
            alt='customer_footer_1'
            width={259}
            height={188}
            className='w-[259px] object-cover'
          />
          <div className='w-[259px] space-y-2 bg-gray-100 p-3'>
            <p className='title-14'>{t('customer_footer_title')}</p>
            <span className='body-14 tracking-[-0.25px]'>{t('customer_footer_content')}</span>
          </div>
          <SafeImage
            src='/images/customer_footer_2.png'
            alt='customer_footer_2'
            width={259}
            height={188}
            className='w-[259px] object-cover'
          />
        </div>

        <div className='body-16 flex hidden flex-col gap-3 xl:flex'>
          <span className='title-16 font-semibold'>{t('customer_service')}</span>
          <div className='flex flex-col gap-2'>
            {categories.map((item) => (
              <Link
                key={`footer-nav-${item.title}`}
                href={item.url}
                className='hover:text-text-brand transition-all duration-300'>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
