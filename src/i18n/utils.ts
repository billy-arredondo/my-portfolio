import { ui, defaultLang, type Lang, type UIKey } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  if (first in ui) return first as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return (ui[lang][key] ?? ui[defaultLang][key]) as string;
  };
}

export function localizedPath(lang: Lang, path: string): string {
  const clean = path.replace(/^\//, '');
  if (lang === defaultLang) return `/${clean}`;
  return `/${lang}/${clean}`;
}

export function getAlternatePaths(
  currentPath: string,
  currentLang: Lang
): Record<Lang, string> {
  const langs: Lang[] = ['en', 'es', 'pt'];
  const strippedPath = currentLang === defaultLang
    ? currentPath
    : currentPath.replace(new RegExp(`^/${currentLang}`), '');

  return Object.fromEntries(
    langs.map(lang => [lang, localizedPath(lang, strippedPath)])
  ) as Record<Lang, string>;
}
