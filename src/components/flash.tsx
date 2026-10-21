export type Flash = { kind: "success" | "error"; text: string } | null;

/**
 * The visible result of the last action (PRD: every action shows a specific message).
 * `floating` pins it to the bottom of the screen, so it is seen even after acting on an
 * item far down a long list.
 */
export function FlashMessage({ flash, floating = false }: { flash: Flash; floating?: boolean }) {
  if (!flash) return null;
  const message =
    flash.kind === "success" ? (
      <p
        role="status"
        data-testid="flash-success"
        className={`rounded-full border px-5 py-2.5 text-sm ${
          floating
            ? "pointer-events-auto border-emerald-400/30 bg-ink text-emerald-100 shadow-[0_20px_40px_-12px_rgba(13,12,10,0.55)]"
            : "border-emerald-700/20 bg-emerald-700/10 text-emerald-900"
        }`}
      >
        {flash.text}
      </p>
    ) : (
      <p
        role="alert"
        data-testid="flash-error"
        className={`rounded-full border px-5 py-2.5 text-sm ${
          floating
            ? "pointer-events-auto border-red-400/40 bg-ink text-red-200 shadow-[0_20px_40px_-12px_rgba(13,12,10,0.55)]"
            : "border-red-700/20 bg-red-700/10 text-red-900"
        }`}
      >
        {flash.text}
      </p>
    );
  if (!floating) return message;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 print:hidden">
      <div className="max-w-xl text-center">{message}</div>
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" data-testid={id} className="mt-1 text-sm text-red-700">
      {message}
    </p>
  );
}
