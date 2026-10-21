// Dish photos arrive as data URLs, already cropped and compressed in the browser.
// The server re-checks everything here before storing a single byte.

export const MAX_PHOTO_BYTES = 1_500_000;
export const PHOTO_TYPE_ERROR = "Choose a JPG, PNG or WebP image";
export const PHOTO_SIZE_ERROR = "Photo must be smaller than 1.5 MB";

const DATA_URL_RE = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/]+={0,2})$/;

/** Checks the real file signature, so a renamed file can't pass as an image. */
function matchesSignature(type: string, bytes: Uint8Array) {
  const at = (i: number, ...values: number[]) => values.every((v, j) => bytes[i + j] === v);
  if (type === "image/png") return at(0, 0x89, 0x50, 0x4e, 0x47);
  if (type === "image/jpeg") return at(0, 0xff, 0xd8, 0xff);
  if (type === "image/webp") return at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50);
  return false;
}

export type ParsedPhoto = { ok: true; contentType: string; data: Buffer } | { ok: false; error: string };

export function parsePhotoDataUrl(value: string): ParsedPhoto {
  const match = DATA_URL_RE.exec(value);
  if (!match) return { ok: false, error: PHOTO_TYPE_ERROR };
  const [, contentType, base64] = match;
  const data = Buffer.from(base64, "base64");
  if (data.length > MAX_PHOTO_BYTES) return { ok: false, error: PHOTO_SIZE_ERROR };
  if (!matchesSignature(contentType, data)) return { ok: false, error: PHOTO_TYPE_ERROR };
  return { ok: true, contentType, data };
}

/** Public address of a stored photo. The version changes whenever the photo does. */
export function uploadedPhotoUrl(dishId: string, updatedAt: Date) {
  return `/api/dishes/${dishId}/photo/${updatedAt.getTime()}`;
}
