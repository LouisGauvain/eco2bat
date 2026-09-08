'use client';

/**
 * Champs de formulaire du back-office.
 *
 * Regroupés ici parce que l'éditeur de page les répète beaucoup : un seul
 * endroit décide de l'apparence d'un libellé, d'un champ et d'un compteur de
 * caractères.
 */

const inputClass =
  'mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-leaf-500 focus:outline-none';

export function Field({
  label,
  value,
  onChange,
  hint,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink-800">
        {label}
        {maxLength && (
          <Counter length={value.length} max={maxLength} />
        )}
      </span>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink-800">
        {label}
        {maxLength && <Counter length={value.length} max={maxLength} />}
      </span>
      <textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} leading-relaxed`}
      />
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

/** Choix dans une liste fermée : ton d'un encadré, alignement, taille d'image. */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-800">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

/**
 * Compteur de caractères. Sur un titre SEO ou une meta-description, dépasser
 * la longueur utile fait tronquer le texte dans les résultats de recherche :
 * l'indication vire à l'orange avant que ce soit le cas.
 */
function Counter({ length, max }: { length: number; max: number }) {
  const tight = length > max * 0.9;
  return (
    <span className={`text-xs tabular-nums ${tight ? 'text-amber-700' : 'text-ink-400'}`}>
      {length}/{max}
    </span>
  );
}

/** Boutons de réordonnancement et de suppression d'un élément répétable. */
export function ItemControls({
  onUp,
  onDown,
  onRemove,
  label,
}: {
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <IconButton onClick={onUp} label={`Monter ${label}`} disabled={!onUp}>
        ↑
      </IconButton>
      <IconButton onClick={onDown} label={`Descendre ${label}`} disabled={!onDown}>
        ↓
      </IconButton>
      <IconButton onClick={onRemove} label={`Supprimer ${label}`} tone="danger">
        ✕
      </IconButton>
    </div>
  );
}

function IconButton({
  onClick,
  label,
  children,
  disabled,
  tone,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`h-7 w-7 rounded border border-ink-200 text-sm leading-none disabled:opacity-30 ${
        tone === 'danger'
          ? 'text-red-700 hover:bg-red-50'
          : 'text-ink-600 hover:bg-ink-50'
      }`}
    >
      {children}
    </button>
  );
}

export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-dashed border-ink-300 px-3 py-1.5 text-sm font-medium text-ink-600 hover:border-leaf-500 hover:text-leaf-700"
    >
      + {children}
    </button>
  );
}

/** Déplacement d'un élément dans une liste, sans muter l'original. */
export function moved<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

export function replaced<T>(items: T[], index: number, item: T): T[] {
  return items.map((current, position) => (position === index ? item : current));
}

export function removed<T>(items: T[], index: number): T[] {
  return items.filter((_, position) => position !== index);
}
