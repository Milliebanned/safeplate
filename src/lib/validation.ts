// Field rules and the exact error messages from the PRD (sections 5.2 to 5.9).

export type ItemKind = "ingredient" | "sub-recipe" | "dish";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9-]{3,40}$/;
const PRICE_RE = /^\d+(\.\d{1,2})?$/;

export function validateRestaurantName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Restaurant name is required";
  if (name.length < 2 || name.length > 60) return "Restaurant name must be 2 to 60 characters";
  return null;
}

export function validateEmail(value: string): string | null {
  return EMAIL_RE.test(value.trim()) ? null : "Enter a valid email address";
}

export function validatePassword(value: string): string | null {
  return value.length >= 8 ? null : "Password must be at least 8 characters";
}

export function validateItemName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Name is required";
  if (name.length > 60) return "Name must be 60 characters or fewer";
  return null;
}

export function duplicateNameMessage(kind: ItemKind, name: string): string {
  const article = kind === "ingredient" ? "An" : "A";
  return `${article} ${kind} named "${name.trim()}" already exists`;
}

export function validateDescription(value: string): string | null {
  return value.trim().length > 200 ? "Description must be 200 characters or fewer" : null;
}

/** "12.50" → 1250 cents, or null if the price is not valid (PRD 5.8). */
export function parsePrice(value: string): number | null {
  const text = value.trim().replace(/^\$/, "");
  if (!PRICE_RE.test(text)) return null;
  const cents = Math.round(Number(text) * 100);
  if (cents <= 0 || cents > 999_999) return null;
  return cents;
}

export const PRICE_ERROR = "Enter a price like 12.50";

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function validateSlug(value: string): string | null {
  return SLUG_RE.test(value) ? null : "Use 3 to 40 lowercase letters, numbers or hyphens";
}

/** "Luna Café" → "luna-cafe". Always returns a valid slug. */
export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 34)
    .replace(/-+$/g, "");
  return slug.length >= 3 ? slug : `menu-${slug || "new"}`.slice(0, 34);
}

/** "Hummus", "Peanut Noodles" → `Hummus, Peanut Noodles` (used in "in use" errors). */
export function joinNames(names: string[]): string {
  return [...names].sort((a, b) => a.localeCompare(b)).join(", ");
}
