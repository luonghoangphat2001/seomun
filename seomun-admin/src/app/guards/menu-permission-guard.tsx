import { useRouterState } from '@tanstack/react-router';
import { ShieldOff } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { getMenuKeyForPathname } from '@/app/navigation/nav-filter';
import { PageContainer } from '@/components/shared/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllowedMenuKeys } from '@/features/permissions';

function PageSkeleton() {
  return (
    <PageContainer>
      <div className='space-y-6'>
        <Skeleton className='h-8 w-64' />
        <div className='grid gap-4 md:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className='h-24 w-full' />
          ))}
        </div>
        <Skeleton className='h-96 w-full' />
      </div>
    </PageContainer>
  );
}

function MenuForbiddenScreen() {
  const { t } = useTranslation('page');

  return (
    <PageContainer className='max-w-2xl'>
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
        <div className='bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full'>
          <ShieldOff className='size-7' />
        </div>
        <h1 className='text-xl font-semibold'>{t('system.forbidden.title')}</h1>
        <p className='text-muted-foreground max-w-md text-sm'>{t('system.forbidden.description')}</p>
      </div>
    </PageContainer>
  );
}

export function MenuPermissionGuard({ children }: PropsWithChildren) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { allowedKeys, isLoading } = useAllowedMenuKeys();
  const menuKey = getMenuKeyForPathname(pathname);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (allowedKeys && menuKey && !allowedKeys.has(menuKey)) {
    return <MenuForbiddenScreen />;
  }

  return <>{children}</>;
}
