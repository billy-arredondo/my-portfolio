import { ui, defaultLang, type Lang, type UIKey } from './ui';

function getBase(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

export function getLangFromUrl(url: URL): Lang {
  const base = getBase();
  const pathname = base ? url.pathname.slice(base.length) : url.pathname;
  const [, first] = pathname.split('/');
  if (first in ui) return first as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return (ui[lang][key] ?? ui[defaultLang][key]) as string;
  };
}

export function localizedPath(lang: Lang, path: string): string {
  const base = getBase();
  const clean = path.replace(/^\//, '');
  if (lang === defaultLang) return `${base}/${clean}`;
  return `${base}/${lang}/${clean}`;
}

export function getAlternatePaths(
  currentPath: string,
  currentLang: Lang
): Record<Lang, string> {
  const langs: Lang[] = ['en', 'es'];
  const base = getBase();
  const pathWithoutBase = base && currentPath.startsWith(base)
    ? currentPath.slice(base.length) || '/'
    : currentPath;
  const strippedPath = currentLang === defaultLang
    ? pathWithoutBase
    : pathWithoutBase.replace(new RegExp(`^/${currentLang}`), '');

  return Object.fromEntries(
    langs.map(lang => [lang, localizedPath(lang, strippedPath)])
  ) as Record<Lang, string>;
}
