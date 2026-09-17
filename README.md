# ECO2BAT — refonte du site

Site vitrine et back-office du bureau d'études ECO2BAT (La Ciotat).
Next.js 15 (App Router, TypeScript) exporté en statique sur Firebase Hosting.

Le périmètre et les décisions éditoriales viennent de `eco2bat-audit-contenu.xlsx`
(audit du site WordPress existant, relevé du 25/08/2026).

---

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis coller la config Firebase
npm run dev                  # http://localhost:3000
```

## Mise en place Firebase

1. **Créer le projet** dans la console Firebase, puis une application Web.
   Coller la configuration du SDK dans `.env.local`, et l'ID du projet dans
   `.firebaserc`.
2. **Activer Firestore** (mode production, région `europe-west`) et
   **Authentication › E-mail/mot de passe**.
3. **Créer le compte** dans Authentication › Users. C'est tout : ce compte
   ouvre le back-office. Aucune inscription n'est possible depuis le site,
   les comptes se créent uniquement ici.
4. **Déployer les règles** : `npm run deploy:rules`. À faire avant la première
   utilisation, sinon toutes les écritures seront refusées.

5. **Importer les pages** : se connecter à `/admin/contenu/` et cliquer
   « Importer les pages ». Tant que la collection `pages` est vide, le site est
   construit à partir des fichiers de `src/content/pages/`.

### Publication depuis le back-office

Le bouton « Publier » relance le build et le déploiement. Mise en place, une
fois :

1. **Forfait Blaze** sur le projet Firebase (requis par les fonctions Cloud).
2. **Jeton GitHub** : fine-grained token limité au dépôt, permission
   « Actions » en lecture et écriture, puis
   `firebase functions:secrets:set GITHUB_TOKEN`.
3. **Déployer les fonctions** : `cd functions && npm install && cd .. && npm run deploy:functions`.
4. **Secrets du dépôt GitHub** (Settings › Secrets and variables › Actions) :
   les variables `NEXT_PUBLIC_*` de `.env.local`, et `FIREBASE_SERVICE_ACCOUNT`
   (clé JSON d'un compte de service ayant le rôle « Administrateur Firebase
   Hosting »). La liste complète est en tête de `.github/workflows/publish.yml`.

Le reste de l'application ne parle à Firebase que depuis le navigateur.

### Émulateurs

```bash
npm run emulators                                   # dans un terminal
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true npm run dev # dans un autre
```

Pour tester le rendu réel de Hosting (redirections 301, en-têtes, 404) :

```bash
npm run build
npx firebase emulators:start --only hosting   # http://localhost:5055
```

## Déploiement

En temps normal, le gérant publie depuis le back-office (bouton « Publier ») :
le workflow `.github/workflows/publish.yml` construit le site à partir de
Firestore, ajoute les redirections du back-office à `firebase.json`
(`scripts/sync-redirects.mjs`) et déploie.

```bash
npm run deploy             # build + déploiement à la main (sans les redirections du back-office)
npm run deploy:rules       # règles et index Firestore
npm run deploy:functions   # fonctions de publication
```

Le build produit un dossier `out/` entièrement statique, servi par Firebase
Hosting. Il n'y a pas de serveur applicatif.

## Architecture

Le site est **entièrement statique**. Il n'y a pas de serveur applicatif :
le navigateur parle directement à Firebase, et ce sont les règles Firestore
qui décident de tout. Seule exception : deux fonctions Cloud (`functions/`)
qui déclenchent la publication, parce qu'elle demande un jeton GitHub.

```
src/
  content/          Modèle de contenu
    site.ts         Coordonnées, zone d'intervention, menu d'origine
    types.ts        Modèle de page et de blocs
    schema.ts       Validation Zod d'une page (back-office et build)
    pages/          Pages d'origine, copiées dans Firestore à l'import
    index.ts        Fonctions sur les pages : menu, fil d'Ariane, import
  app/
    (site)/         Site public — en-tête, pied de page, contenu
      [...slug]/    Route générique : une page publiée = une URL
      contact/      Page et formulaire qualifiant
    admin/          Back-office (demandes, contenu, aperçu, entreprise, paramètres)
  components/
    admin/          Connexion, demandes, éditeur de pages, infos entreprise
    content/        Rendu des blocs de page
    layout/         En-tête, pied de page, bandeau, largeur commune
  lib/
    firebase/       SDK client (Auth + Firestore), config, émulateurs
    leads.ts        Types, constantes et schéma Zod des demandes
    leads-client.ts Lecture et écriture Firestore des demandes
    settings.ts     Réglages pilotés depuis le back-office
    pages-source.ts Lecture des pages dans Firestore, au build
    content-store.ts Écriture des pages et redirections depuis le back-office
    publish.ts      Bouton « Publier » → fonction Cloud → GitHub Actions
    use-content.ts  Coordonnées de l'entreprise et état de connexion
    rich-text.ts    Corps d'une section ↔ texte simple, pour l'éditeur
    seo.ts          Métadonnées et données structurées
```

### Où se modifie quoi

| Ce qu'on veut changer | Où |
|---|---|
| Le texte, les images, le titre et la description Google d'une page | back-office `/admin/contenu/`, puis « Publier » |
| Les mots-clés d'une page | back-office, section « Référencement » (vérifie leur présence dans la page) |
| Créer, dupliquer, supprimer une page, changer son adresse | back-office — les redirections 301 sont créées automatiquement |
| Le menu (pages affichées, ordre) | back-office : case « Afficher dans le menu », flèches de la liste |
| Téléphone, adresse, zone d'intervention | back-office `/admin/entreprise/` (valeurs d'origine : `src/content/site.ts`) |
| Une redirection écrite à la main | `firebase.json` (section `redirects`) |
| Un nouveau type de bloc | `content/types.ts`, `content/schema.ts`, `components/content/Blocks.tsx`, `components/admin/BlockEditor.tsx` |
| Les en-têtes HTTP, le cache | `firebase.json` (section `headers`) |
| Qui peut lire ou écrire quoi | `firestore.rules` |
| Un bandeau, le délai de réponse annoncé | back-office `/admin/parametres/` |

**Firestore est la source, le build la met en ligne.** Les pages vivent dans
la collection `pages`. Enregistrer dans le back-office ne change pas le site
en ligne : l'aperçu (`/admin/apercu/?id=…`) montre la version enregistrée, et
« Publier » reconstruit le HTML statique à partir de la base. Ce que lit Google
est donc toujours exactement ce qui a été publié — titre, description, texte,
menu et sitemap compris.

Le build s'arrête sur une page invalide plutôt que de mettre en ligne une page
à trous : le back-office affiche alors « Dernière publication échouée », avec
le lien vers le journal GitHub.

L'accueil et la page Contact ont une route dédiée dans `src/app` : leur
adresse est fixe et ils ne peuvent être ni supprimés ni dépubliés.
