'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BlockList } from './BlockEditor';
import { CheckboxField, Field, SelectField, TextField } from './fields';
import { ImageField } from './ImageField';
import { SeoPanel } from './SeoPanel';
import { Toast } from './Toast';
import { docFromPage, pathOf, type Page } from '@/content';
import { pageDocSchema } from '@/content/schema';
import type { Block, PageStatus } from '@/content/types';
import { ContentError, getPage, savePage } from '@/lib/content-store';

/**
 * Éditeur d'une page, partagé par le back-office et l'édition depuis le site
 * public — pour que les deux chemins produisent exactement le même contenu et
 * les mêmes validations.
 *
 * Enregistrer écrit dans Firestore ; le site en ligne ne change qu'à la
 * publication. Entre les deux, l'aperçu montre la version enregistrée.
 */

type Status = 'loading' | 'missing' | 'idle' | 'saving' | 'error';

const STATUS_OPTIONS: { value: PageStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon — pas en ligne' },
  { value: 'published', label: 'Publiée — en ligne à la prochaine publication' },
];

export function PageEditor({
  pageId,
  compact = false,
}: {
  pageId: string;
  /** Mise en page resserrée pour le panneau d'édition sur le site. */
  compact?: boolean;
}) {
  const [original, setOriginal] = useState<Page | null>(null);
  const [draft, setDraft] = useState<Page | null>(null);
  const [slugText, setSlugText] = useState('');
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  // Change à chaque « Annuler » : remonte les champs qui gardent leur propre
  // saisie (mots-clés).
  const [resets, setResets] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');

    getPage(pageId)
      .then((page) => {
        if (!active) return;
        setOriginal(page);
        setDraft(page);
        setSlugText(page?.slug.join('/') ?? '');
        setStatus(page ? 'idle' : 'missing');
        setMessage('');
      })
      .catch((error) => {
        console.error('[contenu] lecture impossible', error);
        if (active) setStatus('missing');
      });

    return () => {
      active = false;
    };
  }, [pageId]);

  if (status === 'loading') {
    return <p className="text-sm text-ink-400">Chargement de la page…</p>;
  }
  if (!draft || !original) {
    return <p className="text-sm text-red-800">Page introuvable ou illisible.</p>;
  }

  const page = draft;
  const loaded = original;
  const dirty = JSON.stringify(page) !== JSON.stringify(original);
  // L'accueil et les pages à route dédiée (Contact) ont une adresse fixée dans
  // le code : la changer produirait une page vide.
  const slugLocked = original.slug.length === 0 || Boolean(original.customRoute);

  function update(patch: Partial<Page>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  async function onSave() {
    const next = normalize(page);
    const parsed = pageDocSchema.safeParse(docFromPage(next));

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setStatus('error');
      setMessage(`${labelOf(issue?.path ?? [])} : ${issue?.message ?? 'valeur invalide'}`);
      return;
    }

    setStatus('saving');
    setMessage(''); // relance l'animation du toast même si le texte est identique
    try {
      await savePage(next, loaded);
      const moved = loaded.status === 'published' && pathOf(loaded) !== pathOf(next);
      setOriginal(next);
      setDraft(next);
      setStatus('idle');
      setMessage(
        moved
          ? `Enregistré. Redirection créée de ${pathOf(loaded)} vers ${pathOf(next)}. Cliquez « Publier » pour mettre en ligne.`
          : 'Enregistré. Cliquez « Publier » pour mettre en ligne.',
      );
    } catch (error) {
      console.error('[contenu] enregistrement impossible', error);
      setStatus('error');
      setMessage(
        error instanceof ContentError ? error.message : 'Enregistrement impossible. Vérifiez votre connexion.',
      );
    }
  }

  return (
    <div className={compact ? 'space-y-6' : 'max-w-3xl space-y-8'}>
      <Toast message={message} tone={status === 'error' ? 'error' : 'success'} />

      <Section title="Page et menu" compact={compact}>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Statut"
            value={page.status}
            options={STATUS_OPTIONS}
            disabled={slugLocked}
            hint={slugLocked ? 'Cette page est indispensable au site : elle reste publiée.' : undefined}
            onChange={(value) => update({ status: value })}
          />
          <label className="block">
            <span className="text-sm font-medium text-ink-800">Adresse</span>
            <span className="mt-1 flex items-center rounded-md border border-ink-200 text-sm focus-within:border-leaf-500">
              <span className="pl-3 text-ink-400">/</span>
              <input
                type="text"
                value={slugLocked ? original.slug.join('/') : slugText}
                disabled={slugLocked}
                onChange={(event) => {
                  const text = event.target.value.toLowerCase().replace(/\s+/g, '-');
                  setSlugText(text);
                  update({ slug: text.split('/').filter(Boolean) });
                }}
                className="w-full rounded-md py-2 pr-3 text-ink-900 focus:outline-none disabled:bg-ink-50 disabled:text-ink-400"
              />
              <span className="pr-3 text-ink-400">/</span>
            </span>
            <span className="mt-1 block text-xs text-ink-500">
              {slugLocked
                ? 'Adresse fixe.'
                : original.status === 'published'
                  ? 'Changer l’adresse crée automatiquement une redirection depuis l’ancienne.'
                  : 'Minuscules, chiffres et tirets.'}
            </span>
          </label>
        </div>

        <Field
          label="Titre affiché (H1)"
          value={page.title}
          maxLength={200}
          onChange={(title) => update({ title })}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Libellé court (menu, fil d’Ariane)"
            value={page.navLabel}
            maxLength={60}
            onChange={(navLabel) => update({ navLabel })}
          />
          <Field
            label="Intitulé complet (pied de page)"
            value={page.navTitle ?? ''}
            maxLength={120}
            placeholder={page.title}
            onChange={(navTitle) => update({ navTitle })}
          />
        </div>

        <div className="space-y-3">
          <CheckboxField
            label="Afficher dans le menu principal"
            checked={Boolean(page.showInNav)}
            hint="L’ordre du menu se règle dans la liste des pages."
            onChange={(showInNav) => update({ showInNav })}
          />
          <CheckboxField
            label="Ne pas référencer cette page"
            checked={Boolean(page.noindex)}
            hint="La page reste accessible mais Google ne l’indexe pas (mentions légales, page en préparation)."
            onChange={(noindex) => update({ noindex })}
          />
        </div>
      </Section>

      <Section title="Référencement" compact={compact}>
        <SeoPanel key={resets} page={page} onChange={(seo) => update({ seo })} />
      </Section>

      <Section title="Accroche et boutons" compact={compact}>
        <TextField
          label="Accroche sous le titre"
          rows={4}
          value={page.hero?.lead ?? ''}
          maxLength={1200}
          hint="Laisser vide pour supprimer l’accroche et ses boutons."
          onChange={(lead) => update({ hero: { ...page.hero, lead } })}
        />
        {page.hero && (
          <TextField
            label="Texte de présentation"
            rows={6}
            value={(page.hero.body ?? []).join('\n\n')}
            hint="Facultatif, affiché sous l’accroche. Une ligne vide sépare deux paragraphes."
            onChange={(text) =>
              update({
                hero: {
                  ...page.hero!,
                  body: text
                    .split(/\n{2,}/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        )}

        {page.hero && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Bouton principal — libellé"
              value={page.hero.primary?.label ?? ''}
              maxLength={80}
              onChange={(label) =>
                update({
                  hero: {
                    ...page.hero!,
                    primary: label ? { label, href: page.hero?.primary?.href ?? '#contact' } : undefined,
                  },
                })
              }
            />
            <Field
              label="Bouton principal — lien"
              value={page.hero.primary?.href ?? ''}
              maxLength={300}
              onChange={(href) =>
                update({
                  hero: {
                    ...page.hero!,
                    primary: page.hero?.primary ? { ...page.hero.primary, href } : undefined,
                  },
                })
              }
            />
            <Field
              label="Bouton secondaire — libellé"
              value={page.hero.secondary?.label ?? ''}
              maxLength={80}
              onChange={(label) =>
                update({
                  hero: {
                    ...page.hero!,
                    secondary: label ? { label, href: page.hero?.secondary?.href ?? '' } : undefined,
                  },
                })
              }
            />
            <Field
              label="Bouton secondaire — lien"
              value={page.hero.secondary?.href ?? ''}
              maxLength={300}
              onChange={(href) =>
                update({
                  hero: {
                    ...page.hero!,
                    secondary: page.hero?.secondary ? { ...page.hero.secondary, href } : undefined,
                  },
                })
              }
            />
          </div>
        )}

        {page.hero && (
          <div className="space-y-3 border-t border-ink-100 pt-4">
            <ImageField
              value={page.hero.image ?? { url: '' }}
              onChange={(image) =>
                update({
                  hero: {
                    ...page.hero!,
                    image: image.url
                      ? {
                          alt: page.hero?.image?.alt ?? '',
                          caption: page.hero?.image?.caption,
                          ...image,
                          url: image.url,
                        }
                      : undefined,
                  },
                })
              }
            />
            {page.hero.image && (
              <>
                <Field
                  label="Description de l’image"
                  value={page.hero.image.alt}
                  maxLength={300}
                  hint="Obligatoire : lue par les lecteurs d’écran et par les moteurs de recherche."
                  onChange={(alt) =>
                    update({ hero: { ...page.hero!, image: { ...page.hero!.image!, alt } } })
                  }
                />
                <Field
                  label="Légende"
                  value={page.hero.image.caption ?? ''}
                  maxLength={300}
                  hint="Facultative, affichée sous l’image."
                  onChange={(caption) =>
                    update({ hero: { ...page.hero!, image: { ...page.hero!.image!, caption } } })
                  }
                />
              </>
            )}
          </div>
        )}
      </Section>

      <Section title="Contenu de la page" compact={compact}>
        <BlockList blocks={page.blocks} onChange={(blocks: Block[]) => update({ blocks })} />
      </Section>

      {/* En back-office, la barre reprend l'aspect des cartes au-dessus et se
          décolle du bas. En panneau, elle déborde sur le padding du conteneur
          défilant : sans cela le texte passerait derrière elle sur les bords. */}
      <div
        className={`sticky flex flex-wrap items-center gap-3 bg-white/95 py-3 backdrop-blur ${
          compact
            ? 'bottom-0 -mx-5 border-t border-ink-100 px-5'
            : 'bottom-4 mb-4 rounded-lg border border-ink-200 px-6 shadow-sm'
        }`}
      >
        <button
          type="button"
          onClick={onSave}
          disabled={status === 'saving'}
          className="rounded-md bg-ink-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 disabled:bg-ink-300"
        >
          {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {dirty && (
          <>
            <button
              type="button"
              onClick={() => {
                setDraft(original);
                setSlugText(original.slug.join('/'));
                setResets((value) => value + 1);
              }}
              disabled={status === 'saving'}
              className="rounded-md border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Annuler
            </button>
            <span className="text-xs text-amber-700">Modifications non enregistrées</span>
          </>
        )}
        <Link
          href={`/admin/apercu/?id=${encodeURIComponent(pageId)}`}
          target="_blank"
          className="ml-auto text-sm text-ink-500 underline underline-offset-4 hover:text-ink-800"
        >
          Aperçu ↗
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  compact,
}: {
  title: string;
  children: React.ReactNode;
  compact: boolean;
}) {
  return (
    <section
      className={
        compact
          ? 'space-y-4'
          : 'space-y-4 rounded-lg border border-ink-200 bg-white p-6'
      }
    >
      <h2 className="font-semibold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

/** Chemin d'une erreur de validation, en mots plutôt qu'en clés. */
function labelOf(path: PropertyKey[]): string {
  const names: Record<string, string> = {
    slug: 'Adresse',
    seo: 'Référencement',
    title: 'Titre',
    description: 'Description',
    navLabel: 'Libellé court',
    hero: 'Accroche',
    blocks: 'Contenu',
  };
  return path.map((key) => (typeof key === 'number' ? `n° ${key + 1}` : (names[String(key)] ?? String(key)))).join(' › ') || 'Page';
}

/**
 * Les champs facultatifs laissés vides sont retirés plutôt qu'enregistrés
 * comme chaîne vide : un titre de bloc vide ne doit pas produire un `<h2>`
 * vide sur le site.
 */
function normalize(page: Page): Page {
  const blank = (value?: string) => (value && value.trim() ? value.trim() : undefined);

  return {
    ...page,
    navTitle: blank(page.navTitle),
    seo: {
      ...page.seo,
      keywords: page.seo.keywords?.length ? page.seo.keywords : undefined,
      image: blank(page.seo.image),
    },
    hero: page.hero?.lead.trim()
      ? {
          // Surtitre, citation, chiffres clés… ne s'éditent pas ici mais
          // doivent survivre à l'enregistrement.
          ...page.hero,
          body: page.hero.body?.length ? page.hero.body : undefined,
          primary: page.hero.primary?.label ? page.hero.primary : undefined,
          secondary: page.hero.secondary?.label ? page.hero.secondary : undefined,
          // Une image sans description serait refusée à la validation : on la
          // retire plutôt que de bloquer l'enregistrement de toute la page.
          image: page.hero.image?.alt.trim()
            ? { ...page.hero.image, caption: blank(page.hero.image.caption) }
            : undefined,
        }
      : undefined,
    blocks: page.blocks.map((block): Block => {
      switch (block.type) {
        case 'section':
          return {
            ...block,
            id: blank(block.id),
            eyebrow: blank(block.eyebrow),
            title: blank(block.title),
            lead: blank(block.lead),
          };
        case 'panels':
          return {
            ...block,
            panels: block.panels.map((panel) => ({
              ...panel,
              eyebrow: blank(panel.eyebrow),
              title: blank(panel.title),
            })),
          };
        case 'steps':
          return { ...block, eyebrow: blank(block.eyebrow), title: blank(block.title), lead: blank(block.lead) };
        case 'cards':
          return {
            ...block,
            eyebrow: blank(block.eyebrow),
            title: blank(block.title),
            lead: blank(block.lead),
            cards: block.cards.map((card) => ({ ...card, href: blank(card.href) })),
          };
        case 'faq':
          return { ...block, eyebrow: blank(block.eyebrow), title: blank(block.title) };
        case 'logos':
          return { ...block, eyebrow: blank(block.eyebrow), title: blank(block.title), lead: blank(block.lead) };
        case 'quote':
          return { ...block, source: blank(block.source) };
        case 'image':
          return { ...block, caption: blank(block.caption) };
        case 'callout':
          return { ...block, title: blank(block.title) };
        case 'cta':
          return {
            ...block,
            eyebrow: blank(block.eyebrow),
            text: blank(block.text),
            secondary: block.secondary?.label ? block.secondary : undefined,
          };
        case 'links':
          return {
            ...block,
            eyebrow: blank(block.eyebrow),
            title: blank(block.title),
            lead: blank(block.lead),
            links: block.links.map((link) => ({ ...link, text: blank(link.text) })),
          };
      }
    }),
  };
}
