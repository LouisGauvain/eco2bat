'use client';

import { useEffect, useState } from 'react';

import { BlockList } from './BlockEditor';
import { Field, TextField } from './fields';
import { pageContentSchema, type PageContent } from '@/content/schema';
import type { Block, Page } from '@/content/types';
import { pathOf } from '@/content/types';
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
  onSaved,
  compact = false,
}: {
  page: Page;
  onSaved?: () => void;
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
    const parsed = pageContentSchema.safeParse(normalize(draft));

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setStatus('error');
      setMessage(
        `${issue?.path.join(' › ') || 'Contenu'} : ${issue?.message ?? 'valeur invalide'}`,
      );
      return;
    }

    setStatus('saving');
    try {
      await savePageContent(page.slug, parsed.data);
      setOverridden(true);
      setStatus('idle');
      setMessage('Page enregistrée — visible immédiatement sur le site.');
      onSaved?.();
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
    try {
      await resetPageContent(page.slug);
      setDraft(pageContentOf(page));
      setOverridden(false);
      setStatus('idle');
      setMessage('Texte d’origine rétabli.');
      onSaved?.();
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
      {message && (
        <p
          role="status"
          className={`rounded-md p-3 text-sm ${
            status === 'error' ? 'bg-red-50 text-red-900' : 'bg-leaf-50 text-leaf-800'
          }`}
        >
          {message}
        </p>
      )}

      <p className="rounded-md bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
        {overridden
          ? 'Cette page est modifiée en ligne : le texte ci-dessous remplace celui du site déployé.'
          : 'Cette page affiche son texte d’origine.'}{' '}
        Une modification est visible tout de suite par les visiteurs, mais
        n’entre dans l’index de Google qu’au prochain déploiement du site.
      </p>

      <Section title="Identité de la page" compact={compact}>
        <Field
          label="Titre affiché (H1)"
          value={draft.title}
          maxLength={200}
          onChange={(title) => update({ title })}
        />
        <Field
          label="Libellé dans les menus"
          value={draft.navLabel}
          maxLength={60}
          hint={`Adresse de la page : ${pathOf(page)} (non modifiable ici)`}
          onChange={(navLabel) => update({ navLabel })}
        />
      </Section>

      <Section title="Référencement" compact={compact}>
        <Field
          label="Titre dans Google"
          value={draft.seo.title}
          maxLength={120}
          hint="Environ 60 caractères sont affichés dans les résultats."
          onChange={(title) => update({ seo: { ...draft.seo, title } })}
        />
        <TextField
          label="Description dans Google"
          rows={3}
          value={draft.seo.description}
          maxLength={400}
          hint="Environ 150 caractères sont affichés. Unique à chaque page."
          onChange={(description) => update({ seo: { ...draft.seo, description } })}
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
                      ? { label, href: draft.hero?.primary?.href ?? '/contact/' }
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
      </Section>

      <Section title="Contenu de la page" compact={compact}>
        <BlockList
          blocks={draft.blocks}
          onChange={(blocks: Block[]) => update({ blocks })}
        />
      </Section>

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-ink-100 bg-white/95 py-3 backdrop-blur">
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
          primary: content.hero.primary?.label ? content.hero.primary : undefined,
          secondary: content.hero.secondary?.label ? content.hero.secondary : undefined,
        }
      : null,
    blocks: content.blocks.map((block): Block => {
      switch (block.type) {
        case 'section':
          return { ...block, id: blank(block.id), title: blank(block.title), lead: blank(block.lead) };
        case 'steps':
          return { ...block, title: blank(block.title) };
        case 'cards':
          return {
            ...block,
            title: blank(block.title),
            lead: blank(block.lead),
            cards: block.cards.map((card) => ({ ...card, href: blank(card.href) })),
          };
        case 'faq':
          return { ...block, title: blank(block.title) };
        case 'callout':
          return { ...block, title: blank(block.title) };
        case 'cta':
          return {
            ...block,
            text: blank(block.text),
            secondary: block.secondary?.label ? block.secondary : undefined,
          };
      }
    }),
  };
}
