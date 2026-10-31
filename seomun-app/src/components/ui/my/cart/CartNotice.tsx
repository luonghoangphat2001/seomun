'use client';

import { useTranslations } from 'next-intl';
import NoticeCollapse from '../components/NoticeCollapse';

const CartNotice = () => {
  const t = useTranslations();

  const cartNotes = [t('cart.note_1'), t('cart.note_2'), t('cart.note_3'), t('cart.note_4'), t('cart.note_5')];
  const combinedShippingNotes = [t('cart.note_6'), t('cart.note_7'), t('cart.note_8')];
  const printCombinedShippingNotes = [t('cart.note_9'), t('cart.note_10')];

  return (
    <NoticeCollapse title={t('cart.notice')}>
      <div className='space-y-6'>
        <NoticeList notes={cartNotes} />
        <NoticeSection title={t('cart.combined_shipping_notice')} notes={combinedShippingNotes} />
        <NoticeSection title={t('cart.print_combined_shipping_notice')} notes={printCombinedShippingNotes} />
      </div>
    </NoticeCollapse>
  );
};

const NoticeSection = ({ title, notes }: { title: string; notes: string[] }) => (
  <section className='space-y-3'>
    <p className='title-14'>{title}</p>
    <NoticeList notes={notes} />
  </section>
);

const NoticeList = ({ notes }: { notes: string[] }) => (
  <ul className='space-y-3'>
    {notes.map((note) => (
      <li key={note} className='body-14 flex items-start gap-2 text-gray-700'>
        <span aria-hidden='true'>-</span>
        <span>{note}</span>
      </li>
    ))}
  </ul>
);

export default CartNotice;
