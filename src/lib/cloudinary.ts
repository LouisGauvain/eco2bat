/**
 * Dépôt et livraison des images, via Cloudinary.
 *
 * Le site est statique et n'a pas de serveur : une image déposée depuis le
 * back-office ne peut pas être écrite dans `public/`, qui ne change qu'au
 * déploiement. Elle part donc directement du navigateur vers Cloudinary, en
 * « upload non signé » — un préréglage public, limité à ce qu'il autorise, qui
 * évite d'avoir à signer la requête avec un secret côté serveur.
 *
 * En contrepartie, l'adresse du préréglage est visible de tous : il faut le
 * configurer étroitement dans la console Cloudinary (types de fichiers, taille
 * maximale, dossier de destination) puisque c'est le seul garde-fou.
 *
 * Les images du site lui-même (logo, favicon) restent dans `public/` : elles
 * font partie du dépôt, pas du contenu éditable.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/** Poids maximal accepté avant même l'envoi, pour ne pas attendre un refus. */
const MAX_BYTES = 10 * 1024 * 1024;

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
}

export function isUploadConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/**
 * Envoie un fichier à Cloudinary et renvoie son adresse définitive.
 * Les dimensions sont conservées avec l'adresse : elles permettent de réserver
 * la place de l'image dans la page avant son chargement, et donc d'éviter que
 * le texte saute une fois l'image arrivée.
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Dépôt d’images non configuré : renseigner NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME et NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
    );
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Ce fichier n’est pas une image.');
  }

  if (file.size > MAX_BYTES) {
    throw new Error(
      `Image trop lourde (${Math.round(file.size / 1024 / 1024)} Mo). Maximum 10 Mo.`,
    );
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body },
  );

  if (!response.ok) {
    // Cloudinary décrit précisément le refus (préréglage inconnu, format
    // interdit…) : le message vaut mieux qu'un « échec » générique.
    const detail = await response
      .json()
      .then((data: { error?: { message?: string } }) => data.error?.message)
      .catch(() => undefined);
    throw new Error(detail ?? 'L’envoi de l’image a échoué.');
  }

  const data = (await response.json()) as {
    secure_url: string;
    width: number;
    height: number;
  };

  return { url: data.secure_url, width: data.width, height: data.height };
}

/**
 * Adresse de livraison à une largeur donnée.
 *
 * `f_auto` sert du WebP ou de l'AVIF aux navigateurs qui les acceptent et du
 * JPEG aux autres ; `q_auto` choisit la compression. C'est ce qui remplace
 * l'optimisation d'images de Next, désactivée faute de serveur.
 *
 * Une adresse qui ne vient pas de Cloudinary (collée à la main) est renvoyée
 * telle quelle.
 */
export function imageUrl(url: string, width: number): string {
  const marker = '/image/upload/';
  const at = url.indexOf(marker);
  if (!url.startsWith('https://res.cloudinary.com/') || at === -1) return url;

  return `${url.slice(0, at + marker.length)}f_auto,q_auto,c_limit,w_${width}/${url.slice(
    at + marker.length,
  )}`;
}

/** Largeurs proposées au navigateur : il retient celle qui convient à l'écran. */
const WIDTHS = [640, 960, 1280, 1920];

/**
 * Jeu de largeurs disponibles, ou `undefined` pour une image qui n'est pas
 * servie par Cloudinary — un fichier de `public/` n'existe qu'en une seule
 * définition, et annoncer des largeurs qu'on ne sait pas produire ferait
 * télécharger le même fichier en le croyant plus grand.
 */
export function imageSrcSet(url: string): string | undefined {
  if (!url.startsWith('https://res.cloudinary.com/')) return undefined;
  return WIDTHS.map((width) => `${imageUrl(url, width)} ${width}w`).join(', ');
}
