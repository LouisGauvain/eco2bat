'use client';

import { useState } from 'react';

import { Field, TextField } from './fields';
import { ImageField } from './ImageField';
import { pathOf, type Page } from '@/content';
import { siteUrl } from '@/content/site';

/**
 * Référencement d'une page : titre et description lus par Google, mots-clés
 * visés, visuel de partage.
 *
 * Le gérant peut désormais les modifier lui-même : les garde-fous sont donc
 * ici — longueurs utiles, aperçu du résultat, et vérification que chaque
 * mot-clé apparaît vraiment dans la page. Un mot-clé qui n'est écrit nulle part
 * ne sert à rien : la balise keywords est ignorée par les moteurs.
 */

const TITLE_IDEAL = 60;
const DESCRIPTION_IDEAL = 155;

export function SeoPanel({ page, onChange }: { page: Page; onChange: (seo: Page['seo']) => void }) {
  const seo = page.seo;
  // Texte brut conservé tel quel : reconstruit depuis la liste, une ligne vide
  // en cours de saisie disparaîtrait sous le curseur.
  const [keywordsText, setKeywordsText] = useState((seo.keywords ?? []).join('\n'));

  const keywords = (seo.keywords ?? []).filter(Boolean);
  const texts = {
    seoTitle: normalize(seo.title),
    description: normalize(seo.description),
    h1: normalize(page.title),
    body: normalize(collectText([page.hero, page.blocks]).join(' ')),
  };

  return (
    <div className="space-y-5">
      <GooglePreview page={page} />

      <div>
        <Field
          label="Titre dans Google"
          value={seo.title}
          maxLength={120}
          onChange={(title) => onChange({ ...seo, title })}
        />
        <Length length={seo.title.length} ideal={TITLE_IDEAL} advice="Placez le mot-clé principal au début, et la ville si elle compte." />
      </div>

      <div>
        <TextField
          label="Description dans Google"
          rows={3}
          value={seo.description}
          maxLength={400}
          onChange={(description) => onChange({ ...seo, description })}
        />
        <Length
          length={seo.description.length}
          ideal={DESCRIPTION_IDEAL}
          advice="Une phrase qui donne envie de cliquer : ce que la page apporte, pour qui, où."
        />
      </div>

      <div>
        <TextField
          label="Mots-clés visés"
          rows={5}
          value={keywordsText}
          placeholder={'audit énergétique La Ciotat\nDPE Marseille'}
          hint="Un par ligne, 5 à 10 par page. Ils ne sont pas affichés : ils servent à vérifier que la page parle bien de ce que les gens cherchent."
          onChange={(text) => {
            setKeywordsText(text);
            const list = text
              .split('\n')
              .map((keyword) => keyword.trim())
              .filter(Boolean)
              .slice(0, 15);
            onChange({ ...seo, keywords: list.length > 0 ? list : undefined });
          }}
        />

        {keywords.length > 0 && (
          <table className="mt-3 w-full text-left text-xs">
            <thead className="text-ink-500">
              <tr>
                <th className="py-1 font-medium">Mot-clé</th>
                <th className="px-1 py-1 text-center font-medium">Titre Google</th>
                <th className="px-1 py-1 text-center font-medium">Description</th>
                <th className="px-1 py-1 text-center font-medium">Titre H1</th>
                <th className="px-1 py-1 text-center font-medium">Texte</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((keyword) => {
                const needle = normalize(keyword);
                return (
                  <tr key={keyword} className="border-t border-ink-100">
                    <td className="py-1.5 pr-2 text-ink-800">{keyword}</td>
                    <Check ok={texts.seoTitle.includes(needle)} />
                    <Check ok={texts.description.includes(needle)} />
                    <Check ok={texts.h1.includes(needle)} />
                    <Check ok={texts.body.includes(needle)} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="space-y-2 border-t border-ink-100 pt-4">
        <p className="text-sm font-medium text-ink-800">Image de partage</p>
        <p className="text-xs text-ink-500">
          Affichée quand la page est partagée (LinkedIn, WhatsApp, e-mail). Recadrée en 1200 × 630.
          Sans image, celle du site est utilisée.
        </p>
        <ImageField
          value={{ url: seo.image ?? '' }}
          onChange={(image) => onChange({ ...seo, image: image.url || undefined })}
        />
      </div>
    </div>
  );
}

function GooglePreview({ page }: { page: Page }) {
  const host = siteUrl.replace(/^https?:\/\//, '');
  const crumbs = page.slug.length > 0 ? ` › ${page.slug.join(' › ')}` : '';

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        Aperçu dans Google
      </p>
      <p className="truncate text-[13px] text-ink-600">
        {host}
        {crumbs}
      </p>
      <p className="mt-0.5 truncate text-[19px] leading-snug text-[#1a0dab]">
        {page.seo.title || 'Titre manquant'}
      </p>
      <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-ink-600">
        {page.seo.description || 'Description manquante : Google choisira un extrait de la page.'}
      </p>
      <p className="mt-2 text-[11px] text-ink-400">{siteUrl}{pathOf(page)}</p>
    </div>
  );
}

function Length({ length, ideal, advice }: { length: number; ideal: number; advice: string }) {
  const tone = length === 0 || length > ideal ? 'text-amber-700' : 'text-ink-500';
  return (
    <p className={`mt-1 text-xs ${tone}`}>
      {length} caractères — idéal : {ideal} au plus
      {length > ideal ? ', Google risque de couper la fin.' : '.'} {advice}
    </p>
  );
}

function Check({ ok }: { ok: boolean }) {
  return (
    <td className={`px-1 py-1.5 text-center ${ok ? 'text-leaf-700' : 'text-ink-300'}`}>
      <span aria-hidden="true">{ok ? '✓' : '—'}</span>
      <span className="sr-only">{ok ? 'présent' : 'absent'}</span>
    </td>
  );
}

/** Comparaison insensible à la casse et aux accents. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Tous les textes visibles d'un contenu, sans les adresses de liens et d'images. */
function collectText(value: unknown, key = ''): string[] {
  if (typeof value === 'string') {
    return ['url', 'href', 'type', 'tone', 'size', 'align', 'id'].includes(key) ? [] : [value];
  }
  if (Array.isArray(value)) return value.flatMap((item) => collectText(item));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([entryKey, item]) => collectText(item, entryKey));
  }
  return [];
}
