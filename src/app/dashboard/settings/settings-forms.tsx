"use client";

import { useState, useTransition } from "react";
import { FieldError, type Flash, FlashMessage } from "@/components/flash";
import { cardClass, dangerButton, inputClass, labelClass, primaryButton, secondaryButton } from "@/components/ui";
import { loadSampleMenu, saveSettings } from "./actions";

export function SettingsForms({ name, slug, baseUrl }: { name: string; slug: string; baseUrl: string }) {
  const [values, setValues] = useState({ name, slug });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<Flash>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveSettings(values);
      if (result.ok) {
        setErrors({});
        setFlash({ kind: "success", text: result.message });
      } else {
        setErrors(result.fieldErrors ?? {});
        setFlash(result.message ? { kind: "error", text: result.message } : null);
      }
    });
  }

  function loadSample() {
    setConfirming(false);
    startTransition(async () => {
      const result = await loadSampleMenu();
      setFlash({ kind: result.ok ? "success" : "error", text: result.message ?? "Something went wrong." });
    });
  }

  return (
    <div className="space-y-6">
      <FlashMessage flash={flash} />

      <form onSubmit={submit} noValidate className={`${cardClass} space-y-4`} data-testid="settings-form">
        <h2 className="font-serif text-2xl text-ink">Restaurant details</h2>
        <div>
          <label htmlFor="settings-name" className={labelClass}>
            Restaurant name
          </label>
          <input
            id="settings-name"
            data-testid="settings-name"
            className={inputClass}
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "error-settings-name" : undefined}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
          <FieldError id="error-settings-name" message={errors.name} />
        </div>
        <div>
          <label htmlFor="settings-slug" className={labelClass}>
            Public menu address
          </label>
          <div className="flex items-center gap-1">
            <span className="shrink-0 text-sm text-stone-500">{baseUrl}/m/</span>
            <input
              id="settings-slug"
              data-testid="settings-slug"
              className={inputClass}
              value={values.slug}
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={errors.slug ? "error-settings-slug" : "help-settings-slug"}
              onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
            />
          </div>
          <p id="help-settings-slug" className="mt-1 text-xs text-stone-500">
            3 to 40 lowercase letters, numbers or hyphens.
          </p>
          <FieldError id="error-settings-slug" message={errors.slug} />
        </div>
        <button type="submit" className={primaryButton} disabled={pending} data-testid="settings-submit">
          {pending ? "Saving…" : "Save settings"}
        </button>
      </form>

      <section className={`${cardClass} space-y-3`} aria-labelledby="sample-menu">
        <h2 id="sample-menu" className="font-serif text-2xl text-ink">
          Sample menu
        </h2>
        <p className="text-sm text-stone-600">
          Replace all of your ingredients, sub-recipes and dishes with the SafePlate sample menu. Useful for exploring
          or starting over. This only affects your restaurant.
        </p>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-red-800">This replaces your whole menu.</span>
            <button type="button" className={dangerButton} onClick={loadSample} disabled={pending} data-testid="confirm-load-sample">
              Confirm: replace my menu
            </button>
            <button type="button" className={secondaryButton} onClick={() => setConfirming(false)} data-testid="cancel-load-sample">
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={secondaryButton}
            onClick={() => setConfirming(true)}
            disabled={pending}
            data-testid="load-sample"
          >
            {pending ? "Loading…" : "Load sample menu"}
          </button>
        )}
      </section>
    </div>
  );
}
