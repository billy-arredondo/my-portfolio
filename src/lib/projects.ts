import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n/ui';

export type ProjectEntry = CollectionEntry<'projects'>;

export async function getProjects(lang: Lang): Promise<ProjectEntry[]> {
  const entries = await getCollection('projects', (entry) => {
    const matchesLocale = entry.data.locale === lang;
    const notDraft = import.meta.env.PROD ? !entry.data.draft : true;
    return matchesLocale && notDraft;
  });
  return entries.sort((a, b) => b.data.year - a.data.year);
}

export async function getFeaturedProjects(lang: Lang): Promise<ProjectEntry[]> {
  const all = await getProjects(lang);
  return all.filter((p) => p.data.featured).slice(0, 3);
}

export async function getProjectBySlug(
  lang: Lang,
  slug: string
): Promise<ProjectEntry | undefined> {
  const all = await getProjects(lang);
  return all.find((p) => getProjectSlug(p) === slug);
}

export function getProjectSlug(entry: ProjectEntry): string {
  return entry.id.replace(/^(en|es|pt)\//, '').replace(/\.mdx$/, '');
}

export async function getTranslationsForProject(
  translationKey: string
): Promise<Partial<Record<Lang, ProjectEntry>>> {
  const all = await getCollection('projects');
  const result: Partial<Record<Lang, ProjectEntry>> = {};
  for (const entry of all) {
    if (entry.data.translationKey === translationKey) {
      result[entry.data.locale] = entry;
    }
  }
  return result;
}
