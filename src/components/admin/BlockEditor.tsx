'use client';

import { useState } from 'react';

import {
  AddButton,
  Field,
  ItemControls,
  SelectField,
  TextField,
  moved,
  removed,
  replaced,
} from './fields';
import { ImageField } from './ImageField';
import type { Align, Block } from '@/content/types';
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
  panels: 'Cartes côte à côte',
  steps: 'Étapes numérotées',
  cards: 'Cartes',
  faq: 'Questions fréquentes',
  quote: 'Citation',
  image: 'Image',
  logos: 'Logos de références',
  callout: 'Encadré',
  cta: 'Appel à l’action',
  links: 'Liens utiles',
};

const ALIGN_OPTIONS: { value: Align; label: string }[] = [
  { value: 'left', label: 'À gauche' },
  { value: 'center', label: 'Au centre' },
  { value: 'right', label: 'À droite' },
];

function emptyBlock(type: Block['type']): Block {
  switch (type) {
    case 'section':
      return { type: 'section', title: '', body: [] };
    case 'panels':
      return {
        type: 'panels',
        panels: [
          { eyebrow: '', title: '', body: [] },
          { eyebrow: '', title: '', body: [] },
        ],
      };
    case 'logos':
      return { type: 'logos', title: '', logos: [{ url: '', alt: '' }] };
    case 'steps':
      return { type: 'steps', title: '', steps: [{ title: '', text: '' }] };
    case 'cards':
      return { type: 'cards', title: '', cards: [{ title: '', text: '' }] };
    case 'faq':
      return { type: 'faq', title: '', items: [{ q: '', a: '' }] };
    case 'quote':
      return { type: 'quote', text: '' };
    case 'image':
      return { type: 'image', url: '', alt: '' };
    case 'callout':
      return { type: 'callout', tone: 'info', title: '', text: '' };
    case 'cta':
      return {
        type: 'cta',
        title: '',
        text: '',
        primary: { label: 'Demander un devis', href: '#contact' },
      };
    case 'links':
      return { type: 'links', title: '', links: [{ label: '', href: '' }] };
  }
}

