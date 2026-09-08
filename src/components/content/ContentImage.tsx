import { imageSrcSet, imageUrl } from '@/lib/cloudinary';

/**
 * Image de contenu, servie par Cloudinary.
 *
 * `next/image` est configuré en `unoptimized` (le site est exporté en
 * statique, il n'y a pas de serveur pour redimensionner) : c'est donc ici que
 * passe l'optimisation. `imageUrl` demande à Cloudinary une version au bon
 * format et à la bonne compression, `imageSrcSet` propose plusieurs largeurs
 * au navigateur. Une image de `public/` traverse ces deux fonctions sans
 * changer : elle est servie telle quelle, sans `srcset` mensonger.
 */
export function ContentImage({
  url,
  alt,
  width,
  height,
  sizes,
  className,
  title,
  priority = false,
  fallbackWidth = 1280,
}: {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  title?: string;
  /** Image visible d'emblée (hero) : ni paresseuse, ni décodée en différé. */
  priority?: boolean;
  /** Largeur demandée par défaut, pour les navigateurs sans `srcset`. */
  fallbackWidth?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- voir l'en-tête du fichier
    <img
      src={imageUrl(url, fallbackWidth)}
      srcSet={imageSrcSet(url)}
      sizes={sizes}
      alt={alt}
      title={title}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      className={className}
    />
  );
}
