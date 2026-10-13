'use client';

import { Field, TextField } from './fields';
import { ImageField } from './ImageField';
import { pathOf, type Page } from '@/content';
import { siteUrl } from '@/content/site';

/**
 * Référencement d'une page : titre et description lus par Google, visuel de
 * partage. Le gérant les modifie lui-même : les garde-fous sont donc ici —
 * longueurs utiles et aperçu du résultat.
 */

const TITLE_IDEAL = 60;
const DESCRIPTION_IDEAL = 155;

export function SeoPanel({ page, onChange }: { page: Page; onChange: (seo: Page['seo']) => void }) {
  const seo = page.seo;

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
