'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  DEADLINES,
  LEAD_STATUSES,
  PRESTATIONS,
  PROPERTY_TYPES,
  labelOf,
  type Lead,
  type LeadStatus,
} from '@/lib/leads';
import { deleteLead, listLeads, updateLead } from '@/lib/leads-client';

/**
 * Boîte de réception des demandes.
 *
 * Une seule personne l'utilise, souvent depuis un téléphone entre deux
 * chantiers : chaque demande tient dans une carte, avec le téléphone
 * cliquable et un changement de statut en un geste.
 *
 * Le filtrage se fait en mémoire : le volume attendu est de quelques dizaines
 * de demandes par an, une requête par filtre serait du gaspillage.
 */
export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadStatus | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    try {
      setLeads(await listLeads());
      setState('ready');
    } catch (error) {
      console.error('[admin] lecture des demandes impossible', error);
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Mise à jour optimiste : l'interface réagit immédiatement, puis on écrit.
   * En cas d'échec, on recharge pour ne pas laisser un état mensonger à
   * l'écran.
   */
  async function patch(id: string, changes: { status?: LeadStatus; note?: string }) {
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, ...changes } : lead)),
    );
    try {
      await updateLead(id, changes);
    } catch (error) {
      console.error('[admin] enregistrement impossible', error);
      await load();
    }
  }

  async function remove(id: string) {
    setLeads((current) => current.filter((lead) => lead.id !== id));
    try {
      await deleteLead(id);
    } catch (error) {
      console.error('[admin] suppression impossible', error);
      await load();
    }
  }

  if (state === 'loading') {
    return <p className="text-ink-400">Chargement des demandes…</p>;
  }

  if (state === 'error') {
    return (
      <p className="rounded-md bg-red-50 p-4 text-sm text-red-900">
        Les demandes n’ont pas pu être chargées. Vérifiez votre connexion, puis
        rechargez la page.
      </p>
    );
  }

  const visible = filter ? leads.filter((lead) => lead.status === filter) : leads;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
          <FilterButton active={!filter} onClick={() => setFilter(null)}>
            Toutes ({leads.length})
          </FilterButton>
          {LEAD_STATUSES.map((status) => {
            const count = leads.filter((lead) => lead.status === status.value).length;
            return (
              <FilterButton
                key={status.value}
                active={filter === status.value}
                onClick={() => setFilter(status.value)}
              >
                {status.label} ({count})
              </FilterButton>
            );
          })}
        </nav>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-ink-200 bg-white p-10 text-center text-ink-500">
          Aucune demande {filter ? 'avec ce statut' : 'pour le moment'}.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onPatch={patch} onRemove={remove} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-ink-700 text-white'
          : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
      }`}
    >
      {children}
    </button>
  );
}

function LeadCard({
  lead,
  onPatch,
  onRemove,
}: {
  lead: Lead;
  onPatch: (id: string, changes: { status?: LeadStatus; note?: string }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [note, setNote] = useState(lead.note ?? '');
  const [noteSaved, setNoteSaved] = useState(false);

  const created = new Date(lead.createdAt);
  const urgent = lead.deadline === 'urgent' && lead.status === 'nouveau';

  return (
    <li
      className={`rounded-lg border bg-white p-5 ${
        urgent ? 'border-amber-400' : 'border-ink-200'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink-900">{lead.name}</h2>
          <p className="mt-1 text-sm text-ink-500">
            <time dateTime={lead.createdAt}>
              {created.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
            {' · '}
            {labelOf(DEADLINES, lead.deadline)}
          </p>
        </div>

        <select
          value={lead.status}
          aria-label={`Statut de la demande de ${lead.name}`}
          onChange={(event) => {
            void onPatch(lead.id, { status: event.target.value as LeadStatus });
          }}
          className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-800"
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Row label="Prestation">{labelOf(PRESTATIONS, lead.prestation)}</Row>
        <Row label="Type de bien">{labelOf(PROPERTY_TYPES, lead.propertyType)}</Row>
        <Row label="Commune">{lead.city}</Row>
        <Row label="Téléphone">
          {lead.phone ? (
            <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="text-leaf-700 underline">
              {lead.phone}
            </a>
          ) : (
            <span className="text-ink-400">non renseigné</span>
          )}
        </Row>
        <Row label="E-mail">
          <a href={`mailto:${lead.email}`} className="text-leaf-700 underline">
            {lead.email}
          </a>
        </Row>
        <Row label="Newsletter">
          {lead.newsletter ? (
            <span className="font-semibold text-leaf-700">accepte les actualités</span>
          ) : (
            <span className="text-ink-400">non</span>
          )}
        </Row>
      </dl>

      {lead.message && (
        <p className="mt-4 whitespace-pre-line rounded-md bg-ink-50 p-4 text-sm leading-relaxed text-ink-700">
          {lead.message}
        </p>
      )}

      <div className="mt-4">
        <label
          htmlFor={`note-${lead.id}`}
          className="text-xs font-semibold uppercase tracking-wide text-ink-400"
        >
          Note interne
        </label>
        <textarea
          id={`note-${lead.id}`}
          value={note}
          rows={2}
          onChange={(event) => {
            setNote(event.target.value);
            setNoteSaved(false);
          }}
          onBlur={() => {
            if (note === (lead.note ?? '')) return;
            void onPatch(lead.id, { note: note.slice(0, 2000) }).then(() =>
              setNoteSaved(true),
            );
          }}
          placeholder="Devis envoyé le…, rappeler après le 12, etc."
          className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
        />
        {noteSaved && <p className="mt-1 text-xs text-leaf-700">Note enregistrée.</p>}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            // Suppression définitive : elle sert aussi à honorer une demande
            // d'effacement au titre du RGPD, donc pas de corbeille.
            if (!confirm(`Supprimer définitivement la demande de ${lead.name} ?`)) return;
            void onRemove(lead.id);
          }}
          className="text-sm text-ink-400 underline underline-offset-4 hover:text-red-700"
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-ink-400">{label} :</dt>
      <dd className="text-ink-800">{children}</dd>
    </div>
  );
}
