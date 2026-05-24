import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(200),
      locale: z.enum(['en', 'es', 'pt']),
      translationKey: z.string(),
      status: z.enum(['in-progress', 'completed', 'archived']),
      featured: z.boolean().default(false),
      stack: z.array(z.string()).min(1),
      role: z.string(),
      year: z.number().int().min(2010).max(2100),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      metrics: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      updatedDate: z.coerce.date().optional(),
    }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      locale: z.enum(['en', 'es', 'pt']),
      translationKey: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, posts };
