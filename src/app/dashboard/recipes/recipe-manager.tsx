"use client";

import { useState, useTransition } from "react";
import { AllergenBadges } from "@/components/allergen-badges";
import { ComponentPicker, type PickerOption } from "@/components/component-picker";
import { ConfirmDelete } from "@/components/confirm-delete";
import { FieldError, type Flash, FlashMessage } from "@/components/flash";
import { cardClass, inputClass, labelClass, primaryButton, secondaryButton } from "@/components/ui";
import type { Component } from "@/lib/allergens";
import type { RecipeView } from "@/lib/menu";
import { testIdFor } from "@/lib/test-id";
import { deleteRecipe, saveRecipe } from "./actions";

type Draft = { id?: string; name: string; components: Component[] };
const EMPTY: Draft = { name: "", components: [] };

export function RecipeManager({ recipes, options }: { recipes: RecipeView[]; options: PickerOption[] }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<Flash>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(draft.id);

  // A sub-recipe can never be picked as a component of itself.
  const pickerOptions = options.filter((o) => !(o.kind === "recipe" && o.id === draft.id));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveRecipe(draft);
      if (result.ok) {
        setFlash({ kind: "success", text: result.message });
        setDraft(EMPTY);
        setErrors({});
      } else {
        setErrors(result.fieldErrors ?? {});
        setFlash(result.message ? { kind: "error", text: result.message } : null);
      }
    });
  }

  function remove(recipe: RecipeView) {
    startTransition(async () => {
      const result = await deleteRecipe(recipe.id);
      setFlash({ kind: result.ok ? "success" : "error", text: result.message ?? "Something went wrong." });
      if (result.ok && draft.id === recipe.id) setDraft(EMPTY);
    });
  }

  return (
    <div className="space-y-6">
      <FlashMessage flash={flash} />

      <form onSubmit={submit} noValidate className={`${cardClass} space-y-4`} data-testid="recipe-form">
        <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit sub-recipe" : "Create sub-recipe"}</h2>
        <div>
          <label htmlFor="recipe-name" className={labelClass}>
            Sub-recipe name
          </label>
          <input
            id="recipe-name"
            data-testid="recipe-name"
            className={inputClass}
            value={draft.name}
            maxLength={120}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "error-recipe-name" : undefined}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <FieldError id="error-recipe-name" message={errors.name} />
        </div>
        <ComponentPicker
          options={pickerOptions}
          selected={draft.components}
          onChange={(components) => setDraft((d) => ({ ...d, components }))}
          error={errors.components}
        />
        <div className="flex gap-2">
          <button type="submit" className={primaryButton} disabled={pending} data-testid="recipe-submit">
            {pending ? "Saving…" : editing ? "Save changes" : "Create sub-recipe"}
          </button>
          {editing && (
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setDraft(EMPTY);
                setErrors({});
              }}
              data-testid="recipe-cancel-edit"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section aria-labelledby="recipe-list" className="space-y-3">
        <h2 id="recipe-list" className="text-lg font-semibold text-slate-900">
          All sub-recipes <span className="text-slate-500">({recipes.length})</span>
        </h2>
        {recipes.length === 0 ? (
          <p className={`${cardClass} text-slate-600`} data-testid="recipes-empty">
            No sub-recipes yet — create one to reuse sauces, dressings and bases.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white" data-testid="recipe-list">
            {recipes.map((recipe) => {
              const id = testIdFor(recipe.name);
              return (
                <li
                  key={recipe.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                  data-testid={`recipe-row-${id}`}
                >
                  <div className="space-y-1.5">
                    <p className="font-medium text-slate-900" data-testid="recipe-row-name">
                      {recipe.name}
                    </p>
                    <AllergenBadges allergens={recipe.allergens} />
                    <p className="text-sm text-slate-600" data-testid="recipe-row-components">
                      Made with: {recipe.components.map((c) => c.name).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                      onClick={() => {
                        setDraft({
                          id: recipe.id,
                          name: recipe.name,
                          components: recipe.components.map(({ kind, id }) => ({ kind, id }) as Component),
                        });
                        setErrors({});
                        setFlash(null);
                        document.getElementById("recipe-name")?.focus();
                      }}
                      data-testid={`edit-${id}`}
                      aria-label={`Edit ${recipe.name}`}
                    >
                      Edit
                    </button>
                    <ConfirmDelete itemName={recipe.name} testId={id} disabled={pending} onConfirm={() => remove(recipe)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
