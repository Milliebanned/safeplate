"use client";

import { useState, useTransition } from "react";
import { AllergenBadges } from "@/components/allergen-badges";
import { ComponentPicker, type PickerOption } from "@/components/component-picker";
import { ConfirmDelete } from "@/components/confirm-delete";
import { FieldError, type Flash, FlashMessage } from "@/components/flash";
import { cardClass, inputClass, labelClass, primaryButton, secondaryButton } from "@/components/ui";
import type { Component } from "@/lib/allergens";
import type { DishView } from "@/lib/menu";
import { CATEGORIES } from "@/lib/sample-menu";
import { testIdFor } from "@/lib/test-id";
import { formatPrice } from "@/lib/validation";
import { type DishInput, deleteDish, saveDish } from "./actions";

const EMPTY: DishInput = {
  name: "",
  description: "",
  category: "Mains",
  price: "",
  published: true,
  components: [],
};

export function DishManager({ dishes, options }: { dishes: DishView[]; options: PickerOption[] }) {
  const [draft, setDraft] = useState<DishInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<Flash>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(draft.id);
  const set = <K extends keyof DishInput>(field: K, value: DishInput[K]) => setDraft((d) => ({ ...d, [field]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveDish(draft);
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

  function remove(dish: DishView) {
    startTransition(async () => {
      const result = await deleteDish(dish.id);
      setFlash({ kind: result.ok ? "success" : "error", text: result.message ?? "Something went wrong." });
      if (result.ok && draft.id === dish.id) setDraft(EMPTY);
    });
  }

  const field = (name: keyof DishInput) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `error-dish-${name}` : undefined,
  });

  return (
    <div className="space-y-6">
      <FlashMessage flash={flash} />

      <form onSubmit={submit} noValidate className={`${cardClass} space-y-4`} data-testid="dish-form">
        <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit dish" : "Create dish"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="dish-name" className={labelClass}>
              Dish name
            </label>
            <input
              id="dish-name"
              data-testid="dish-name"
              className={inputClass}
              value={draft.name}
              maxLength={120}
              onChange={(e) => set("name", e.target.value)}
              {...field("name")}
            />
            <FieldError id="error-dish-name" message={errors.name} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="dish-description" className={labelClass}>
              Description <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="dish-description"
              data-testid="dish-description"
              className={inputClass}
              rows={2}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              {...field("description")}
            />
            <FieldError id="error-dish-description" message={errors.description} />
          </div>
          <div>
            <label htmlFor="dish-category" className={labelClass}>
              Category
            </label>
            <select
              id="dish-category"
              data-testid="dish-category"
              className={inputClass}
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              {...field("category")}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError id="error-dish-category" message={errors.category} />
          </div>
          <div>
            <label htmlFor="dish-price" className={labelClass}>
              Price (USD)
            </label>
            <input
              id="dish-price"
              data-testid="dish-price"
              inputMode="decimal"
              placeholder="12.50"
              className={inputClass}
              value={draft.price}
              onChange={(e) => set("price", e.target.value)}
              {...field("price")}
            />
            <FieldError id="error-dish-price" message={errors.price} />
          </div>
        </div>
        <ComponentPicker
          options={options}
          selected={draft.components}
          onChange={(components) => set("components", components)}
          error={errors.components}
        />
        <label htmlFor="dish-published" className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <input
            id="dish-published"
            type="checkbox"
            data-testid="dish-published"
            className="size-4 accent-emerald-600"
            checked={draft.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          Published — show this dish on the public menu
        </label>
        <div className="flex gap-2">
          <button type="submit" className={primaryButton} disabled={pending} data-testid="dish-submit">
            {pending ? "Saving…" : editing ? "Save changes" : "Create dish"}
          </button>
          {editing && (
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setDraft(EMPTY);
                setErrors({});
              }}
              data-testid="dish-cancel-edit"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section aria-labelledby="dish-list" className="space-y-3">
        <h2 id="dish-list" className="text-lg font-semibold text-slate-900">
          All dishes <span className="text-slate-500">({dishes.length})</span>
        </h2>
        {dishes.length === 0 ? (
          <p className={`${cardClass} text-slate-600`} data-testid="dishes-empty">
            No dishes yet — create your first dish.
          </p>
        ) : (
          CATEGORIES.filter((c) => dishes.some((d) => d.category === c)).map((category) => (
            <div key={category} className="space-y-2" data-testid={`dish-category-${category.toLowerCase()}`}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</h3>
              <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {dishes
                  .filter((d) => d.category === category)
                  .map((dish) => {
                    const id = testIdFor(dish.name);
                    return (
                      <li
                        key={dish.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                        data-testid={`dish-row-${id}`}
                      >
                        <div className="space-y-1.5">
                          <p className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-slate-900" data-testid="dish-row-name">
                              {dish.name}
                            </span>
                            <span className="text-sm text-slate-700" data-testid="dish-row-price">
                              {formatPrice(dish.priceCents)}
                            </span>
                            <span
                              data-testid="dish-row-status"
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                dish.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {dish.published ? "Published" : "Draft"}
                            </span>
                          </p>
                          <AllergenBadges allergens={dish.allergens} />
                          <p className="text-sm text-slate-600" data-testid="dish-row-components">
                            Made with: {dish.components.map((c) => c.name).join(", ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                            onClick={() => {
                              setDraft({
                                id: dish.id,
                                name: dish.name,
                                description: dish.description,
                                category: dish.category,
                                price: (dish.priceCents / 100).toFixed(2),
                                published: dish.published,
                                components: dish.components.map(({ kind, id }) => ({ kind, id }) as Component),
                              });
                              setErrors({});
                              setFlash(null);
                              document.getElementById("dish-name")?.focus();
                            }}
                            data-testid={`edit-${id}`}
                            aria-label={`Edit ${dish.name}`}
                          >
                            Edit
                          </button>
                          <ConfirmDelete itemName={dish.name} testId={id} disabled={pending} onConfirm={() => remove(dish)} />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
