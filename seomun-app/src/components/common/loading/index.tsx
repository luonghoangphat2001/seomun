'use client';

import { useTranslations } from 'next-intl';

type LoadingProps = {
  displayText?: boolean;
};

const Loading = ({ displayText }: LoadingProps) => {
  const t = useTranslations('');

  return (
    <div className='my-4 flex h-full items-center justify-center gap-2'>
      <div className='border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent'></div>
      {displayText && <p className='title-16'>{t('common.loading')}</p>}
    </div>
  );
};

export default Loading;
