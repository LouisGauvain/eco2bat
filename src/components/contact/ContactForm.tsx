'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

import { hasCookieConsent } from '@/components/layout/CookieBanner';
import { useCompany } from '@/lib/use-content';
import { createLead } from '@/lib/leads-client';
import { DEADLINES, leadSchema, PRESTATIONS, prestationForPath, PROPERTY_TYPES } from '@/lib/leads';

/**
 * Formulaire qualifiant, habillé d'après la maquette « Contact ».
 *
 * Chaque champ existe pour une raison : pouvoir répondre par une orientation
 * et un devis plutôt que par une demande d'informations. Le site étant
 * statique, la demande part directement du navigateur vers Firestore ; la
 * validation qui fait autorité est dans `firestore.rules`.
 */

/** Un humain met plus de trois secondes à remplir sept champs. */
const MIN_FILL_MS = 3000;

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm() {
  const site = useCompany();
  // Le formulaire s'ouvre par-dessus la page courante : depuis une page de
  // mission, le besoin est déjà connu et le champ arrive rempli.
  const prestation = prestationForPath(usePathname());
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mountedAt = useRef(0);
  const alertRef = useRef<HTMLDivElement>(null);
  // Pré-coché si le visiteur a déjà accepté la newsletter dans le bandeau
  // cookies ; il reste libre de décocher.
  const [newsletter, setNewsletter] = useState(false);

  useEffect(() => {
    mountedAt.current = Date.now();
    setNewsletter(hasCookieConsent('newsletter'));
  }, []);

  useEffect(() => {
    if (status === 'error' || status === 'success') alertRef.current?.focus();
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    // Champ appât : rempli, c'est un robot. On affiche un succès sans rien enregistrer.
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
      newsletter: form.get('newsletter') === 'on',
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
        site.responseTime
          ? `Merci, votre demande est enregistrée. Nous vous répondons ${site.responseTime}.`
          : 'Merci, votre demande est enregistrée. Nous vous répondons rapidement.',
      );
    } catch (error) {
      console.error('[contact] échec d’enregistrement de la demande', error);
      setStatus('error');
      setMessage(
        `Votre demande n’a pas pu être enregistrée. Vous pouvez nous joindre directement au ${site.contact.phone}.`,
      );
    }
  }

  if (status === 'success') {
    return (
      <div ref={alertRef} tabIndex={-1} role="status" className="rounded-2xl border border-edge bg-white p-6">
        <p className="font-display text-xl text-ink-900">Demande envoyée</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{message}</p>
        <p className="mt-4 text-[13px] text-ink-600">
          Besoin d’une réponse plus rapide ?{' '}
          <a href={`tel:${site.contact.phoneE164}`} className="font-bold text-ink-900 underline decoration-leaf-400 underline-offset-4">
            {site.contact.phone}
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="societe">Société</label>
        <input id="societe" name="societe" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && (
        <div ref={alertRef} tabIndex={-1} role="alert" className="rounded-xl bg-red-50 p-3 text-[13px] text-red-900">
          {message}
        </div>
      )}

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Nom" name="name" error={errors.name}>
          <input id="name" name="name" type="text" required autoComplete="name" placeholder="Votre nom" className={inputClass} />
        </Field>
        <Field label="Téléphone" name="phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="06 …" className={inputClass} />
        </Field>
      </div>

      <Field label="Email" name="email" error={errors.email}>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" className={inputClass} />
      </Field>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Votre besoin" name="prestation" error={errors.prestation}>
          <select id="prestation" name="prestation" required defaultValue={prestation} className={inputClass}>
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
        <Field label="Type de bien" name="propertyType" error={errors.propertyType}>
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

      <Field label="Commune du bien" name="city" error={errors.city}>
        <input id="city" name="city" type="text" required placeholder="La Ciotat, Cassis…" className={inputClass} />
      </Field>

      {/* Groupe de radios : un <label> ne peut pas étiqueter plusieurs champs,
          c'est <fieldset>/<legend> qui porte l'intitulé. Les radios étant en
          sr-only, le focus clavier doit se voir sur le <label> qui les porte. */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-xs font-bold text-ink-900">Échéance</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {DEADLINES.map((item) => (
            <label
              key={item.value}
              className="cursor-pointer rounded-xl border border-edge bg-white px-3.5 py-2 text-[13px] text-ink-700 transition has-checked:border-leaf-600 has-checked:bg-leaf-50 has-checked:font-bold has-checked:text-leaf-800 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf-600"
            >
              <input
                type="radio"
                name="deadline"
                value={item.value}
                required
                className="sr-only"
                aria-describedby={errors.deadline ? 'deadline-error' : undefined}
              />
              {item.label}
            </label>
          ))}
        </div>
        {errors.deadline && (
          <p id="deadline-error" className="text-[13px] text-red-700" role="alert">
            {errors.deadline}
          </p>
        )}
      </fieldset>

      <Field label="Message" name="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Décrivez votre projet ou votre patrimoine…"
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 text-[12.5px] leading-relaxed text-ink-600">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-leaf-600" />
          <span>
            J’accepte que mes informations soient utilisées pour répondre à ma demande. Elles ne sont ni
            cédées ni utilisées à d’autres fins.{' '}
            <Link href="/politique-de-confidentialite/" className="underline decoration-leaf-400 underline-offset-4">
              Politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-[13px] text-red-700">{errors.consent}</p>}
      </div>

      <label className="flex items-start gap-3 text-[12.5px] leading-relaxed text-ink-600">
        <input
          type="checkbox"
          name="newsletter"
          checked={newsletter}
          onChange={(e) => setNewsletter(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-leaf-600"
        />
        <span>
          J’accepte de recevoir les actualités d’{site.name} par e-mail (aides, réglementation, conseils).
          Désinscription possible à tout moment.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="tint-dark mt-2 rounded-xl px-6 py-3.5 text-[13.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}
      </button>
    </form>
  );
}

const inputClass =
  'w-full rounded-xl border border-edge bg-white px-3.5 py-2.5 text-[13.5px] text-ink-900 outline-leaf-600 placeholder:text-ink-400';

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = `${name}-error`;

  // Le champ est décrit par son message d'erreur : sans aria-describedby ni
  // aria-invalid, un lecteur d'écran annonce le champ sans jamais dire ce qui
  // ne va pas. Les attributs sont posés ici pour ne pas les répéter huit fois.
  const field =
    error && isValidElement<{ 'aria-describedby'?: string; 'aria-invalid'?: boolean }>(children)
      ? cloneElement(children, { 'aria-describedby': errorId, 'aria-invalid': true })
      : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-bold text-ink-900">
        {label}
      </label>
      {field}
      {error && (
        <p id={errorId} className="text-[13px] text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
