import type { Rich } from '@/content/types';

/**
 * Corps d'un bloc « section » ↔ texte simple.
 *
 * L'éditeur du back-office n'affiche pas une structure de données mais un
 * champ de texte, avec trois conventions empruntées au Markdown :
 *
 *   Un paragraphe est une suite de lignes, séparée de la suivante par une
 *   ligne vide.
 *
 *   ## Un sous-titre
 *   - un point de liste
 *   1. un point de liste numérotée
 *
 * La conversion est réversible : ce qui est écrit ici se relit à l'identique.
 */

export function richToText(body: Rich[]): string {
  return body
    .map((part) => {
      if (typeof part === 'string') return part;
      if ('h3' in part) return `## ${part.h3}`;
      if ('ordered' in part) {
        return part.ordered.map((item, index) => `${index + 1}. ${item}`).join('\n');
      }
      return part.list.map((item) => `- ${item}`).join('\n');
    })
    .join('\n\n');
}

export function textToRich(text: string): Rich[] {
  const body: Rich[] = [];

  for (const rawGroup of text.split(/\n\s*\n/)) {
    const lines = rawGroup
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    // Un groupe mélangeant listes et paragraphes est découpé : chaque forme
    // garde son rendu, plutôt que d'imposer à l'auteur une ligne vide entre
    // deux formes.
    let pending: string[] = [];
    let kind: 'text' | 'list' | 'ordered' = 'text';

    const flush = () => {
      if (pending.length === 0) return;
      if (kind === 'list') body.push({ list: pending });
      else if (kind === 'ordered') body.push({ ordered: pending });
      else body.push(pending.join(' '));
      pending = [];
    };

    for (const line of lines) {
      const heading = /^#{2,3}\s+(.*)$/.exec(line);
      const bullet = /^[-*]\s+(.*)$/.exec(line);
      const ordered = /^\d+[.)]\s+(.*)$/.exec(line);

      if (heading) {
        flush();
        kind = 'text';
        body.push({ h3: (heading[1] ?? '').trim() });
      } else if (bullet) {
        if (kind !== 'list') flush();
        kind = 'list';
        pending.push((bullet[1] ?? '').trim());
      } else if (ordered) {
        if (kind !== 'ordered') flush();
        kind = 'ordered';
        pending.push((ordered[1] ?? '').trim());
      } else {
        if (kind !== 'text') flush();
        kind = 'text';
        pending.push(line);
      }
    }

    flush();
  }

  return body;
}
