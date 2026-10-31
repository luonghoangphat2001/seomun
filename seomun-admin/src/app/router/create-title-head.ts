import i18next from '@/app/i18n';
import { branding } from '@/config/branding';

export const buildTitle = (key?: string, defaultPageTitle?: string, interpolation?: Record<string, unknown>) => {
  if (!key) {
    return branding.appName;
  }

  const pageTitle = i18next.t(key, { defaultValue: defaultPageTitle || '', ...interpolation });

  if (!pageTitle || pageTitle === branding.appName) {
    return branding.appName;
  }

  return `${pageTitle} | ${branding.appName}`;
};

export const createTitleHead = (key?: string, defaultPageTitle?: string) => () => ({
  meta: [{ title: buildTitle(key, defaultPageTitle) }],
});
