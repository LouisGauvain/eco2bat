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

Aucune clé de compte de service n'est nécessaire : l'application ne parle à
Firebase que depuis le navigateur.

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

```bash
npm run deploy         # build + firebase deploy --only hosting
npm run deploy:rules   # règles et index Firestore
```

Le build produit un dossier `out/` entièrement statique, servi par Firebase
Hosting. Il n'y a pas de serveur applicatif.

## Architecture

Le site est **entièrement statique**. Il n'y a pas de serveur applicatif :
le navigateur parle directement à Firebase, et ce sont les règles Firestore
qui décident de tout.

```
src/
  content/          Contenu du site, versionné et typé
    site.ts         Coordonnées, menu, zone d'intervention (source unique)
    types.ts        Modèle de page et de blocs
    pages/          Une entrée par page de l'arborescence cible
    index.ts        Registre : ajouter une page ici suffit à la publier
  app/
    (site)/         Site public — en-tête, pied de page, contenu
      [...slug]/    Route générique pilotée par le registre de contenu
      contact/      Page et formulaire qualifiant
    admin/          Back-office (demandes, contenu, entreprise, paramètres)
  components/
    admin/          Connexion, demandes, éditeur de pages, infos entreprise
    content/        Rendu des blocs de page
    layout/         En-tête, pied de page, bandeau, largeur commune
  lib/
    firebase/       SDK client (Auth + Firestore), config, émulateurs
    leads.ts        Types, constantes et schéma Zod des demandes
    leads-client.ts Lecture et écriture Firestore des demandes
    settings.ts     Réglages pilotés depuis le back-office
    content-store.ts Surcharge du contenu des pages, écrite depuis le back-office
    use-content.ts  Lecture de cette surcharge sur le site public
    rich-text.ts    Corps d'une section ↔ texte simple, pour l'éditeur
    seo.ts          Métadonnées et données structurées
```

### Où se modifie quoi

| Ce qu'on veut changer | Où |
|---|---|
| Le texte d'une page, son titre, sa méta-description | `src/content/pages/*.ts`, ou back-office `/admin/contenu/` |
| Ajouter une page | un fichier dans `pages/`, puis l'inscrire dans `content/index.ts` |
| Téléphone, adresse, zone d'intervention | back-office `/admin/entreprise/` (valeurs d'origine : `src/content/site.ts`) |
| Le menu | `src/content/site.ts` |
| Une redirection depuis l'ancien site | `firebase.json` (section `redirects`) |
| Les en-têtes HTTP, le cache | `firebase.json` (section `headers`) |
| Qui peut lire ou écrire quoi | `firestore.rules` |
| Un bandeau, le délai de réponse annoncé | back-office `/admin/parametres/` |

**Le dépôt reste la source, le back-office la surcharge.** Le référencement est
l'enjeu central de cette refonte : le HTML statique servi aux moteurs est
toujours celui du dépôt, écrit dans des fichiers typés — une page ne peut donc
pas se retrouver sans titre ni méta-description.

Le back-office peut réécrire le texte d'une page (`/admin/contenu/`, ou le
bouton « Modifier cette page » affiché sur le site quand le gérant est
connecté). Cette version est stockée dans la collection Firestore `pages` et
remplace le texte affiché **après le chargement de la page** : le visiteur la
voit tout de suite, l'index de Google la reçoit au déploiement suivant. Même
règle pour les coordonnées de `/admin/entreprise/` : elles suivent partout sur
le site, mais les métadonnées et les données structurées sont générées au build.

La structure — quelles pages existent, à quelle URL, dans quel menu — n'est pas
modifiable en ligne : créer une page, c'est créer une URL et une entrée de
sitemap, et changer une URL demande d'en poser la redirection.

### Statut rédactionnel

Chaque page porte un `status` :

- `todo` — texte à écrire ou à valider avec le client. **Exclue du sitemap et
  rendue en `noindex`** : mieux vaut être absent de l'index que d'y entrer avec
  une page à trous.
- `draft` — rédigée, en attente de relecture client. Indexable.
- `ready` — validée.

## Sécurité

Le site étant statique, **`firestore.rules` est la seule barrière réelle**.
Masquer une interface dans le navigateur n'est jamais une protection : ce qui
compte est ce que le serveur Firebase accepte.

Ce que les règles autorisent :

| Collection | Visiteur anonyme | Utilisateur connecté |
|---|---|---|
| `leads` | déposer une demande, rien d'autre | tout lire, modifier, supprimer |
| `settings` | lire (pour le bandeau) | modifier |
| le reste | rien | rien |

Points d'attention :

- **Le dépôt de demande est public** — c'est nécessaire pour un formulaire de
  contact. Les règles imposent les champs, leurs types, leurs longueurs, les
  valeurs autorisées, un statut initial non falsifiable et des horodatages
  posés par le serveur. Un robot peut donc créer une demande, mais ne peut ni
  en lire une, ni détourner la collection.
- **Aucune inscription n'est ouverte** : les comptes sont créés à la main dans
  la console. « Connecté » vaut donc « c'est le gérant ».
- Le formulaire public a un champ appât et un délai minimal de saisie, qui
  écartent les robots les plus simples sans imposer de captcha.
- Si le spam devenait un problème, la réponse est **App Check** (attestation du
  navigateur), à activer sans changer une ligne de ce code.

## Avant la bascule

Points bloquants relevés par l'audit, à traiter avant la mise en ligne :

- [ ] **Arbitrage client — périmètre géographique** : rayon réel autour de
      La Ciotat, ou double implantation PACA + Occitanie assumée avec pages
      locales. Le site actuel dit « PACA » mais cible aussi l'Occitanie.
- [ ] **Arbitrage client — prestations actives en 2026** : la page
      `/particuliers/` (2013) listait 7 prestations, les métadonnées en
      annonçaient d'autres (DPE immeuble, DTG, AMO). Lesquelles sont vendues ?
- [ ] **Mentions légales et politique de confidentialité** : compléter les
      champs entre crochets. Obligation LCEN et RGPD non remplie aujourd'hui.
- [ ] **Volet aides financières** (`audit-energetique.ts`) : barèmes et parcours
      à vérifier à la date de publication. Prévoir une relecture annuelle.
- [ ] **Références réglementaires** : RE2020 (construction neuve), audit
      obligatoire avant vente, obligations copropriété.
- [ ] **Qualifications** : numéros et validité RGE et OPQIBI, assurance RC pro.
- [ ] **Exporter les URL indexées** (Search Console + crawl) : le plan de
      redirections de `firebase.json` ne couvre que les 7 pages du menu.
- [ ] **Récupérer les accès Search Console et Analytics** du client pour mesurer
      le trafic par page avant suppression.
- [ ] Vérifier après bascule qu'aucune ancienne URL ne renvoie de 404.

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run typecheck` | Vérification des types |
| `npm run lint` | ESLint |
| `npm run emulators` | Émulateurs Firebase |
| `npm run deploy` | Build puis déploiement sur Firebase Hosting |
| `npm run deploy:rules` | Déploie règles et index Firestore |
