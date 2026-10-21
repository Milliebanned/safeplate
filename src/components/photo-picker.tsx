"use client";

import { useId, useRef, useState } from "react";

const SIZE = 800; // final photo is SIZE × SIZE
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Centre-crops to a square, resizes and compresses the photo in the browser. */
async function prepare(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  const webp = canvas.toDataURL("image/webp", 0.82);
  // Browsers that can't encode WebP fall back to PNG here; JPEG is much smaller.
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
}

export type PhotoChange = { action: "keep" } | { action: "remove" } | { action: "set"; dataUrl: string };

export function PhotoPicker({
  currentUrl,
  change,
  onChange,
  error,
}: {
  currentUrl: string | null;
  change: PhotoChange;
  onChange: (next: PhotoChange) => void;
  error?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const preview = change.action === "set" ? change.dataUrl : change.action === "remove" ? null : currentUrl;
  const message = localError ?? error;

  async function handleFile(file: File | undefined) {
    setLocalError(undefined);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return setLocalError("Choose a JPG, PNG or WebP image");
    if (file.size > MAX_SOURCE_BYTES) return setLocalError("Choose an image smaller than 15 MB");
    setBusy(true);
    try {
      onChange({ action: "set", dataUrl: await prepare(file) });
    } catch {
      setLocalError("That image couldn't be read. Try a JPG or PNG.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-600">
        Dish photo <span className="normal-case tracking-normal text-stone-500">(optional)</span>
      </p>
      <div className="flex items-center gap-5">
        <label
          htmlFor={inputId}
          className="group relative grid size-28 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_32%_26%,#ffffff,#ece5d9)] p-[7%] shadow-[inset_0_-4px_10px_rgba(0,0,0,0.08)] ring-1 ring-stone-300"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data URLs and our own photo route
            <img src={preview} alt="Dish photo preview" className="absolute left-[7%] top-[7%] size-[86%] rounded-full object-cover" data-testid="dish-photo-preview" />
          ) : (
            <span className="px-3 text-center text-xs leading-tight text-stone-500 group-hover:text-ink">
              {busy ? "Preparing…" : "Add a photo"}
            </span>
          )}
        </label>
        <div className="space-y-2">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            data-testid="dish-photo-input"
            aria-describedby={message ? "error-dish-photo" : "help-dish-photo"}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-semibold text-ink hover:border-ink disabled:opacity-60"
              data-testid="dish-photo-choose"
            >
              {preview ? "Change photo" : "Choose photo"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setLocalError(undefined);
                  onChange(currentUrl ? { action: "remove" } : { action: "keep" });
                }}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-700/10"
                data-testid="dish-photo-remove"
              >
                Remove photo
              </button>
            )}
          </div>
          <p id="help-dish-photo" className="text-xs text-stone-500">
            JPG, PNG or WebP. We crop it to a square and resize it for you.
          </p>
          {message && (
            <p id="error-dish-photo" role="alert" data-testid="error-dish-photo" className="text-sm text-red-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
