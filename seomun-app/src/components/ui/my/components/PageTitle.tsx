'use client';

import { useRouter } from '@/i18n/navigation';
import { ChevronLeft2 } from '@/icons';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type PageTitleProps = {
  title: ReactNode;
  returnRoute?: string;
  extra?: ReactNode;
  containerClassName?: string;
  titleContainerClassName?: string;
  titleClassName?: string;
  iconClassName?: string;
};

const PageTitle = ({
  title,
  returnRoute,
  extra,
  containerClassName,
  titleContainerClassName,
  titleClassName,
  iconClassName,
}: PageTitleProps) => {
  const router = useRouter();

  const onReturn = () => {
    if (!returnRoute) return;
    router.push(returnRoute);
  };

  return (
    <header className={cn('flex flex-wrap items-center justify-between gap-1', containerClassName)}>
      <div
        className={cn('flex items-center gap-3', returnRoute && 'cursor-pointer hover:opacity-70', titleContainerClassName)}
        onClick={onReturn}>
        {returnRoute && <ChevronLeft2 className={cn('size-10', iconClassName)} />}
        <div className={cn('title-24', titleClassName)}>{title}</div>
      </div>
      {extra}
    </header>
  );
};

export default PageTitle;
