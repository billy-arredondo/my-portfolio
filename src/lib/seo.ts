import type { Lang } from '@/i18n/ui';
import { localizedPath } from '@/i18n/utils';

const localeMap: Record<Lang, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
};

const hreflangMap: Record<Lang, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt',
};

export interface HreflangEntry {
  lang: string;
  url: string;
}

export function buildHreflang(
  site: string,
  currentPath: string,
  currentLang: Lang,
  availableLangs: Lang[] = ['en', 'es', 'pt']
): HreflangEntry[] {
  const strippedPath =
    currentLang === 'en'
      ? currentPath
      : currentPath.replace(new RegExp(`^/${currentLang}`), '');

  return [
    ...availableLangs.map((lang) => ({
      lang: hreflangMap[lang],
      url: `${site}${localizedPath(lang, strippedPath)}`,
    })),
    { lang: 'x-default', url: `${site}${strippedPath || '/'}` },
  ];
}

export function buildCanonical(site: string, path: string): string {
  return `${site}${path}`;
}

export function getOgLocale(lang: Lang): string {
  return localeMap[lang];
}

export function buildPersonSchema(
  name: string,
  jobTitle: string,
  siteUrl: string,
  links: string[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    url: siteUrl,
    sameAs: links,
  };
}

export function buildSoftwareApplicationSchema(
  name: string,
  description: string,
  url: string,
  applicationCategory = 'WebApplication'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
  };
}
