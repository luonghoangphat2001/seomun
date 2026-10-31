'use client';

import { Link } from '@/i18n/navigation';
import { useGetAllPaperQuery } from '@/apis/product/product.query';
import { ModalHandle } from '@/components/common';
import { CalculateSpineModal } from '@/components/ui/product/CalculateSpineModal';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import SNSFooter from './SNSFooter';

type FooterNavItem = { label: string; route: string } | { label: string; action: 'content_not_ready' | 'calculate_spine' };

export const Footer = ({ className }: { className?: string }) => {
  const t = useTranslations('footer');
  const tAuth = useTranslations('auth');
  const calculateSpineModalRef = useRef<ModalHandle>(null);
  const { data: allPapers } = useGetAllPaperQuery();

  const utilsRoutes: FooterNavItem[] = [
    { label: t('privacy_policy'), route: ROUTES.PRIVACY_POLICY },
    { label: t('terms_of_use'), route: ROUTES.TERM_OF_SERVICE },
    { label: t('directions'), action: 'content_not_ready' },
    { label: t('rework_protocol'), action: 'content_not_ready' },
    { label: t('announcement'), route: ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT },
    { label: t('faq'), route: ROUTES.CUSTOMER_SERVICE.FAQ },
    { label: t('book_spine_calculator'), action: 'calculate_spine' },
    { label: t('quote_consultation'), action: 'content_not_ready' },
  ];

  return (
    <footer className={cn('text-text-primary bg-border-light py-8 md:py-10', className)}>
      <div className='global-padding'>
        <div className='flex flex-col gap-5 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between'>
          <nav aria-label={t('footer_navigation')}>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-2 md:gap-x-4'>
              {utilsRoutes.map((item, index) => (
                <div key={item.label} className='flex items-center gap-x-3 md:gap-x-4'>
                  {'route' in item ? (
                    <Link
                      href={item.route}
                      className='caption-12 text-text-primary hover:text-primary focus-visible:text-primary md:body-14 py-2 font-medium transition-colors md:font-medium'>
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type='button'
                      onClick={() => {
                        if (item.action === 'calculate_spine') {
                          calculateSpineModalRef.current?.open();
                          return;
                        }

                        window.alert(t('content_not_ready'));
                      }}
                      className='caption-12 text-text-primary hover:text-primary focus-visible:text-primary md:body-14 cursor-pointer py-2 font-medium transition-colors md:font-medium'>
                      {item.label}
                    </button>
                  )}
                  {index !== utilsRoutes.length - 1 && <span className='text-text-third text-xs'>|</span>}
                </div>
              ))}
            </div>
          </nav>
          <div className='hidden md:block'>
            <SNSFooter />
          </div>
        </div>

        <div className='grid gap-8 py-8 md:grid-cols-[0.85fr_1.35fr_1fr] md:gap-12 md:py-10'>
          <section aria-labelledby='footer-customer-service' className='space-y-3'>
            <h2 id='footer-customer-service' className='title-18 text-text-primary'>
              {t('customer_service')}
            </h2>
            <a href='tel:16005499' className='title-24 text-text-brand md:title-32 transition-opacity hover:opacity-80'>
              1600-5499
            </a>
            <div className='body-14 text-text-primary space-y-1'>
              <p>
                <span className='text-gray-600'>{t('weekday')}</span>: 09:00 ~ 18:00
              </p>
              <p>
                <span className='text-gray-600'>{t('lunchtime')}</span>: 12:00 ~ 13:00
              </p>
              <p className='text-text-secondary'>{t('closed_time')}</p>
            </div>
          </section>

          <section aria-labelledby='footer-company-information' className='space-y-3'>
            <h2 id='footer-company-information' className='title-18 text-text-primary'>
              {t('company_information')}
            </h2>
            <div className='body-14 text-text-primary space-y-1 break-keep'>
              <p>
                <span className='text-gray-600'>{t('company_name')}</span>: {t('company')}
              </p>
              <p>
                <span className='text-gray-600'>{t('representative')}</span>: {t('ceo')}
              </p>
              <p>
                <span className='text-gray-600'>{t('business_number')}</span>: 483-11-00481
              </p>
              <p>
                <span className='text-gray-600'>{t('mail_order')}</span>: 제2022-대구달서-0403호
              </p>
              <p>
                <span className='text-gray-600'>{t('address')}</span>: {t('address_info')}
              </p>
              <p>
                <span className='text-gray-600'>{tAuth('email')}</span>: print-ly@naver.com{' '}
                <span className='text-gray-600'>({t('note_tax_email')})</span>
              </p>
            </div>
          </section>

          <section aria-labelledby='footer-payment-account' className='space-y-3'>
            <h2 id='footer-payment-account' className='title-18 text-text-primary'>
              {t('payment_account')}
            </h2>
            <div className='body-14 text-text-primary space-y-1'>
              <p>
                <span className='text-gray-600'>{t('bank')}</span>: {t('bank_name')}
              </p>
              <p>
                <span className='text-gray-600'>{t('account_number')}</span>: 1005-904-975306
              </p>
              <p>
                <span className='text-gray-600'>{t('account_holder')}</span>: {t('account_holder_name')}
              </p>
            </div>
          </section>
        </div>

        <div className='flex flex-col gap-5 border-t border-gray-200 pt-5 md:flex-row md:items-center md:justify-between'>
          <p className='caption-12 text-text-secondary font-normal uppercase'>Copyright(c) Seomun All rights reserved.</p>
          <div className='block md:hidden'>
            <SNSFooter />
          </div>
        </div>

        <CalculateSpineModal
          ref={calculateSpineModalRef}
          papers={allPapers?.map((paper) => ({ id: paper.id, name: paper.name })) || []}
        />
      </div>
    </footer>
  );
};
