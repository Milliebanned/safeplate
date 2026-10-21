export type Flash = { kind: "success" | "error"; text: string } | null;

/** The visible result of the last action (PRD: every action shows a specific message). */
export function FlashMessage({ flash }: { flash: Flash }) {
  if (!flash) return null;
  return flash.kind === "success" ? (
    <p role="status" data-testid="flash-success" className="rounded-full border border-emerald-700/20 bg-emerald-700/10 px-5 py-2.5 text-sm text-emerald-900">
      {flash.text}
    </p>
  ) : (
    <p role="alert" data-testid="flash-error" className="rounded-full border border-red-700/20 bg-red-700/10 px-5 py-2.5 text-sm text-red-900">
      {flash.text}
    </p>
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
