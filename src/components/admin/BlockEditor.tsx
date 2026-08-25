'use client';

import { useState } from 'react';

import {
  AddButton,
  Field,
  ItemControls,
  TextField,
  moved,
  removed,
  replaced,
} from './fields';
import type { Block } from '@/content/types';
import { richToText, textToRich } from '@/lib/rich-text';

/**
 * Éditeur des blocs d'une page.
 *
 * Chaque type de bloc a une présentation unique sur le site : l'auteur choisit
 * un type et remplit des champs, il ne compose pas une mise en page. C'est ce
 * qui garantit qu'une page écrite depuis le back-office ressemble aux autres.
 */

const BLOCK_LABELS: Record<Block['type'], string> = {
  section: 'Section de texte',
  steps: 'Étapes numérotées',
  cards: 'Cartes',
  faq: 'Questions fréquentes',
  callout: 'Encadré',
  cta: 'Appel à l’action',
};

function emptyBlock(type: Block['type']): Block {
  switch (type) {
    case 'section':
      return { type: 'section', title: '', body: [] };
    case 'steps':
      return { type: 'steps', title: '', steps: [{ title: '', text: '' }] };
    case 'cards':
      return { type: 'cards', title: '', cards: [{ title: '', text: '' }] };
    case 'faq':
      return { type: 'faq', title: '', items: [{ q: '', a: '' }] };
    case 'callout':
      return { type: 'callout', tone: 'info', title: '', text: '' };
    case 'cta':
      return {
        type: 'cta',
        title: '',
        text: '',
        primary: { label: 'Demander un devis', href: '/contact/' },
      };
  }
}

/** Résumé affiché quand un bloc est replié — pour s'y retrouver dans la liste. */
function summarize(block: Block): string {
  switch (block.type) {
    case 'section':
    case 'steps':
    case 'cards':
    case 'faq':
      return block.title || '(sans titre)';
    case 'callout':
      return block.title || block.text || '(encadré vide)';
    case 'cta':
      return block.title || '(sans titre)';
  }
}

