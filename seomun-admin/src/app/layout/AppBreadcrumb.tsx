import { Link, useMatches, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { navConfig } from '@/app/navigation/nav-config';
import { filterNavByPermission, filterNavByRole, findNavMatch } from '@/app/navigation/nav-filter';
import { isBreadcrumbResolved, resolveBreadcrumb, type BreadcrumbKey } from '@/app/router/breadcrumbs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAllowedMenuKeys } from '@/features/permissions';
import type { UserRole } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';

type RouteBreadcrumbItem = {
  label: string;
  to: string;
  key?: BreadcrumbKey;
};

type BreadcrumbItemData = {
  label: string;
  to?: string;
  key?: BreadcrumbKey;
};

export function AppBreadcrumb() {
  const { t } = useTranslation('nav');
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const routeItems = useMatches({
    select: (matches) =>
      matches
        .map((match): RouteBreadcrumbItem | null => {
          const breadcrumb = resolveBreadcrumb(match);

          if (!breadcrumb) {
            return null;
          }

          const label = isBreadcrumbResolved(breadcrumb) ? t(breadcrumb.key, breadcrumb.params) : breadcrumb;

          return {
            label,
            to: match.pathname,
            key: isBreadcrumbResolved(breadcrumb) ? breadcrumb.key : undefined,
          };
        })
        .filter((item): item is RouteBreadcrumbItem => item !== null),
  });

  const role = useAuthStore((state) => state.user?.role);
  const { allowedKeys } = useAllowedMenuKeys();
  const visibleSections = filterNavByPermission(filterNavByRole(navConfig, role as UserRole), allowedKeys);
  const match = findNavMatch(visibleSections, pathname);
  const firstBreadcrumb = routeItems[0];
  const routeParentIsNavGroup = visibleSections.some((item) => item.type === 'group' && item.labelKey === firstBreadcrumb?.key);
  const breadcrumbItems: BreadcrumbItemData[] =
    match?.group && routeItems.length > 0 && firstBreadcrumb?.key !== match.group.labelKey
      ? [{ label: t(match.group.labelKey) }, ...(routeParentIsNavGroup ? routeItems.slice(1) : routeItems)]
      : routeItems;

  if (breadcrumbItems.length > 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList className='caption-12 gap-2'>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const itemKey = `${item.to ?? 'group'}-${item.label}`;

            return [
              <BreadcrumbItem key={itemKey}>
                {isLast || !item.to ? (
                  <BreadcrumbPage className='caption-12'>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className='caption-12'>
                    <Link to={item.to}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>,
              !isLast ? <BreadcrumbSeparator key={`${itemKey}-separator`} className='mx-0.5' /> : null,
            ];
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <div className='caption-12 text-muted-foreground flex flex-wrap items-center gap-2'>
      {match ? (
        match.group ? (
          <>
            <span>{t(match.group.labelKey)}</span>
            <span>/</span>
            <span className='text-foreground'>{t(match.item.labelKey)}</span>
          </>
        ) : (
          <span className='text-foreground'>{t(match.item.labelKey)}</span>
        )
      ) : (
        <>
          <span>/</span>
          <span className='text-foreground'>{t('overview')}</span>
        </>
      )}
    </div>
  );
}
