import { z } from 'zod';

import type { Block, Rich } from './types';

/**
 * Validation du contenu éditable depuis le back-office.
 *
 * Les pages restent décrites dans `src/content/pages/*.ts` : c'est cette
 * version, versionnée et rendue au build, qui part dans le HTML statique et
 * donc dans l'index de Google. Un document Firestore ne fait que la surcharger
 * à l'affichage. Ces schémas sont le garde-fou de cette surcharge : un
 * document mal formé est ignoré, et la page du dépôt reprend la main plutôt
 * que de s'afficher à trous.
 */

const richSchema: z.ZodType<Rich> = z.union([
  z.string(),
  z.object({ h3: z.string().min(1) }),
  z.object({ list: z.array(z.string().min(1)) }),
  z.object({ ordered: z.array(z.string().min(1)) }),
]);

const linkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().min(1).max(300),
});

export const blockSchema: z.ZodType<Block> = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('section'),
    id: z.string().trim().max(60).optional(),
    title: z.string().trim().max(200).optional(),
    lead: z.string().trim().max(600).optional(),
    body: z.array(richSchema),
  }),
  z.object({
    type: z.literal('steps'),
    title: z.string().trim().max(200).optional(),
    steps: z.array(
      z.object({
        title: z.string().trim().min(1).max(200),
        text: z.string().trim().max(1200),
      }),
    ),
  }),
  z.object({
    type: z.literal('cards'),
    title: z.string().trim().max(200).optional(),
    lead: z.string().trim().max(600).optional(),
    cards: z.array(
      z.object({
        title: z.string().trim().min(1).max(200),
        text: z.string().trim().max(1200),
        href: z.string().trim().max(300).optional(),
      }),
    ),
  }),
  z.object({
    type: z.literal('faq'),
    title: z.string().trim().max(200).optional(),
    items: z.array(
      z.object({
        q: z.string().trim().min(1).max(300),
        a: z.string().trim().max(2000),
      }),
    ),
  }),
  z.object({
    type: z.literal('callout'),
    tone: z.enum(['info', 'warning']),
    title: z.string().trim().max(200).optional(),
    text: z.string().trim().max(1200),
  }),
  z.object({
    type: z.literal('cta'),
    title: z.string().trim().min(1).max(200),
    text: z.string().trim().max(600).optional(),
    primary: linkSchema,
    secondary: linkSchema.optional(),
  }),
]);

/**
 * Champs d'une page modifiables en ligne. La structure (`slug`, `customRoute`)
 * n'en fait pas partie : changer une URL depuis le back-office casserait les
 * liens entrants sans possibilité de poser la redirection correspondante.
 */
export const pageContentSchema = z.object({
  navLabel: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(200),
  seo: z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(400),
  }),
  hero: z
    .object({
      lead: z.string().trim().max(1200),
      primary: linkSchema.optional(),
      secondary: linkSchema.optional(),
    })
    .nullable()
    .optional(),
  blocks: z.array(blockSchema),
});

export type PageContent = z.infer<typeof pageContentSchema>;

/**
 * Informations d'entreprise (NAP). Le téléphone, l'adresse et l'e-mail sont
 * repris à l'identique dans l'en-tête, le pied de page, la page Contact et les
 * données structurées : les modifier ici les change partout.
 */
export const companySchema = z.object({
  name: z.string().trim().min(1).max(80),
  legalName: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(300),
  owner: z.object({
    name: z.string().trim().min(1).max(120),
    role: z.string().trim().max(160),
  }),
  contact: z.object({
    phone: z.string().trim().max(30),
    phoneE164: z.string().trim().max(20),
    email: z.string().trim().email().max(180),
  }),
  address: z.object({
    street: z.string().trim().max(200),
    postalCode: z.string().trim().max(12),
    city: z.string().trim().max(120),
    country: z.string().trim().max(2),
    region: z.string().trim().max(120),
  }),
  serviceArea: z.array(z.string().trim().min(1).max(80)),
  responseTime: z.string().trim().max(120),
});

export type Company = z.infer<typeof companySchema>;
