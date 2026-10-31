import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { en, ko } from './translations';

export const LanguageOption = {
  KO: 'ko',
  EN: 'en',
} as const;

export type LanguageOption = (typeof LanguageOption)[keyof typeof LanguageOption];

type LocaleSchema = typeof en;
type LocaleResources = { translation: LocaleSchema } & LocaleSchema;

function createLocaleResources(locale: LocaleSchema): LocaleResources {
  return {
    translation: locale,
    ...locale,
  };
}

export const resources = {
  en: createLocaleResources(en),
  ko: createLocaleResources(ko),
} as const;

const namespaces = Object.keys(en) as Array<keyof LocaleSchema>;

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    debug: true,
    defaultNS: 'translation',
    ns: ['translation', ...namespaces],
    lng: localStorage.getItem('lang') || LanguageOption.KO,
    fallbackLng: LanguageOption.KO,
    supportedLngs: [LanguageOption.EN, LanguageOption.KO],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
