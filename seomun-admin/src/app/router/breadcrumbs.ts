import type { AnyRouteMatch } from '@tanstack/react-router';
import type { ParseKeys } from 'i18next';
export type BreadcrumbKey = ParseKeys<'nav'>;

export type BreadcrumbResolved = {
  key: BreadcrumbKey;
  params?: Record<string, unknown>;
};

export type BreadcrumbValue = string | ((match: AnyRouteMatch) => BreadcrumbResolved | string | null);

export function breadcrumbKey(key: BreadcrumbKey, params?: Record<string, unknown>): BreadcrumbResolved {
  return {
    key,
    params,
  };
}

export function isBreadcrumbResolved(value: string | BreadcrumbResolved): value is BreadcrumbResolved {
  return typeof value !== 'string' && typeof value.key === 'string';
}

export function resolveBreadcrumb(match: AnyRouteMatch): string | BreadcrumbResolved | null {
  const value = match.staticData?.breadcrumb;

  if (!value) {
    return null;
  }

  return typeof value === 'function' ? value(match) : value;
}
