'use client';

import { useTranslations } from 'next-intl';
import NoticeCollapse from '../components/NoticeCollapse';

const OptionGuide = () => {
  const t = useTranslations();

  const notes = [
    t('my.saved_option_note_1'),
    t('my.saved_option_note_2'),
    t('my.saved_option_note_3'),
    t('my.saved_option_note_4'),
    t('my.saved_option_note_5'),
    t('my.saved_option_note_6'),
    t('my.saved_option_note_7'),
  ];

  return <NoticeCollapse title={t('product.user_guide')} notes={notes} />;
};

export default OptionGuide;
