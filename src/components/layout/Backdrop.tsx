/**
 * Décor animé des cartes vert profond : halos de lumière qui dérivent et trame
 * de plan d'architecte (voir `.hero-*` dans globals.css). Utilisé par le hero
 * de l'accueil et par l'appel à l'action de fin de page ; `compact` réduit les
 * halos pour une carte moins haute. Le parent doit être `relative` et
 * `overflow-hidden`, et poser son contenu en `relative` par-dessus.
 */
export function Backdrop({ compact = false }: { compact?: boolean }) {
  const vars = (values: Record<string, string>) => values as React.CSSProperties;
  const size = compact
    ? ['h-[320px] w-[320px]', 'h-[280px] w-[280px]', 'h-[240px] w-[240px]']
    : ['h-[520px] w-[520px]', 'h-[460px] w-[460px]', 'h-[380px] w-[380px]'];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-grid" />
      <div
        className={`hero-blob -left-40 -top-40 bg-leaf-400/30 ${size[0]}`}
        style={vars({
          '--drift-x': '90px',
          '--drift-y': '60px',
          '--drift-duration': '24s',
        })}
      />
      <div
        className={`hero-blob -right-32 top-1/4 bg-sea-500/35 ${size[1]}`}
        style={vars({
          '--drift-x': '-70px',
          '--drift-y': '50px',
          '--drift-duration': '28s',
        })}
      />
      <div
        className={`hero-blob bottom-0 left-1/3 bg-leaf-300/25 ${size[2]}`}
        style={vars({
          '--drift-x': '60px',
          '--drift-y': '-70px',
          '--drift-duration': '20s',
        })}
      />
    </div>
  );
}
