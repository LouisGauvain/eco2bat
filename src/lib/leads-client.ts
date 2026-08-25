'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

import { collections, getDb } from './firebase/client';
import type { Lead, LeadInput, LeadStatus } from './leads';

/**
 * Accès aux demandes de contact depuis le navigateur.
 *
 * Ce que chaque appel a le droit de faire est décidé par `firestore.rules` :
 * le dépôt est public, tout le reste exige d'être authentifié. Une erreur
 * `permission-denied` ici signifie que les règles ont refusé — pas qu'il y a
 * un bug côté client.
 */

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  // `serverTimestamp()` est null le temps que l'écriture revienne du serveur.
  return new Date().toISOString();
}

/** Dépôt d'une demande depuis le formulaire public. */
export async function createLead(input: LeadInput): Promise<string> {
  // Le consentement n'est pas stocké comme booléen : sa preuve est
  // l'horodatage `consentAt`.
  const { consent, ...data } = input;
  void consent;

  const created = await addDoc(collection(getDb(), collections.leads), {
    ...data,
    phone: data.phone || null,
    message: data.message || null,
    status: 'nouveau' satisfies LeadStatus,
    createdAt: serverTimestamp(),
    consentAt: serverTimestamp(),
  });

  return created.id;
}

/** Liste des demandes, les plus récentes d'abord. Réservé au back-office. */
export async function listLeads(): Promise<Lead[]> {
  const snapshot = await getDocs(
    query(
      collection(getDb(), collections.leads),
      orderBy('createdAt', 'desc'),
      limit(300),
    ),
  );

  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      name: data.name,
      email: data.email,
      phone: data.phone ?? '',
      prestation: data.prestation,
      propertyType: data.propertyType,
      city: data.city,
      deadline: data.deadline,
      message: data.message ?? '',
      status: (data.status ?? 'nouveau') as LeadStatus,
      note: data.note ?? '',
      createdAt: toIso(data.createdAt),
      updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
      consentAt: toIso(data.consentAt),
    } satisfies Lead;
  });
}

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; note?: string },
): Promise<void> {
  await updateDoc(doc(getDb(), collections.leads, id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), collections.leads, id));
}
