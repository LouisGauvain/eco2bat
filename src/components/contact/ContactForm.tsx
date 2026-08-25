'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useCompany } from '@/lib/use-content';
import { createLead } from '@/lib/leads-client';
import { DEADLINES, leadSchema, PRESTATIONS, PROPERTY_TYPES } from '@/lib/leads';

/**
 * Formulaire qualifiant.
 *
 * Chaque champ existe pour une raison : pouvoir répondre par un devis plutôt
 * que par une demande d'informations. Le type de prestation, le type de bien,
 * la commune et l'échéance suffisent à chiffrer la plupart des interventions.
 *
 * Le site étant statique, la demande part directement du navigateur vers
 * Firestore. La validation ci-dessous sert le confort de saisie ; celle qui
 * fait autorité est dans `firestore.rules`, qui refuse tout document mal formé.
 */

/** Un humain met plus de trois secondes à remplir sept champs. */
const MIN_FILL_MS = 3000;

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm() {
  const site = useCompany();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mountedAt = useRef<number>(0);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Déplacer le focus sur le message de retour, sinon un utilisateur au
  // clavier ou au lecteur d'écran ne sait pas que quelque chose s'est passé.
  useEffect(() => {
    if (status === 'error' || status === 'success') alertRef.current?.focus();
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    // Champ appât : présent dans le DOM, masqué visuellement et aux lecteurs
    // d'écran. S'il est rempli, c'est un robot — on affiche un succès pour ne
    // rien lui apprendre, sans rien enregistrer.
    if (form.get('societe')) {
      setStatus('success');
      setMessage('Merci, votre demande a bien été envoyée.');
      return;
    }

    if (Date.now() - mountedAt.current < MIN_FILL_MS) {
      setStatus('error');
      setMessage('Envoi trop rapide. Merci de réessayer.');
      return;
    }

    const parsed = leadSchema.safeParse({
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      prestation: form.get('prestation'),
      propertyType: form.get('propertyType'),
      city: form.get('city'),
      deadline: form.get('deadline'),
      message: form.get('message'),
      consent: form.get('consent') === 'on',
    });

    if (!parsed.success) {
      const found: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? '');
        if (field && !found[field]) found[field] = issue.message;
      }
      setErrors(found);
      setStatus('error');
      setMessage('Certains champs doivent être corrigés.');
      return;
    }

    setErrors({});
    setStatus('sending');

    try {
      await createLead(parsed.data);
      setStatus('success');
      setMessage(
        'Merci, votre demande est enregistrée. Je vous réponds sous 48 heures ouvrées.',
      );
    } catch (error) {
      console.error('[contact] échec d’enregistrement de la demande', error);
      setStatus('error');
      setMessage(
        `Votre demande n’a pas pu être enregistrée. Vous pouvez me joindre directement au ${site.contact.phone}.`,
      );
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={alertRef}
        tabIndex={-1}
        role="status"
        className="rounded-lg border-l-4 border-leaf-500 bg-leaf-50 p-6"
      >
        <p className="font-display text-xl text-ink-900">Demande envoyée</p>
        <p className="mt-2 leading-relaxed text-ink-700">{message}</p>
        <p className="mt-4 text-sm text-ink-600">
          Besoin d’une réponse plus rapide ?{' '}
          <a
            href={`tel:${site.contact.phoneE164}`}
            className="font-semibold underline decoration-leaf-400 underline-offset-4"
          >
            {site.contact.phone}
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Champ appât : invisible pour les humains, rempli par les robots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="societe">Société</label>
        <input id="societe" name="societe" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-900"
        >
          {message}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Votre nom" name="name" required error={errors.name}>
          <input id="name" name="name" type="text" required autoComplete="name" className={inputClass} />
        </Field>

        <Field label="Commune du bien" name="city" required error={errors.city}>
          <input
            id="city"
            name="city"
            type="text"
            required
            placeholder="La Ciotat, Cassis…"
            className={inputClass}
          />
        </Field>

        <Field label="Adresse e-mail" name="email" required error={errors.email}>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </Field>

        <Field label="Téléphone" name="phone" hint="Facultatif" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </Field>

        <Field label="Prestation souhaitée" name="prestation" required error={errors.prestation}>
          <select id="prestation" name="prestation" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choisissez…
            </option>
            {PRESTATIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Type de bien" name="propertyType" required error={errors.propertyType}>
          <select id="propertyType" name="propertyType" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choisissez…
            </option>
            {PROPERTY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Échéance" name="deadline" required error={errors.deadline}>
        <div className="mt-1 flex flex-wrap gap-2">
          {DEADLINES.map((item) => (
            <label
              key={item.value}
              className="cursor-pointer rounded-md border border-ink-200 px-4 py-2 text-sm text-ink-700 transition-colors has-checked:border-leaf-500 has-checked:bg-leaf-50 has-checked:font-semibold has-checked:text-leaf-800"
            >
              <input type="radio" name="deadline" value={item.value} required className="sr-only" />
              {item.label}
            </label>
          ))}
        </div>
      </Field>

      <Field
        label="Décrivez votre projet"
        name="message"
        hint="Surface, année de construction, ce que vous constatez, ce que vous envisagez"
        error={errors.message}
      >
        <textarea id="message" name="message" rows={5} className={inputClass} />
      </Field>

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-600">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-leaf-600" />
          <span>
            J’accepte que mes informations soient utilisées pour répondre à ma
            demande. Elles ne sont ni cédées ni utilisées à d’autres fins.{' '}
            <Link
              href="/politique-de-confidentialite/"
              className="underline decoration-leaf-400 underline-offset-4"
            >
              Politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-sm text-red-700">{errors.consent}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-md bg-leaf-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-ink-300 sm:w-auto"
      >
        {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande'}
      </button>
    </form>
  );
}

const inputClass =
  'mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-ink-900 transition-colors placeholder:text-ink-300 focus:border-leaf-500';

function Field({
  label,
  name,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-ink-800">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-leaf-600">
            *
          </span>
        )}
        {hint && <span className="ml-2 font-normal text-ink-400">{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
