import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case only'),
    excerpt: z.string().max(200),
    tags: z.array(z.string()).default([]),
    hero_image: z.string().optional(),
    draft: z.boolean().default(false),
    author: z.string().default('ARCADIA'),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    category: z.enum(['general', 'hardware', 'usage', 'shipping', 'support']),
    order: z.number().int().default(100),
  }),
});

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { blog, faq, docs };
