import Link from 'next/link';

import type { Block, Rich } from '@/content/types';
import { container } from '@/components/layout/container';

/**
 * Rendu des blocs de contenu.
 *
 * Chaque type de bloc a une et une seule présentation : c'est ce qui garantit
 * qu'une page ajoutée dans six mois ressemblera aux autres, sans avoir à
 * refaire de choix de mise en forme.
 */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'section':
      return (
        <section id={block.id} className={`${container} py-10`}>
          {block.title && <H2>{block.title}</H2>}
          {block.lead && (
            <p className="mt-3 text-lg leading-relaxed text-ink-600">{block.lead}</p>
          )}
          <Prose body={block.body} />
        </section>
      );

    case 'steps':
      return (
        <section className={`${container} py-10`}>
          {block.title && <H2>{block.title}</H2>}
          <ol className="mt-8 space-y-6">
            {block.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-semibold text-leaf-700"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-1 leading-relaxed text-ink-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      );

    case 'cards':
      return (
        <section className="bg-sand-50 py-14">
          <div className={container}>
            {block.title && <H2>{block.title}</H2>}
            {block.lead && (
              <p className="mt-3 text-lg text-ink-600">{block.lead}</p>
            )}
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {block.cards.map((card) => (
                <li
                  key={card.title}
                  className="relative rounded-lg border border-ink-100 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <h3 className="font-display text-xl text-ink-900">
                    {card.href ? (
                      // Lien étendu à toute la carte : la cible reste le titre
                      // pour les lecteurs d'écran, mais toute la surface est
                      // cliquable au doigt.
                      <Link href={card.href} className="after:absolute after:inset-0">
                        {card.title}
                      </Link>
                    ) : (
                      card.title
                    )}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-600">{card.text}</p>
                  {card.href && (
                    <p aria-hidden="true" className="mt-4 text-sm font-semibold text-leaf-700">
                      En savoir plus →
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case 'faq':
      return (
        <section className={`${container} py-10`}>
          {block.title && <H2>{block.title}</H2>}
          <dl className="mt-6 divide-y divide-ink-100 border-y border-ink-100">
            {block.items.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="font-semibold text-ink-900">{item.q}</dt>
                <dd className="mt-2 leading-relaxed text-ink-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case 'callout': {
      const warning = block.tone === 'warning';
      return (
        <div className={`${container} py-6`}>
          <aside
            className={`rounded-lg border-l-4 p-5 ${
              warning
                ? 'border-amber-500 bg-amber-50'
                : 'border-leaf-500 bg-leaf-50'
            }`}
          >
            {block.title && (
              <p className="font-semibold text-ink-900">{block.title}</p>
            )}
            <p className="mt-1 leading-relaxed text-ink-700">{block.text}</p>
          </aside>
        </div>
      );
    }

    case 'cta':
      return (
        <section className={`${container} py-14`}>
          <div className="rounded-xl bg-ink-800 px-6 py-10 text-center sm:px-12">
            <h2 className="font-display text-2xl text-white sm:text-3xl">
              {block.title}
            </h2>
            {block.text && (
              <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-ink-200">
                {block.text}
              </p>
            )}
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={block.primary.href}
                className="rounded-md bg-leaf-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-leaf-600"
              >
                {block.primary.label}
              </Link>
              {block.secondary && (
                <a
                  href={block.secondary.href}
                  className="rounded-md border border-ink-400 px-6 py-3 font-semibold text-white transition-colors hover:border-white"
                >
                  {block.secondary.label}
                </a>
              )}
            </div>
          </div>
        </section>
      );
  }
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl leading-snug text-ink-900 sm:text-3xl">
      {children}
    </h2>
  );
}

function Prose({ body }: { body: Rich[] }) {
  return (
    <div className="mt-5 space-y-4 text-[1.0625rem] leading-relaxed text-ink-700">
      {body.map((part, index) => {
        if (typeof part === 'string') return <p key={index}>{part}</p>;

        if ('h3' in part) {
          return (
            <h3 key={index} className="pt-3 font-semibold text-ink-900">
              {part.h3}
            </h3>
          );
        }

        if ('ordered' in part) {
          return (
            <ol key={index} className="list-decimal space-y-2 pl-6 marker:text-leaf-600">
              {part.ordered.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          );
        }

        return (
          <ul key={index} className="list-disc space-y-2 pl-6 marker:text-leaf-600">
            {part.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
