import { z } from 'zod';

import type { Block, Panel, Rich } from './types';

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

const alignSchema = z.enum(['left', 'center', 'right']);

const eyebrowSchema = z.string().trim().max(80).optional();

const linkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().min(1).max(300),
});

/**
 * Adresse d'image acceptée : un fichier livré avec le site (`/negawatt.jpg`)
 * ou une image déposée depuis le back-office, servie en https. Le http simple
 * est refusé — il ferait basculer la page en contenu mixte et le navigateur
 * bloquerait l'image.
 */
const imageUrlSchema = z
  .string()
  .trim()
  .max(600)
  .refine(
    (value) => value.startsWith('/') || value.startsWith('https://'),
    'Adresse d’image invalide : attendu un chemin local (/photo.jpg) ou une adresse https.',
  );

const panelSchema: z.ZodType<Panel> = z.object({
  eyebrow: eyebrowSchema,
  title: z.string().trim().max(200).optional(),
  body: z.array(richSchema),
});

export const blockSchema: z.ZodType<Block> = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('section'),
    id: z.string().trim().max(60).optional(),
    eyebrow: eyebrowSchema,
    title: z.string().trim().max(200).optional(),
    lead: z.string().trim().max(600).optional(),
    body: z.array(richSchema),
    align: alignSchema.optional(),
  }),
  z.object({
    type: z.literal('panels'),
    panels: z.array(panelSchema).min(1).max(3),
  }),
  z.object({
    type: z.literal('steps'),
    eyebrow: eyebrowSchema,
    title: z.string().trim().max(200).optional(),
    lead: z.string().trim().max(600).optional(),
    steps: z.array(
      z.object({
        title: z.string().trim().min(1).max(200),
        text: z.string().trim().max(1200),
      }),
    ),
  }),
  z.object({
    type: z.literal('cards'),
    id: z.string().trim().max(60).optional(),
    eyebrow: eyebrowSchema,
    title: z.string().trim().max(200).optional(),
    lead: z.string().trim().max(600).optional(),
    numbered: z.boolean().optional(),
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
    eyebrow: eyebrowSchema,
    title: z.string().trim().max(200).optional(),
    items: z.array(
      z.object({
        q: z.string().trim().min(1).max(300),
        a: z.string().trim().max(2000),
      }),
    ),
  }),
  z.object({
    type: z.literal('quote'),
    text: z.string().trim().min(1).max(400),
    source: z.string().trim().max(200).optional(),
  }),
  z.object({
    type: z.literal('image'),
    url: imageUrlSchema,
    alt: z.string().trim().min(1).max(300),
    caption: z.string().trim().max(300).optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    size: z.enum(['small', 'medium', 'full']).optional(),
    align: alignSchema.optional(),
  }),
  z.object({
    type: z.literal('logos'),
    eyebrow: eyebrowSchema,
    title: z.string().trim().max(200).optional(),
    lead: z.string().trim().max(600).optional(),
    groups: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(200),
          text: z.string().trim().max(600),
        }),
      )
      .optional(),
    caption: z.string().trim().max(120).optional(),
    footnote: z.string().trim().max(300).optional(),
    logos: z.array(
      z.object({
        url: imageUrlSchema,
        alt: z.string().trim().min(1).max(200),
      }),
    ),
    partners: z
      .array(
        z.object({
          url: imageUrlSchema.optional(),
          alt: z.string().trim().min(1).max(200),
          href: z.string().trim().max(300).optional(),
        }),
      )
      .optional(),
  }),
  z.object({
    type: z.literal('callout'),
    tone: z.enum(['info', 'warning']),
    title: z.string().trim().max(200).optional(),
    text: z.string().trim().max(1200),
  }),
  z.object({
    type: z.literal('cta'),
    eyebrow: eyebrowSchema,
    title: z.string().trim().min(1).max(200),
    text: z.string().trim().max(600).optional(),
    primary: linkSchema,
    secondary: linkSchema.optional(),
  }),
  z.object({
    type: z.literal('links'),
    eyebrow: eyebrowSchema,
    title: z.string().trim().max(200).optional(),
    lead: z.string().trim().max(600).optional(),
    links: z.array(
      z.object({
        label: z.string().trim().min(1).max(200),
        href: z.string().trim().min(1).max(300),
        text: z.string().trim().max(600).optional(),
        group: z.string().trim().max(80).optional(),
      }),
    ),
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
    keywords: z.array(z.string().trim().min(1).max(80)).max(15).optional(),
  }),
  hero: z
    .object({
      eyebrow: eyebrowSchema,
      lead: z.string().trim().max(1200),
      body: z.array(z.string().trim().min(1).max(1200)).optional(),
      primary: linkSchema.optional(),
      secondary: linkSchema.optional(),
      tagline: z.string().trim().max(120).optional(),
      image: z
        .object({
          url: imageUrlSchema,
          alt: z.string().trim().min(1).max(300),
          caption: z.string().trim().max(300).optional(),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
        })
        .optional(),
      quote: z
        .object({
          text: z.string().trim().min(1).max(300),
          source: z.string().trim().max(120).optional(),
        })
        .optional(),
      stats: z
        .array(
          z.object({
            value: z.string().trim().min(1).max(20),
            label: z.string().trim().min(1).max(80),
          }),
        )
        .max(4)
        .optional(),
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
