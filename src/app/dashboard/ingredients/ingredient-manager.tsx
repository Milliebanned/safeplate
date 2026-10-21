"use client";

import { useState, useTransition } from "react";
import { AllergenBadges } from "@/components/allergen-badges";
import { AllergenCheckboxes } from "@/components/allergen-checkboxes";
import { ConfirmDelete } from "@/components/confirm-delete";
import { FieldError, type Flash, FlashMessage } from "@/components/flash";
import { cardClass, inputClass, labelClass, primaryButton, secondaryButton } from "@/components/ui";
import type { IngredientView } from "@/lib/menu";
import { testIdFor } from "@/lib/test-id";
import { deleteIngredient, saveIngredient } from "./actions";

type Draft = { id?: string; name: string; allergens: string[] };
const EMPTY: Draft = { name: "", allergens: [] };

export function IngredientManager({ ingredients }: { ingredients: IngredientView[] }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [nameError, setNameError] = useState<string>();
  const [flash, setFlash] = useState<Flash>(null);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const editing = Boolean(draft.id);
  const q = query.trim().toLowerCase();
  const visible = q ? ingredients.filter((i) => i.name.toLowerCase().includes(q)) : ingredients;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveIngredient(draft);
      if (result.ok) {
        setFlash({ kind: "success", text: result.message });
        setDraft(EMPTY);
        setNameError(undefined);
      } else {
        setNameError(result.fieldErrors?.name);
        setFlash(result.message ? { kind: "error", text: result.message } : null);
      }
    });
  }

  function remove(ingredient: IngredientView) {
    startTransition(async () => {
      const result = await deleteIngredient(ingredient.id);
      setFlash({ kind: result.ok ? "success" : "error", text: result.message ?? "Something went wrong." });
      if (result.ok && draft.id === ingredient.id) setDraft(EMPTY);
    });
  }

  function startEdit(ingredient: IngredientView) {
    setDraft({ id: ingredient.id, name: ingredient.name, allergens: [...ingredient.allergens] });
    setNameError(undefined);
    setFlash(null);
    document.getElementById("ingredient-name")?.focus();
  }

  return (
    <div className="space-y-6">
      <FlashMessage flash={flash} />

      <form onSubmit={submit} noValidate className={`${cardClass} space-y-4`} data-testid="ingredient-form">
        <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit ingredient" : "Add ingredient"}</h2>
        <div>
          <label htmlFor="ingredient-name" className={labelClass}>
            Ingredient name
          </label>
          <input
            id="ingredient-name"
            data-testid="ingredient-name"
            className={inputClass}
            value={draft.name}
            maxLength={120}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "error-ingredient-name" : undefined}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <FieldError id="error-ingredient-name" message={nameError} />
        </div>
        <AllergenCheckboxes
          idPrefix="ingredient-allergen"
          selected={draft.allergens}
          onChange={(allergens) => setDraft((d) => ({ ...d, allergens }))}
        />
        <div className="flex gap-2">
          <button type="submit" className={primaryButton} disabled={pending} data-testid="ingredient-submit">
            {pending ? "Saving…" : editing ? "Save changes" : "Add ingredient"}
          </button>
          {editing && (
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setDraft(EMPTY);
                setNameError(undefined);
              }}
              data-testid="ingredient-cancel-edit"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section aria-labelledby="ingredient-list" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="ingredient-list" className="text-lg font-semibold text-slate-900">
            All ingredients <span className="text-slate-500">({ingredients.length})</span>
          </h2>
          <div className="w-full sm:w-64">
            <label htmlFor="ingredient-search" className="sr-only">
              Search ingredients
            </label>
            <input
              id="ingredient-search"
              type="search"
              placeholder="Search ingredients"
              data-testid="ingredient-search"
              className={inputClass}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {ingredients.length === 0 ? (
          <p className={`${cardClass} text-slate-600`} data-testid="ingredients-empty">
            No ingredients yet — add your first one.
          </p>
        ) : visible.length === 0 ? (
          <p className={`${cardClass} text-slate-600`} data-testid="ingredients-no-match">
            No ingredients match &quot;{query.trim()}&quot;
          </p>
        ) : (
          <ul className="divide-y divide-slate-200/70 overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.4)] backdrop-blur" data-testid="ingredient-list">
            {visible.map((ingredient) => {
              const id = testIdFor(ingredient.name);
              return (
                <li
                  key={ingredient.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  data-testid={`ingredient-row-${id}`}
                >
                  <div className="space-y-1.5">
                    <p className="font-medium text-slate-900" data-testid="ingredient-row-name">
                      {ingredient.name}
                    </p>
                    <AllergenBadges allergens={ingredient.allergens} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                      onClick={() => startEdit(ingredient)}
                      data-testid={`edit-${id}`}
                      aria-label={`Edit ${ingredient.name}`}
                    >
                      Edit
                    </button>
                    <ConfirmDelete
                      itemName={ingredient.name}
                      testId={id}
                      disabled={pending}
                      onConfirm={() => remove(ingredient)}
                    />
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
