'use client';

import { useEffect, useState } from 'react';

import { AddButton, Field, ItemControls, TextField, moved, removed, replaced } from './fields';
import { Toast } from './Toast';
import { companySchema, type Company } from '@/content/schema';
import { defaultCompany, getCompany, saveCompany } from '@/lib/content-store';

/**
 * Informations d'entreprise (NAP : nom, adresse, téléphone).
 *
 * Ces valeurs sont reprises telles quelles dans l'en-tête, le pied de page, la
 * page Contact et les données structurées schema.org. En référencement local,
 * leur cohérence compte autant que leur exactitude : elles sont donc saisies
 * une fois, ici, et jamais recopiées ailleurs.
 */

type Status = 'loading' | 'idle' | 'saving' | 'error' | 'success';

export function CompanyForm() {
  const [draft, setDraft] = useState<Company>(defaultCompany);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    getCompany().then((company) => {
      if (!active) return;
      setDraft(company);
      setStatus('idle');
    });
    return () => {
      active = false;
    };
  }, []);

  function update(patch: Partial<Company>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function onSave() {
    const parsed = companySchema.safeParse(draft);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setStatus('error');
      setMessage(`${issue?.path.join(' › ') || 'Valeur'} : ${issue?.message ?? 'invalide'}`);
      return;
    }

    setStatus('saving');
    try {
      await saveCompany(parsed.data);
      setStatus('success');
      setMessage('Informations enregistrées.');
    } catch (error) {
      console.error('[entreprise] enregistrement impossible', error);
      setStatus('error');
      setMessage('Enregistrement impossible. Vérifiez votre connexion.');
    }
  }

  if (status === 'loading') {
    return <p className="text-sm text-ink-400">Chargement…</p>;
  }

  return (
    <div className="space-y-8">
      <Toast message={message} tone={status === 'error' ? 'error' : 'success'} />

      <Card title="Identité">
        <Field
          label="Nom commercial"
          value={draft.name}
          maxLength={80}
          onChange={(name) => update({ name })}
        />
        <Field
          label="Raison sociale"
          value={draft.legalName}
          maxLength={120}
          onChange={(legalName) => update({ legalName })}
        />
        <TextField
          label="Phrase de présentation"
          rows={2}
          value={draft.tagline}
          maxLength={300}
          hint="Reprise dans le pied de page et les données structurées."
          onChange={(tagline) => update({ tagline })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Gérant"
            value={draft.owner.name}
            maxLength={120}
            onChange={(name) => update({ owner: { ...draft.owner, name } })}
          />
          <Field
            label="Fonction"
            value={draft.owner.role}
            maxLength={160}
            onChange={(role) => update({ owner: { ...draft.owner, role } })}
          />
        </div>
      </Card>

      <Card title="Contact">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Téléphone affiché"
            value={draft.contact.phone}
            maxLength={30}
            placeholder="06 15 14 85 08"
            onChange={(phone) => update({ contact: { ...draft.contact, phone } })}
          />
          <Field
            label="Téléphone au format international"
            value={draft.contact.phoneE164}
            maxLength={20}
            placeholder="+33615148508"
            hint="Utilisé par les liens d’appel et les données structurées."
            onChange={(phoneE164) => update({ contact: { ...draft.contact, phoneE164 } })}
          />
        </div>
        <Field
          label="Adresse e-mail"
          value={draft.contact.email}
          maxLength={180}
          onChange={(email) => update({ contact: { ...draft.contact, email } })}
        />
        <Field
          label="Délai de réponse annoncé"
          value={draft.responseTime}
          maxLength={120}
          placeholder="48 heures ouvrées"
          onChange={(responseTime) => update({ responseTime })}
        />
      </Card>

      <Card title="Adresse">
        <Field
          label="Rue"
          value={draft.address.street}
          maxLength={200}
          onChange={(street) => update({ address: { ...draft.address, street } })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Code postal"
            value={draft.address.postalCode}
            maxLength={12}
            onChange={(postalCode) => update({ address: { ...draft.address, postalCode } })}
          />
          <Field
            label="Ville"
            value={draft.address.city}
            maxLength={120}
            onChange={(city) => update({ address: { ...draft.address, city } })}
          />
          <Field
            label="Région"
            value={draft.address.region}
            maxLength={120}
            onChange={(region) => update({ address: { ...draft.address, region } })}
          />
          <Field
            label="Pays (code)"
            value={draft.address.country}
            maxLength={2}
            hint="Deux lettres, par exemple FR."
            onChange={(country) => update({ address: { ...draft.address, country } })}
          />
        </div>
      </Card>

      <Card title="Zone d’intervention">
        <p className="text-sm text-ink-500">
          Départements ou secteurs annoncés, repris dans le pied de page et les
          données structurées.
        </p>
        <div className="space-y-2">
          {draft.serviceArea.map((area, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <Field
                  label={`Secteur ${index + 1}`}
                  value={area}
                  maxLength={80}
                  onChange={(value) =>
                    update({ serviceArea: replaced(draft.serviceArea, index, value) })
                  }
                />
              </div>
              <div className="pb-1">
                <ItemControls
                  label={`le secteur ${index + 1}`}
                  onUp={
                    index > 0
                      ? () => update({ serviceArea: moved(draft.serviceArea, index, index - 1) })
                      : undefined
                  }
                  onDown={
                    index < draft.serviceArea.length - 1
                      ? () => update({ serviceArea: moved(draft.serviceArea, index, index + 1) })
                      : undefined
                  }
                  onRemove={() => update({ serviceArea: removed(draft.serviceArea, index) })}
                />
              </div>
            </div>
          ))}
          <AddButton onClick={() => update({ serviceArea: [...draft.serviceArea, ''] })}>
            Ajouter un secteur
          </AddButton>
        </div>
      </Card>

      <button
        type="button"
        onClick={onSave}
        disabled={status === 'saving'}
        className="rounded-md bg-ink-700 px-5 py-2.5 font-semibold text-white hover:bg-ink-800 disabled:bg-ink-300"
      >
        {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-ink-200 bg-white p-6">
      <h2 className="font-semibold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}