/** Résumé affiché quand un bloc est replié — pour s'y retrouver dans la liste. */
function summarize(block: Block): string {
  switch (block.type) {
    case 'section':
    case 'steps':
    case 'cards':
    case 'faq':
    case 'links':
    case 'logos':
      return block.title || '(sans titre)';
    case 'panels':
      return block.panels.map((panel) => panel.eyebrow || panel.title).filter(Boolean).join(' / ') || '(sans titre)';
    case 'quote':
      return block.text || '(citation vide)';
    case 'image':
      return block.alt || '(image sans description)';
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
          <SelectField
            label="Alignement du texte"
            value={block.align ?? 'left'}
            options={ALIGN_OPTIONS}
            hint="Le texte courant se lit mieux aligné à gauche : réserver le centrage aux sections courtes."
            onChange={(align) => onChange({ ...block, align })}
          />
        </>
      );

    case 'panels':
      return (
        <>
          <p className="text-xs text-ink-500">
            Deux ou trois cartes côte à côte, chacune avec son surtitre. Sur mobile elles s’empilent.
          </p>
          <Repeatable
            items={block.panels}
            label="la carte"
            addLabel="Ajouter une carte"
            create={() => ({ eyebrow: '', title: '', body: [] })}
            onChange={(panels) => onChange({ ...block, panels })}
            render={(panel, update) => (
              <>
                <Field
                  label="Surtitre"
                  value={panel.eyebrow ?? ''}
                  maxLength={80}
                  hint="Petit intitulé vert en capitales : « Les bons moments », « Bon à savoir »."
                  onChange={(eyebrow) => update({ ...panel, eyebrow })}
                />
                <Field
                  label="Titre"
                  value={panel.title ?? ''}
                  maxLength={200}
                  onChange={(title) => update({ ...panel, title })}
                />
                <TextField
                  label="Texte"
                  rows={6}
                  value={richToText(panel.body)}
                  hint="Une ligne vide sépare deux paragraphes. « - » commence un point de liste."
                  onChange={(text) => update({ ...panel, body: textToRich(text) })}
                />
              </>
            )}
          />
        </>
      );

    case 'logos':
      return (
        <>
          <Field
            label="Surtitre"
            value={block.eyebrow ?? ''}
            maxLength={80}
            onChange={(eyebrow) => onChange({ ...block, eyebrow })}
          />
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
          <Repeatable<{ title: string; text: string }>
            items={block.groups ?? []}
            label="la famille de clients"
            addLabel="Ajouter une famille de clients"
            create={() => ({ title: '', text: '' })}
            onChange={(groups) => onChange({ ...block, groups })}
            render={(group, update) => (
              <>
                <Field
                  label="Titre"
                  value={group.title}
                  maxLength={200}
                  placeholder="Collectivités"
                  onChange={(title) => update({ ...group, title })}
                />
                <TextField
                  label="Détail"
                  rows={2}
                  value={group.text}
                  maxLength={600}
                  onChange={(text) => update({ ...group, text })}
                />
              </>
            )}
          />
          <Field
            label="Intitulé au-dessus des logos"
            value={block.caption ?? ''}
            maxLength={120}
            hint="Facultatif. Exemple : « Parcs et collectivités accompagnés »."
            onChange={(caption) => onChange({ ...block, caption })}
          />
          <Field
            label="Ligne sous les logos"
            value={block.footnote ?? ''}
            maxLength={300}
            hint="Facultatif. Exemple : « Partenaires : Savenergie · Idem · … »."
            onChange={(footnote) => onChange({ ...block, footnote })}
          />
          <Repeatable
            items={block.logos}
            label="le logo"
            addLabel="Ajouter un logo"
            create={() => ({ url: '', alt: '' })}
            onChange={(logos) => onChange({ ...block, logos })}
            render={(logo, update) => (
              <>
                <ImageField value={logo} onChange={(image) => update({ ...logo, url: image.url ?? logo.url })} />
                <Field
                  label="Nom de l’organisme"
                  value={logo.alt}
                  maxLength={200}
                  hint="Affiché au survol et lu par les lecteurs d’écran."
                  onChange={(alt) => update({ ...logo, alt })}
                />
              </>
            )}
          />
          <Repeatable<{ url?: string; alt: string; href?: string }>
            items={block.partners ?? []}
            label="le partenaire"
            addLabel="Ajouter un partenaire"
            create={() => ({ alt: '' })}
            onChange={(partners) => onChange({ ...block, partners })}
            render={(partner, update) => (
              <>
                <Field
                  label="Nom du partenaire"
                  value={partner.alt}
                  maxLength={200}
                  hint="Affiché tel quel si le partenaire n’a pas de logo."
                  onChange={(alt) => update({ ...partner, alt })}
                />
                <ImageField
                  value={{ url: partner.url ?? '' }}
                  onChange={(image) => update({ ...partner, url: image.url || undefined })}
                />
                <Field
                  label="Site du partenaire"
                  value={partner.href ?? ''}
                  maxLength={300}
                  placeholder="https://…"
                  hint="Facultatif."
                  onChange={(href) => update({ ...partner, href: href || undefined })}
                />
              </>
            )}
          />
        </>
      );

    case 'steps':
      return (
        <>
          <Field
            label="Surtitre"
            value={block.eyebrow ?? ''}
            maxLength={80}
            onChange={(eyebrow) => onChange({ ...block, eyebrow })}
          />
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
            label="Surtitre"
            value={block.eyebrow ?? ''}
            maxLength={80}
            hint="Facultatif. Sans surtitre ni titre, chaque carte devient une grande carte (page Mesures)."
            onChange={(eyebrow) => onChange({ ...block, eyebrow })}
          />
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
            label="Surtitre"
            value={block.eyebrow ?? ''}
            maxLength={80}
            onChange={(eyebrow) => onChange({ ...block, eyebrow })}
          />
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

    case 'quote':
      return (
        <>
          <TextField
            label="Citation"
            rows={3}
            value={block.text}
            maxLength={400}
            hint="Affichée en grand, sur fond sable, au milieu de la page. Un retour à la ligne coupe la phrase à cet endroit. Une seule par page : c’est sa rareté qui la met en valeur."
            onChange={(text) => onChange({ ...block, text })}
          />
          <Field
            label="Source"
            value={block.source ?? ''}
            maxLength={200}
            hint="Facultative, affichée en petit sous la citation."
            onChange={(source) => onChange({ ...block, source })}
          />
        </>
      );

    case 'image': {
      const size = block.size ?? 'medium';
      return (
        <>
          <ImageField
            value={block}
            onChange={(image) => onChange({ ...block, ...image })}
          />
          <Field
            label="Description de l’image"
            value={block.alt}
            maxLength={300}
            hint="Obligatoire : lue par les lecteurs d’écran et par les moteurs de recherche. Décrire ce que montre la photo, pas « photo de chantier »."
            onChange={(alt) => onChange({ ...block, alt })}
          />
          <Field
            label="Légende"
            value={block.caption ?? ''}
            maxLength={300}
            hint="Facultative, affichée sous l’image."
            onChange={(caption) => onChange({ ...block, caption })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Taille"
              value={size}
              options={[
                { value: 'small', label: 'Petite (un tiers de la colonne)' },
                { value: 'medium', label: 'Moyenne (deux tiers)' },
                { value: 'full', label: 'Pleine largeur' },
              ]}
              onChange={(next) => onChange({ ...block, size: next })}
            />
            <SelectField
              label="Position"
              value={block.align ?? 'center'}
              options={ALIGN_OPTIONS}
              // En pleine largeur il ne reste aucune marge à répartir : le
              // choix serait sans effet, autant le montrer comme tel.
              disabled={size === 'full'}
              hint={
                size === 'full'
                  ? 'Sans objet en pleine largeur.'
                  : 'Sur mobile, l’image occupe toujours toute la largeur.'
              }
              onChange={(next) => onChange({ ...block, align: next })}
            />
          </div>
        </>
      );
    }

    case 'callout':
      return (
        <>
          <SelectField
            label="Ton"
            value={block.tone}
            options={[
              { value: 'info', label: 'Information (vert)' },
              { value: 'warning', label: 'Avertissement (orange)' },
            ]}
            onChange={(tone) => onChange({ ...block, tone })}
          />
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
            label="Surtitre"
            value={block.eyebrow ?? ''}
            maxLength={80}
            hint="Facultatif : « Notre philosophie »."
            onChange={(eyebrow) => onChange({ ...block, eyebrow })}
          />
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

    case 'links':
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
          <Repeatable<{ label: string; href: string; text?: string }>
            items={block.links}
            label="le lien"
            addLabel="Ajouter un lien"
            create={() => ({ label: '', href: '' })}
            onChange={(links) => onChange({ ...block, links })}
            render={(link, update) => (
              <>
                <Field
                  label="Libellé"
                  value={link.label}
                  maxLength={200}
                  onChange={(label) => update({ ...link, label })}
                />
                <Field
                  label="Adresse"
                  value={link.href}
                  maxLength={300}
                  placeholder="https://france-renov.gouv.fr/"
                  hint="Adresse complète du site, elle s’ouvrira dans un nouvel onglet."
                  onChange={(href) => update({ ...link, href })}
                />
                <TextField
                  label="Description"
                  rows={2}
                  value={link.text ?? ''}
                  maxLength={600}
                  hint="Facultative."
                  onChange={(text) => update({ ...link, text })}
                />
              </>
            )}
          />
        </>
      );
  }
}

/** Liste d'éléments identiques : cartes, étapes, questions, liens. */
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
