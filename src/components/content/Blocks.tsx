'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ContentImage } from './ContentImage';
import type { Block, Rich } from '@/content/types';
import { Backdrop } from '@/components/layout/Backdrop';
import { btnGhostDark, btnLight, card, eyebrow, num, pad, shell } from '@/components/layout/ui';

/**
 * Rendu des blocs de contenu, d'après les maquettes du dossier Refonte.
 *
 * Chaque type de bloc a une et une seule présentation : une page ajoutée dans
 * six mois ressemble aux autres sans nouveau choix de mise en forme. Les blocs
 * sont des cartes posées sur le papier, séparées de 16 px ; les sections
 * « aérées » de l'accueil (missions, références, questions) prennent plus de
 * hauteur.
 */
/**
 * `spacious` : rythme des pages de mission et des pages annexes, où les blocs
 * s'enchaînent en pleine largeur de lecture. L'accueil garde le rythme serré
 * des maquettes : ses sections portent déjà leur propre respiration (`pt-20`).
 */
export function Blocks({ blocks, spacious = false }: { blocks: Block[]; spacious?: boolean }) {
  return (
    <div className={spacious ? 'space-y-10 sm:space-y-14' : 'space-y-4'}>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} spacious={spacious} />
      ))}
    </div>
  );
}

/** Surtitre + titre, alignés à gauche dans une carte ou centrés en tête de section. */
function Heading({
  block,
  center = false,
  size = 'text-[24px]',
}: {
  block: { eyebrow?: string; title?: string; lead?: string };
  center?: boolean;
  size?: string;
}) {
  if (!block.eyebrow && !block.title && !block.lead) return null;
  return (
    <div className={center ? 'text-center' : ''}>
      {block.eyebrow && <p className={eyebrow}>{block.eyebrow}</p>}
      {block.title && (
        <h2
          className={`${size} mt-2.5 font-display leading-tight tracking-[-0.02em] text-ink-900 text-balance ${center ? 'mx-auto max-w-[560px]' : ''}`}
        >
          {block.title}
        </h2>
      )}
      {block.lead && (
        <p
          className={`mt-3 text-[15px] leading-[1.7] text-ink-600 ${center ? 'mx-auto max-w-[640px]' : 'max-w-[700px]'}`}
        >
          {block.lead}
        </p>
      )}
    </div>
  );
}