export function BlockList({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <p className="rounded-md border border-dashed border-ink-200 p-4 text-sm text-ink-500">
          Cette page n’a pas encore de bloc de contenu.
        </p>
      )}

      {blocks.map((block, index) => {
        const open = openIndex === index;
        return (
          <div key={index} className="rounded-lg border border-ink-200 bg-white">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                className="flex min-w-0 flex-1 items-baseline gap-3 text-left"
              >
                <span className="shrink-0 rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                  {BLOCK_LABELS[block.type]}
                </span>
                <span className="truncate text-sm text-ink-800">{summarize(block)}</span>
              </button>
              <ItemControls
                label={`le bloc ${index + 1}`}
                onUp={index > 0 ? () => onChange(moved(blocks, index, index - 1)) : undefined}
                onDown={
                  index < blocks.length - 1
                    ? () => onChange(moved(blocks, index, index + 1))
                    : undefined
                }
                onRemove={() => {
                  onChange(removed(blocks, index));
                  setOpenIndex(null);
                }}
              />
            </div>

            {open && (
              <div className="space-y-4 border-t border-ink-100 px-4 py-4">
                <BlockFields
                  block={block}
                  onChange={(next) => onChange(replaced(blocks, index, next))}
                />
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2 pt-1">
        {(Object.keys(BLOCK_LABELS) as Block['type'][]).map((type) => (
          <AddButton
            key={type}
            onClick={() => {
              onChange([...blocks, emptyBlock(type)]);
              setOpenIndex(blocks.length);
            }}
          >
            {BLOCK_LABELS[type]}
          </AddButton>
        ))}
      </div>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: Block;
  onChange: (block: Block) => void;
}) {
  switch (block.type) {
    case 'section':
      return (
        <>
          <Field
            label="Titre de la section"
            value={block.title ?? ''}
            maxLength={200}
            onChange={(title) => onChange({ ...block, title })}
          />
          <Field
            label="Accroche"
            value={block.lead ?? ''}
            maxLength={600}
            hint="Facultative, affichée en plus gros sous le titre."
            onChange={(lead) => onChange({ ...block, lead })}
          />
          <TextField
            label="Texte"
            rows={10}
            value={richToText(block.body)}
            hint="Une ligne vide sépare deux paragraphes. « ## » commence un sous-titre, « - » un point de liste, « 1. » une liste numérotée."
            onChange={(text) => onChange({ ...block, body: textToRich(text) })}
          />
        </>
      );

    case 'steps':
      return (
        <>
          <Field
            label="Titre"
            value={block.title ?? ''}
            maxLength={200}
            onChange={(title) => onChange({ ...block, title })}
          />
          <Repeatable
            items={block.steps}
            label="l’étape"
            addLabel="Ajouter une étape"
            create={() => ({ title: '', text: '' })}
            onChange={(steps) => onChange({ ...block, steps })}
            render={(step, update) => (
              <>
                <Field
                  label="Titre de l’étape"
                  value={step.title}
                  maxLength={200}
                  onChange={(title) => update({ ...step, title })}
                />
                <TextField
                  label="Description"
                  rows={3}
                  value={step.text}
                  maxLength={1200}
                  onChange={(text) => update({ ...step, text })}
                />
              </>
            )}
          />
        </>
      );

    case 'cards':
      return (
        <>
          <Field
            label="Titre"
            value={block.title ?? ''}
            maxLength={200}
            onChange={(title) => onChange({ ...block, title })}
          />
          <Field
            label="Accroche"
            value={block.lead ?? ''}
            maxLength={600}
            onChange={(lead) => onChange({ ...block, lead })}
          />
          <Repeatable<{ title: string; text: string; href?: string }>
            items={block.cards}
            label="la carte"
            addLabel="Ajouter une carte"
            create={() => ({ title: '', text: '' })}
            onChange={(cards) => onChange({ ...block, cards })}
            render={(card, update) => (
              <>
                <Field
                  label="Titre"
                  value={card.title}
                  maxLength={200}
                  onChange={(title) => update({ ...card, title })}
                />
                <TextField
                  label="Texte"
                  rows={3}
                  value={card.text}
                  maxLength={1200}
                  onChange={(text) => update({ ...card, text })}
                />
                <Field
                  label="Lien"
                  value={card.href ?? ''}
                  maxLength={300}
                  placeholder="/audit-energetique/"
                  hint="Facultatif. Chemin interne avec un slash au début et à la fin."
                  onChange={(href) => update({ ...card, href })}
                />
              </>
            )}
          />
        </>
      );

    case 'faq':
      return (
        <>
          <Field
            label="Titre"
            value={block.title ?? ''}
            maxLength={200}
            onChange={(title) => onChange({ ...block, title })}
          />
          <p className="text-xs text-ink-500">
            Ce bloc alimente aussi les données structurées FAQ : les questions
            peuvent apparaître directement dans les résultats de recherche.
          </p>
          <Repeatable
            items={block.items}
            label="la question"
            addLabel="Ajouter une question"
            create={() => ({ q: '', a: '' })}
            onChange={(items) => onChange({ ...block, items })}
            render={(item, update) => (
              <>
                <Field
                  label="Question"
                  value={item.q}
                  maxLength={300}
                  onChange={(q) => update({ ...item, q })}
                />
                <TextField
                  label="Réponse"
                  rows={4}
                  value={item.a}
                  maxLength={2000}
                  onChange={(a) => update({ ...item, a })}
                />
              </>
            )}
          />
        </>
      );

    case 'callout':
      return (
        <>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">Ton</span>
            <select
              value={block.tone}
              onChange={(event) =>
                onChange({ ...block, tone: event.target.value as 'info' | 'warning' })
              }
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
            >
              <option value="info">Information (vert)</option>
              <option value="warning">Avertissement (orange)</option>
            </select>
          </label>
          <Field
            label="Titre"
            value={block.title ?? ''}
            maxLength={200}
            onChange={(title) => onChange({ ...block, title })}
          />
          <TextField
            label="Texte"
            rows={3}
            value={block.text}
            maxLength={1200}
            onChange={(text) => onChange({ ...block, text })}
          />
        </>
      );

    case 'cta':
      return (
        <>
          <Field
            label="Titre"
            value={block.title}
            maxLength={200}
            onChange={(title) => onChange({ ...block, title })}
          />
          <TextField
            label="Texte"
            rows={3}
            value={block.text ?? ''}
            maxLength={600}
            onChange={(text) => onChange({ ...block, text })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Bouton principal — libellé"
              value={block.primary.label}
              maxLength={80}
              onChange={(label) => onChange({ ...block, primary: { ...block.primary, label } })}
            />
            <Field
              label="Bouton principal — lien"
              value={block.primary.href}
              maxLength={300}
              onChange={(href) => onChange({ ...block, primary: { ...block.primary, href } })}
            />
            <Field
              label="Bouton secondaire — libellé"
              value={block.secondary?.label ?? ''}
              maxLength={80}
              hint="Laisser vide pour n’afficher qu’un bouton."
              onChange={(label) =>
                onChange({
                  ...block,
                  secondary: label ? { label, href: block.secondary?.href ?? '' } : undefined,
                })
              }
            />
            <Field
              label="Bouton secondaire — lien"
              value={block.secondary?.href ?? ''}
              maxLength={300}
              onChange={(href) =>
                onChange({
                  ...block,
                  secondary: block.secondary ? { ...block.secondary, href } : undefined,
                })
              }
            />
          </div>
        </>
      );
  }
}

/** Liste d'éléments identiques : cartes, étapes, questions. */
function Repeatable<T>({
  items,
  label,
  addLabel,
  create,
  render,
  onChange,
}: {
  items: T[];
  label: string;
  addLabel: string;
  create: () => T;
  render: (item: T, update: (item: T) => void) => React.ReactNode;
  onChange: (items: T[]) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-md border border-ink-100 bg-ink-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
              {index + 1}
            </span>
            <ItemControls
              label={`${label} ${index + 1}`}
              onUp={index > 0 ? () => onChange(moved(items, index, index - 1)) : undefined}
              onDown={
                index < items.length - 1
                  ? () => onChange(moved(items, index, index + 1))
                  : undefined
              }
              onRemove={() => onChange(removed(items, index))}
            />
          </div>
          <div className="space-y-3">
            {render(item, (next) => onChange(replaced(items, index, next)))}
          </div>
        </div>
      ))}
      <AddButton onClick={() => onChange([...items, create()])}>{addLabel}</AddButton>
    </div>
  );
}
