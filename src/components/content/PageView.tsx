'use client';

import Link from 'next/link';

import { Blocks } from './Blocks';
import { ContentImage } from './ContentImage';
import type { Page } from '@/content/types';
import { Backdrop } from '@/components/layout/Backdrop';
import { btnGhostDark, btnLight, btnPrimary, btnSecondary, container, eyebrow, label } from '@/components/layout/ui';
import { usePageContent } from '@/lib/use-content';

/**
 * Gabarit commun à toutes les pages du site public.
 *
 * Le contenu reçu est celui du dépôt, rendu au build : c'est lui qui part dans
 * le HTML statique. `usePageContent` le remplace après affichage si le
 * back-office a enregistré une version modifiée.
 *
 * Deux heros, repris des maquettes : l'accueil ouvre sur une bande vert
 * profond pleine largeur, titre à gauche et citation négaWatt à droite ; les
 * pages de mission sont alignées à gauche sur le papier, avec l'illustration
 * éventuelle à droite du titre.
 */
export function PageView({ page: source, children }: { page: Page; children?: React.ReactNode }) {
  const page = usePageContent(source);

  if (page.slug.length === 0) {
    return (
      <article>
        <HomeHero page={page} />
        <div className={container}>
          <Blocks blocks={page.blocks} />
          {children}
        </div>
      </article>
    );
  }

  return (
    <article className={container}>
      <MissionHero page={page} />
      <Blocks blocks={page.blocks} spacious />
      {children}
    </article>
  );
}

function HomeHero({ page }: { page: Page }) {
  const hero = page.hero;
  const tagline = hero?.tagline
    ?.split(',')
    .map((term) => term.trim())
    .join(' · ');
  const stats = hero?.stats ?? [];

  return (
    <header className="tint-dark relative flex min-h-[calc(100vh-66px)] flex-col overflow-hidden text-card">
      <Backdrop />
      <div
        className={`${container} relative grid flex-1 items-center gap-10 pb-16 pt-20 sm:pt-24 lg:grid-cols-[1.25fr_1fr] lg:gap-10`}
      >
        <div>
          {hero?.eyebrow && (
            <p className={`${eyebrow} rise text-[11px] text-leaf-200!`}>{hero.eyebrow}</p>
          )}
          {/* Pas d'animation sur le H1 : c'est le plus grand élément de l'écran,
              donc celui que mesure le LCP — une opacité qui monte en 0,7 s
              retarderait d'autant la date de « page affichée ». */}
          <h1 className="mt-5 font-display text-4xl leading-[1.04] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[56px]">
            {page.title}
          </h1>
          {hero && (
            <>
              <p
                className="rise mt-5.5 max-w-[520px] text-[16.5px] leading-[1.65] text-card/78"
                style={{ '--rise-delay': '0.2s' } as React.CSSProperties}
              >
                {hero.lead}
              </p>
              {hero.body?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="rise mt-4 max-w-[520px] text-[15px] leading-relaxed text-card/78"
                  style={{ '--rise-delay': '0.3s' } as React.CSSProperties}
                >
                  {paragraph}
                </p>
              ))}
              {(hero.primary || hero.secondary) && (
                <div
                  className="rise mt-8 flex flex-col gap-3 sm:flex-row"
                  style={{ '--rise-delay': '0.4s' } as React.CSSProperties}
                >
                  {hero.primary && (
                    <Link
                      href={hero.primary.href}
                      className={`${btnLight} group inline-flex items-center justify-center gap-2 duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.25)] hover:brightness-100`}
                    >
                      {hero.primary.label}
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  )}
                  {hero.secondary && (
                    <Link
                      href={hero.secondary.href}
                      className={btnGhostDark}
                    >
                      {hero.secondary.label}
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {hero?.quote && (
          <div
            className="rise rounded-3xl border border-card/18 bg-card/7 p-8 backdrop-blur-sm"
            style={{ '--rise-delay': '0.35s' } as React.CSSProperties}
          >
            {hero.image && (
              <div className="flex justify-center rounded-2xl bg-card p-5">
                <ContentImage
                  url={hero.image.url}
                  alt={hero.image.alt}
                  width={hero.image.width ?? 320}
                  height={hero.image.height ?? 300}
                  sizes="320px"
                  fallbackWidth={640}
                  priority
                  className="w-full max-w-[320px] mix-blend-multiply"
                />
              </div>
            )}
            <p className="mt-5.5 text-[19px] font-semibold leading-[1.4] tracking-[-0.01em] text-balance">
              {hero.quote.text}
            </p>
            {hero.quote.source && (
              <p className={`${label} mt-3 text-[11px] text-leaf-200!`}>{hero.quote.source}</p>
            )}
          </div>
        )}
      </div>

      {(tagline || stats.length > 0) && (
        <div className="relative border-t border-card/15">
          <div className={`${container} flex flex-wrap items-center gap-x-14 gap-y-3 py-5.5`}>
            {tagline && (
              <span className="text-[12.5px] font-bold tracking-[0.04em] text-leaf-200">{tagline}</span>
            )}
            {stats.map((stat) => (
              <span key={stat.label} className="font-mono text-[13px]">
                {stat.value}
                <span className="text-card/80"> · {stat.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function MissionHero({ page }: { page: Page }) {
  const hero = page.hero;
  const image = hero?.image;

  return (
    <header
      className={`pb-14 pt-14 sm:pb-16 sm:pt-20 ${image ? 'grid items-center gap-10 lg:grid-cols-[1fr_auto]' : ''}`}
    >
      <div className="max-w-[760px]">
        {hero?.eyebrow && <p className={`${eyebrow} text-[11px]`}>{hero.eyebrow}</p>}
        <h1 className="mt-4 font-display text-[34px] leading-[1.08] tracking-[-0.02em] text-ink-900 sm:text-[44px]">
          {page.title}
        </h1>
        {hero && (
          <>
            <p className="mt-6 text-[17px] leading-[1.7] text-ink-600">{hero.lead}</p>
            {hero.body?.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-[15.5px] leading-[1.75] text-ink-600">
                {paragraph}
              </p>
            ))}
            <Buttons hero={hero} />
            {hero.tagline && <p className={`${label} mt-5`}>{hero.tagline}</p>}
          </>
        )}
      </div>

      {image && (
        <figure className="justify-self-start rounded-3xl border border-edge bg-white p-5">
          <ContentImage
            url={image.url}
            alt={image.alt}
            width={image.width ?? 230}
            height={image.height ?? 200}
            sizes="230px"
            fallbackWidth={460}
            priority
            className="w-[230px]"
          />
          {image.caption && (
            <figcaption className="mt-2 text-xs text-ink-500">{image.caption}</figcaption>
          )}
        </figure>
      )}
    </header>
  );
}

function Buttons({ hero, className = '' }: { hero: NonNullable<Page['hero']>; className?: string }) {
  if (!hero.primary && !hero.secondary) return null;
  return (
    <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${className}`}>
      {hero.primary && (
        <Link href={hero.primary.href} className={btnPrimary}>
          {hero.primary.label}
        </Link>
      )}
      {hero.secondary && (
        <Link href={hero.secondary.href} className={btnSecondary}>
          {hero.secondary.label}
        </Link>
      )}
    </div>
  );
}
