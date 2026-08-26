/**
 * Message de confirmation ou d'erreur du back-office.
 *
 * Toujours au même endroit — épinglé en haut de l'écran plutôt qu'inséré dans
 * le formulaire : une confirmation placée dans le flux passe inaperçue quand on
 * enregistre depuis le bas d'une page longue.
 */
export function Toast({
  message,
  tone = 'success',
}: {
  message: string;
  tone?: 'success' | 'error';
}) {
  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 print:hidden">
      <p
        role="status"
        className={`pointer-events-auto max-w-xl rounded-md px-4 py-3 text-sm shadow-lg ring-1 ${
          tone === 'error'
            ? 'bg-red-50 text-red-900 ring-red-200'
            : 'bg-leaf-50 text-leaf-800 ring-leaf-200'
        }`}
      >
        {message}
      </p>
    </div>
  );
}
