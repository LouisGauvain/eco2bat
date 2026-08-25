'use client';

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { container } from '@/components/layout/container';
import { getClientAuth } from '@/lib/firebase/client';

/**
 * Barrière d'accès au back-office.
 *
 * Le site est statique : il n'y a pas de serveur pour refuser une page. Cacher
 * l'interface ici est donc du confort, pas de la sécurité — ce sont les règles
 * Firestore qui protègent réellement les données. Un visiteur non connecté qui
 * atteindrait cette page ne pourrait lire aucune demande.
 *
 * Aucune inscription n'est ouverte : les comptes sont créés à la main dans la
 * console Firebase.
 */
export function AdminGate({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Firebase restaure la session depuis le stockage local : tant que ce
    // n'est pas fait, on n'affiche ni l'interface ni le formulaire, pour
    // éviter que la page de connexion clignote à chaque visite.
    return onAuthStateChanged(getClientAuth(), (current) => {
      setUser(current);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-400">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className={`${container} flex flex-wrap items-center gap-4 py-3`}>
          <p className="font-display text-lg text-ink-900">
            ECO2BAT <span className="text-ink-400">· administration</span>
          </p>

          <nav aria-label="Navigation de l’administration" className="flex gap-1">
            <AdminLink href="/admin/">Demandes</AdminLink>
            <AdminLink href="/admin/contenu/">Contenu</AdminLink>
            <AdminLink href="/admin/entreprise/">Entreprise</AdminLink>
            <AdminLink href="/admin/parametres/">Paramètres</AdminLink>
          </nav>

          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/" className="text-ink-500 hover:text-ink-800">
              Voir le site
            </Link>
            <span className="hidden text-ink-400 sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={() => signOut(getClientAuth())}
              className="rounded border border-ink-200 px-3 py-1.5 font-medium text-ink-700 hover:bg-ink-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className={`${container} py-8`}>
        <h1 className="font-display text-2xl text-ink-900">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
    >
      {children}
    </Link>
  );
}

function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      await signInWithEmailAndPassword(
        getClientAuth(),
        String(form.get('email') ?? ''),
        String(form.get('password') ?? ''),
      );
      // Pas de redirection à faire : `onAuthStateChanged` remonte l'utilisateur
      // et le composant parent affiche l'interface.
    } catch (cause) {
      // Message uniforme : on ne révèle pas si l'adresse existe.
      console.error('[admin] échec de connexion', cause);
      setError('Identifiants incorrects.');
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-24">
      <h1 className="font-display text-2xl text-ink-900">Administration</h1>
      <p className="mt-2 text-sm text-ink-600">
        Accès réservé au gérant du bureau d’études.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-900">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink-800">
            Adresse e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2.5"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-ink-800">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2.5"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-ink-700 px-4 py-3 font-semibold text-white hover:bg-ink-800 disabled:bg-ink-300"
        >
          {pending ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