function BlockView({ block, spacious = false }: { block: Block; spacious?: boolean }) {
  switch (block.type) {
    case 'section': {
      const center = block.align === 'center';
      return (
        <section
          id={block.id}
          className={`${spacious ? '' : 'py-7'} ${center ? 'mx-auto text-center' : ''} max-w-[700px]`}
        >
          <Heading block={block} center={center} size={spacious ? 'text-[26px]' : undefined} />
          <Prose body={block.body} />
        </section>
      );
    }

    case 'panels': {
      const tints = ['tint-green', 'tint-blue', 'bg-card'];
      return (
        <section
          className={`grid ${spacious ? 'gap-5' : 'gap-4'} ${block.panels.length > 1 ? 'md:grid-cols-2' : ''} ${block.panels.length > 2 ? 'lg:grid-cols-3' : ''}`}
        >
          {block.panels.map((panel, index) => (
            <div
              key={index}
              className={`${shell} ${tints[index % 3]} ${spacious ? 'p-8 sm:p-10' : 'p-7 sm:p-8'}`}
            >
              <Heading block={panel} size={spacious ? 'text-[22px]' : 'text-[20px]'} />
              <Prose body={panel.body} compact={!spacious} />
            </div>
          ))}
        </section>
      );
    }

    case 'steps': {
      const titlesOnly = block.steps.every((step) => !step.text);
      // Sans texte d'accompagnement, les étapes tiennent en cartes, sur deux
      // colonnes : les intitulés sont longs, une rangée les serrerait trop.
      const grid = titlesOnly && block.steps.length >= 4;
      const cols = 'sm:grid-cols-2';
      return (
        <section className={`${shell} tint-both ${spacious ? 'p-8 sm:p-10' : 'p-7 sm:p-9'}`}>
          <Heading block={block} size={spacious ? 'text-[26px]' : undefined} />
          <ol className={`grid ${spacious ? 'mt-7 gap-3.5' : 'mt-6 gap-3'} ${grid ? cols : ''}`}>
            {block.steps.map((step, index) => (
              <li
                key={step.title}
                className={`rounded-2xl border border-edge bg-card ${
                  grid
                    ? `flex flex-col gap-2.5 ${spacious ? 'p-5' : 'p-4.5'}`
                    : `flex items-baseline gap-3 ${spacious ? 'px-5 py-4.5' : 'px-4 py-3.5'}`
                }`}
              >
                <span className={num}>{pad(index)}</span>
                <span className={`text-ink-600 ${spacious ? 'text-[14.5px] leading-[1.6]' : 'text-[13.5px] leading-[1.5]'}`}>
                  <span className={step.text ? 'block font-bold text-ink-900' : grid ? 'font-semibold' : ''}>
                    {step.title}
                  </span>
                  {step.text && <span className="mt-1 block">{step.text}</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      );
    }

    case 'cards': {
      const titled = Boolean(block.title || block.eyebrow);
      const compact = block.cards.every((item) => !item.text);
      const numbered = block.numbered !== false;

      // Carte pleine largeur avec petites cartes : « Nos formes d'intervention ».
      if (compact) {
        return (
          <section className={`${shell} bg-card ${spacious ? 'p-8 sm:p-10' : 'p-7 sm:p-9'}`}>
            <Heading block={block} size={spacious ? 'text-[26px]' : undefined} />
            <ul className={`grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 ${spacious ? 'mt-7' : 'mt-6'}`}>
              {block.cards.map((item, index) => (
                <li
                  key={item.title}
                  className={`relative flex flex-col gap-2 rounded-2xl border border-edge bg-white transition hover:border-leaf-600 ${spacious ? 'p-5.5' : 'p-4.5'}`}
                >
                  {numbered && <span className={num}>{pad(index)}</span>}
                  <span className={`font-bold text-ink-900 ${spacious ? 'text-[15px] leading-[1.4]' : 'text-[14px]'}`}>
                    {item.href ? (
                      <Link href={item.href} className="after:absolute after:inset-0">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      }

      // Cartes-expertises sans titre de section : chaque carte est une grande carte.
      if (!titled) {
        return (
          <section className={`grid md:grid-cols-2 ${spacious ? 'gap-5' : 'gap-4'}`}>
            {block.cards.map((item, index) => (
              <div key={item.title} className={`${shell} bg-card ${spacious ? 'p-8 sm:p-9' : 'p-7'}`}>
                {numbered && <span className={num}>{pad(index)}</span>}
                <h2
                  className={`mt-2.5 font-bold tracking-[-0.01em] text-ink-900 ${spacious ? 'text-[20px]' : 'text-[18px]'}`}
                >
                  {item.title}
                </h2>
                <p
                  className={`text-ink-600 ${spacious ? 'mt-3 text-[15px] leading-[1.75]' : 'mt-2.5 text-[13.5px] leading-[1.65]'}`}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </section>
        );
      }

      // Références de l'accueil : quatre petites cartes sous le titre, sans numéro.
      if (!numbered) {
        return (
          <section className={spacious ? '' : 'pt-20'}>
            <Heading block={block} size="text-[26px]" />
            <ul className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {block.cards.map((item) => (
                <li key={item.title} className={`${card} bg-white p-5`}>
                  <span className="block text-[14px] font-bold text-ink-900">{item.title}</span>
                  <span className="mt-1.5 block text-[12.5px] leading-[1.55] text-ink-600">{item.text}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      }

      // Missions de l'accueil : titre collant à gauche, liste numérotée à droite.
      return (
        <section
          className={`grid items-start gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14 ${spacious ? '' : 'pt-20'}`}
        >
          <div className="lg:sticky lg:top-24">
            <Heading block={block} size="text-[30px]" />
          </div>
          <ul className="flex flex-col">
            {block.cards.map((item, index) => (
              <li
                key={item.title}
                className="group relative grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-2xl px-4 py-7 transition-all duration-500 ease-out hover:bg-leaf-50 hover:shadow-[0_10px_30px_-12px_rgba(55,158,50,0.35)] sm:grid-cols-[56px_1fr_auto] sm:gap-5"
              >
                {/* Filet droit sous la ligne, en retrait des coins arrondis ; il s'efface au survol. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 bottom-0 h-px bg-edge transition-opacity duration-500 group-hover:opacity-0"
                />
                {/* Goutte verte à gauche, qui s'épanouit doucement au survol. */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-4 left-1.5 top-4 w-1.5 origin-center scale-y-0 rounded-full bg-leaf-400 opacity-0 transition-all duration-500 ease-out group-hover:scale-y-100 group-hover:opacity-100"
                />
                <span className={`${num} text-[13px] transition-colors duration-500 group-hover:text-leaf-600`}>
                  {pad(index)}
                </span>
                <span>
                  <span className="block text-[17px] font-bold tracking-[-0.01em] text-ink-900 transition-colors duration-500 group-hover:text-leaf-700">
                    {item.href ? (
                      <Link href={item.href} className="after:absolute after:inset-0">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </span>
                  <span className="mt-1.5 block text-[13px] leading-[1.55] text-ink-600">{item.text}</span>
                </span>
                {item.href && (
                  <span
                    aria-hidden="true"
                    className="text-[13px] font-extrabold text-sea-500 transition-transform duration-500 ease-out group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case 'faq':
      return (
        <section className={`grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-14 ${spacious ? '' : 'pt-20'}`}>
          <Heading block={block} size="text-[26px]" />
          <div className="flex flex-col gap-3">
            {block.items.map((item, index) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} id={`faq-${index}`} />
            ))}
          </div>
        </section>
      );

    case 'quote':
      return (
        <section className={`${shell} tint-both px-8 py-9 text-center sm:px-11`}>
          <p className="mx-auto max-w-[760px] font-display text-[22px] leading-[1.3] tracking-[-0.02em] text-ink-900 text-balance sm:text-[26px]">
            {block.text}
          </p>
          {block.source && (
            <p className="mt-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">{block.source}</p>
          )}
        </section>
      );

    case 'image': {
      const width = {
        small: 'max-w-[33%]',
        medium: 'max-w-[66%]',
        full: 'max-w-full',
      }[block.size ?? 'medium'];
      const align = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' }[block.align ?? 'center'];
      return (
        <figure className={`${width} ${align} rounded-3xl border border-edge bg-white p-5`}>
          <ContentImage
            url={block.url}
            alt={block.alt}
            width={block.width ?? 1200}
            height={block.height ?? 800}
            sizes="(min-width: 1140px) 1100px, 100vw"
            className="h-auto w-full rounded-2xl"
          />
          {block.caption && <figcaption className="mt-2 text-xs text-ink-500">{block.caption}</figcaption>}
        </figure>
      );
    }

    case 'logos': {
      const titled = Boolean(block.title || block.eyebrow || block.lead);
      const groups = block.groups ?? [];
      return (
        <section className={titled && !spacious ? 'pt-20' : ''}>
          <Heading block={block} size="text-[26px]" />
          {/* Une seule grande carte : les familles de clients, puis les logos. */}
          <div className={`${shell} bg-card p-5 sm:p-7 ${titled ? 'mt-6' : ''}`}>
            {groups.length > 0 && (
              <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {groups.map((group) => (
                  <li key={group.title} className="rounded-2xl border border-edge bg-white p-5">
                    <span className="block text-[14px] font-bold text-ink-900">{group.title}</span>
                    <span className="mt-1.5 block text-[12.5px] leading-[1.55] text-ink-600">{group.text}</span>
                  </li>
                ))}
              </ul>
            )}
            {block.caption && (
              <p className={`${eyebrow} ${groups.length > 0 ? 'mt-8 border-t border-edge pt-7' : ''} text-center`}>
                {block.caption}
              </p>
            )}
            <ul
              className={`grid grid-cols-3 justify-items-center gap-y-8 sm:grid-cols-4 lg:grid-cols-7 ${
                block.caption ? 'mt-6' : groups.length > 0 ? 'mt-8 border-t border-edge pt-8' : ''
              }`}
            >
              {/* Les logos des parcs sont pour la plupart en hauteur : chacun a une
                  boîte carrée de 104 px et s'y inscrit sans déformation. Sept
                  colonnes sur grand écran : les quatorze logos remplissent deux
                  rangées sur toute la largeur. */}
              {block.logos.map((logo) => (
                <li key={logo.url} className="aspect-square w-full max-w-26">
                  <ContentImage
                    url={logo.url}
                    alt={logo.alt}
                    title={logo.alt}
                    sizes="(min-width: 640px) 104px, 28vw"
                    fallbackWidth={208}
                    className="h-full w-full object-contain"
                  />
                </li>
              ))}
            </ul>
            {block.partners && block.partners.length > 0 && (
              <>
                <p className={`${eyebrow} mt-8 border-t border-edge pt-7 text-center`}>Partenaires</p>
                {/* Grille à colonnes égales : le même écart entre chaque partenaire,
                    quelle que soit la largeur de son logo. */}
                <ul className="mt-6 grid grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-3 lg:grid-cols-6">
                  {block.partners.map((partner) => {
                    // Logo si on l'a, sinon le nom ; le tout en lien vers le site.
                    const content = partner.url ? (
                      <span className="block h-20 w-full max-w-36">
                        <ContentImage
                          url={partner.url}
                          alt={partner.alt}
                          title={partner.alt}
                          sizes="(min-width: 640px) 144px, 40vw"
                          fallbackWidth={288}
                          className="h-full w-full object-contain"
                        />
                      </span>
                    ) : (
                      <span className="block rounded-full border border-edge bg-white px-4 py-2 text-[13px] font-bold text-ink-700">
                        {partner.alt}
                      </span>
                    );
                    return (
                      <li key={partner.alt}>
                        {partner.href ? (
                          <a
                            href={partner.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block transition duration-300 hover:-translate-y-0.5 hover:opacity-80"
                          >
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {block.footnote && (
              <p className="mt-8 border-t border-edge pt-5 text-center text-[12.5px] text-ink-500">{block.footnote}</p>
            )}
          </div>
        </section>
      );
    }

    case 'callout': {
      const warning = block.tone === 'warning';
      return (
        <aside
          className={`${shell} ${warning ? 'bg-card' : 'tint-green'} grid items-start gap-5 sm:grid-cols-[auto_1fr] ${spacious ? 'p-8 sm:p-9' : 'p-7 sm:p-8'}`}
        >
          {block.title && (
            <span
              className={`inline-block whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                warning ? 'bg-amber-100 text-amber-900' : 'bg-leaf-100 text-leaf-700'
              }`}
            >
              {block.title}
            </span>
          )}
          <p className={`text-ink-600 ${spacious ? 'text-[15px] leading-[1.75]' : 'text-[13.5px] leading-[1.65]'}`}>
            {block.text}
          </p>
        </aside>
      );
    }

    case 'cta': {
      // Avec un texte sous le titre (fin de l'accueil), la carte prend plus de
      // hauteur et se détache des sections aérées qui la précèdent.
      const tall = Boolean(block.text);
      return (
        <section
          className={`${shell} tint-dark relative overflow-hidden border-0 text-center ${
            tall ? `px-7 py-14 sm:px-14 ${spacious ? '' : 'mt-16'}` : 'px-7 py-10 sm:px-11'
          }`}
        >
          <Backdrop compact />
          <div className="relative">
            {block.eyebrow && <p className={`${eyebrow} text-leaf-200!`}>{block.eyebrow}</p>}
            <h2
              className={`mx-auto max-w-[760px] font-display leading-snug tracking-[-0.02em] text-card text-balance ${
                tall ? 'text-[26px] sm:text-[30px]' : block.eyebrow ? 'mt-3 text-[24px]' : 'text-[19px] sm:text-[21px]'
              }`}
            >
              {block.title}
            </h2>
            {block.text && (
              <p className="mx-auto mt-3 max-w-[480px] text-[14.5px] leading-[1.6] text-card/75">{block.text}</p>
            )}
            <div className={`flex flex-col justify-center gap-3 sm:flex-row ${tall ? 'mt-6' : 'mt-5'}`}>
              <Link href={block.primary.href} className={btnLight}>
                {block.primary.label}
              </Link>
              {block.secondary && (
                <a
                  href={block.secondary.href}
                  className={btnGhostDark}
                >
                  {block.secondary.label}
                </a>
              )}
            </div>
          </div>
        </section>
      );
    }

    case 'links': {
      const groups = new Map<string, typeof block.links>();
      for (const link of block.links) {
        const key = link.group ?? '';
        groups.set(key, [...(groups.get(key) ?? []), link]);
      }
      return (
        <section className={`${shell} bg-card ${spacious ? 'p-8 sm:p-10' : 'p-7 sm:p-9'}`}>
          <Heading block={block} size={spacious ? 'text-[26px]' : undefined} />
          <div className={`grid gap-3.5 md:grid-cols-2 ${spacious ? 'mt-7' : 'mt-6'}`}>
            {[...groups.entries()].map(([group, links]) => (
              <div key={group} className={`rounded-2xl border border-edge bg-white ${spacious ? 'p-6' : 'p-5'}`}>
                {group && <p className={`${eyebrow} mb-3`}>{group}</p>}
                <ul className={spacious ? 'space-y-4' : 'space-y-3'}>
                  {links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] font-bold text-ink-900 underline decoration-leaf-400 underline-offset-4 hover:text-leaf-700"
                      >
                        {link.label}
                      </a>
                      {link.text && <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{link.text}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      );
    }
  }
}

/**
 * Question dépliable. La réponse s'ouvre en douceur (transition de hauteur via
 * `grid-template-rows`), le chevron pivote et la carte se teinte de vert.
 */
function FaqItem({ question, answer, id }: { question: string; answer: string; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border bg-white transition-all duration-500 ease-out ${
        open
          ? 'border-leaf-200 bg-leaf-50 shadow-[0_10px_30px_-12px_rgba(55,158,50,0.35)]'
          : 'border-edge hover:border-leaf-200 hover:bg-leaf-50'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-[14.5px] font-bold text-ink-900"
      >
        {question}
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-out ${
            open ? 'rotate-180 bg-leaf-600 text-white' : 'bg-leaf-50 text-leaf-600'
          }`}
        >
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p
            className={`px-5 pb-5 text-[13.5px] leading-[1.6] text-ink-600 transition-opacity duration-500 ${open ? 'opacity-100 delay-100' : 'opacity-0'}`}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function Prose({ body, compact = false }: { body: Rich[]; compact?: boolean }) {
  if (body.length === 0) return null;
  const text = compact ? 'text-[13.5px] leading-[1.7]' : 'text-[16px] leading-[1.8]';
  return (
    <div className={`text-ink-600 ${compact ? 'mt-3.5 space-y-3.5' : 'mt-5 space-y-5'} ${text}`}>
      {body.map((part, index) => {
        if (typeof part === 'string') return <p key={index}>{part}</p>;

        if ('h3' in part) {
          return (
            <h3
              key={index}
              className={`font-bold text-ink-900 ${compact ? 'pt-2 text-[15px]' : 'pt-3 text-[16.5px]'}`}
            >
              {part.h3}
            </h3>
          );
        }

        const listSpacing = compact ? 'space-y-1 pl-[18px]' : 'space-y-2.5 pl-[22px]';

        if ('ordered' in part) {
          return (
            <ol key={index} className={`list-decimal ${listSpacing} marker:text-leaf-600`}>
              {part.ordered.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          );
        }

        return (
          <ul key={index} className={`list-disc ${listSpacing} marker:text-leaf-600`}>
            {part.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
