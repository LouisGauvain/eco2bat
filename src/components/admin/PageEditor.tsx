'use client';

import { useEffect, useState } from 'react';

import { BlockList } from './BlockEditor';
import { Field, TextField } from './fields';
import { ImageField } from './ImageField';
import { Toast } from './Toast';
import { pageContentSchema, type PageContent } from '@/content/schema';
import type { Block, Page } from '@/content/types';
import {
  getPageContent,
  pageContentOf,
  resetPageContent,
  savePageContent,
} from '@/lib/content-store';

/**
 * Éditeur d'une page, partagé par le back-office et l'édition en direct depuis
 * le site public — pour que les deux chemins produisent exactement le même
 * contenu et les mêmes validations.
 *
 * L'édition part toujours de la version du dépôt : tant que rien n'est
 * enregistré, la page continue d'être servie telle qu'elle a été déployée.
 */

type Status = 'loading' | 'idle' | 'saving' | 'error';

export function PageEditor({
  page,
  compact = false,
}: {
  page: Page;
  /** Mise en page resserrée pour le panneau d'édition en direct. */
  compact?: boolean;
}) {
  const [draft, setDraft] = useState<PageContent>(() => pageContentOf(page));
  const [overridden, setOverridden] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setStatus('loading');

    getPageContent(page.slug).then((content) => {
      if (!active) return;
      setDraft(content ?? pageContentOf(page));
      setOverridden(content !== null);
      setStatus('idle');
      setMessage('');
    });

    return () => {
      active = false;
    };
  }, [page]);

  function update(patch: Partial<PageContent>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function onSave() {
    // Le référencement et le libellé de menu ne s'éditent pas ici : ils sont
    // écrits dans le HTML au moment du build — le menu figure sur toutes les
    // pages, pas seulement celle qu'on modifie. On réécrit systématiquement les
    // valeurs du dépôt, pour qu'une ancienne surcharge ne traîne pas en base.
    const origin = pageContentOf(page);
    const parsed = pageContentSchema.safeParse(
      normalize({ ...draft, navLabel: origin.navLabel, seo: origin.seo }),
    );

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setStatus('error');
      setMessage(
        `${issue?.path.join(' › ') || 'Contenu'} : ${issue?.message ?? 'valeur invalide'}`,
      );
      return;
    }

    setStatus('saving');
    setMessage(''); // relance l'animation du toast même si le texte est identique
    try {
      await savePageContent(page.slug, parsed.data);
      setOverridden(true);
      setStatus('idle');
      setMessage('Page enregistrée — visible immédiatement sur le site.');
    } catch (error) {
      console.error('[contenu] enregistrement impossible', error);
      setStatus('error');
      setMessage('Enregistrement impossible. Vérifiez votre connexion.');
    }
  }

  async function onReset() {
    if (!window.confirm('Rétablir le texte d’origine de cette page ? Vos modifications en ligne seront perdues.')) {
      return;
    }

    setStatus('saving');
    setMessage('');
    try {
      await resetPageContent(page.slug);
      setDraft(pageContentOf(page));
      setOverridden(false);
      setStatus('idle');
      setMessage('Texte d’origine rétabli.');
    } catch (error) {
      console.error('[contenu] réinitialisation impossible', error);
      setStatus('error');
      setMessage('Réinitialisation impossible.');
    }
  }

  if (status === 'loading') {
    return <p className="text-sm text-ink-400">Chargement de la page…</p>;
  }

  return (
    <div className={compact ? 'space-y-6' : 'max-w-3xl space-y-8'}>
      <Toast message={message} tone={status === 'error' ? 'error' : 'success'} />

      <p className="rounded-md bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
        {overridden
          ? 'Texte modifié en ligne : il remplace celui du site déployé.'
          : 'Texte d’origine du site.'}{' '}
        Vos modifications sont visibles par les visiteurs dès l’enregistrement.
      </p>

      <Section title="Identité de la page" compact={compact}>
        <Field
          label="Titre affiché (H1)"
          value={draft.title}
          maxLength={200}
          onChange={(title) => update({ title })}
        />
      </Section>

      <Section title="Accroche et boutons" compact={compact}>
        <TextField
          label="Accroche sous le titre"
          rows={4}
          value={draft.hero?.lead ?? ''}
          maxLength={1200}
          hint="Laisser vide pour supprimer l’accroche et ses boutons."
          onChange={(lead) =>
            update({ hero: lead ? { ...draft.hero, lead } : null })
          }
        />
        {draft.hero && (
          <TextField
            label="Texte de présentation"
            rows={6}
            value={(draft.hero.body ?? []).join('\n\n')}
            hint="Facultatif, affiché sous l’accroche. Une ligne vide sépare deux paragraphes."
            onChange={(text) =>
              update({
                hero: {
                  ...draft.hero!,
                  body: text
                    .split(/\n{2,}/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        )}

        {draft.hero && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Bouton principal — libellé"
              value={draft.hero.primary?.label ?? ''}
              maxLength={80}
              onChange={(label) =>
                update({
                  hero: {
                    ...draft.hero!,
                    primary: label
                      ? { label, href: draft.hero?.primary?.href ?? '#contact' }
                      : undefined,
                  },
                })
              }
            />
            <Field
              label="Bouton principal — lien"
              value={draft.hero.primary?.href ?? ''}
              maxLength={300}
              onChange={(href) =>
                update({
                  hero: {
                    ...draft.hero!,
                    primary: draft.hero?.primary
                      ? { ...draft.hero.primary, href }
                      : undefined,
                  },
                })
              }
            />
            <Field
              label="Bouton secondaire — libellé"
              value={draft.hero.secondary?.label ?? ''}
              maxLength={80}
              onChange={(label) =>
                update({
                  hero: {
                    ...draft.hero!,
                    secondary: label
                      ? { label, href: draft.hero?.secondary?.href ?? '' }
                      : undefined,
                  },
                })
              }
            />
            <Field
              label="Bouton secondaire — lien"
              value={draft.hero.secondary?.href ?? ''}
              maxLength={300}
              onChange={(href) =>
                update({
                  hero: {
                    ...draft.hero!,
                    secondary: draft.hero?.secondary
                      ? { ...draft.hero.secondary, href }
                      : undefined,
                  },
                })
              }
            />
          </div>
        )}

        {draft.hero && (
          <div className="space-y-3 border-t border-ink-100 pt-4">
            <ImageField
              value={draft.hero.image ?? { url: '' }}
              onChange={(image) =>
                update({
                  hero: {
                    ...draft.hero!,
                    image: image.url
                      ? {
                          alt: draft.hero?.image?.alt ?? '',
                          caption: draft.hero?.image?.caption,
                          ...image,
                          url: image.url,
                        }
                      : undefined,
                  },
                })
              }
            />
            {draft.hero.image && (
              <>
                <Field
                  label="Description de l’image"
                  value={draft.hero.image.alt}
                  maxLength={300}
                  hint="Obligatoire : lue par les lecteurs d’écran et par les moteurs de recherche."
                  onChange={(alt) =>
                    update({ hero: { ...draft.hero!, image: { ...draft.hero!.image!, alt } } })
                  }
                />
                <Field
                  label="Légende"
                  value={draft.hero.image.caption ?? ''}
                  maxLength={300}
                  hint="Facultative, affichée sous l’image."
                  onChange={(caption) =>
                    update({
                      hero: { ...draft.hero!, image: { ...draft.hero!.image!, caption } },
                    })
                  }
                />
              </>
            )}
          </div>
        )}
      </Section>

      <Section title="Contenu de la page" compact={compact}>
        <BlockList
          blocks={draft.blocks}
          onChange={(blocks: Block[]) => update({ blocks })}
        />
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
        {overridden && (
          <button
            type="button"
            onClick={onReset}
            disabled={status === 'saving'}
            className="rounded-md border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Rétablir le texte d’origine
          </button>
        )}
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

/**
 * Les champs facultatifs laissés vides sont retirés plutôt qu'enregistrés
 * comme chaîne vide : un titre de bloc vide ne doit pas produire un `<h2>`
 * vide sur le site.
 */
function normalize(content: PageContent): PageContent {
  const blank = (value?: string) => (value && value.trim() ? value.trim() : undefined);

  return {
    ...content,
    hero: content.hero?.lead.trim()
      ? {
          lead: content.hero.lead,
          body: content.hero.body?.length ? content.hero.body : undefined,
          primary: content.hero.primary?.label ? content.hero.primary : undefined,
          secondary: content.hero.secondary?.label ? content.hero.secondary : undefined,
          // Une image sans description serait refusée à la validation : on la
          // retire plutôt que de bloquer l'enregistrement de toute la page.
          image: content.hero.image?.alt.trim()
            ? { ...content.hero.image, caption: blank(content.hero.image.caption) }
            : undefined,
        }
      : null,
    blocks: content.blocks.map((block): Block => {
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
