export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

/** Postgres unique-violation (e.g. a duplicate name that slipped past the pre-check). */
export function isUniqueViolation(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}
