"use client";

import { useState } from "react";
import type { Component } from "@/lib/allergens";
import { testIdFor } from "@/lib/test-id";
import { AllergenBadges } from "./allergen-badges";
import { inputClass } from "./ui";

export type PickerOption = Component & { name: string; allergens: readonly string[] };

const key = (c: Component) => `${c.kind}:${c.id}`;

/** Choose the ingredients and sub-recipes that go into a sub-recipe or dish. */
export function ComponentPicker({
  options,
  selected,
  onChange,
  error,
}: {
  options: PickerOption[];
  selected: Component[];
  onChange: (next: Component[]) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const chosen = new Set(selected.map(key));
  const q = query.trim().toLowerCase();
  const visible = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;
  const groups = [
    { title: "Sub-recipes", items: visible.filter((o) => o.kind === "recipe") },
    { title: "Ingredients", items: visible.filter((o) => o.kind === "ingredient") },
  ].filter((g) => g.items.length > 0);

  function toggle(option: PickerOption, on: boolean) {
    onChange(
      on
        ? [...selected, { kind: option.kind, id: option.id }]
        : selected.filter((c) => key(c) !== key(option)),
    );
  }

  return (
    <fieldset aria-describedby={error ? "error-components" : undefined}>
      <legend className="mb-1 text-sm font-medium text-slate-800">
        Components <span className="font-normal text-slate-500">({selected.length} selected)</span>
      </legend>
      {options.length === 0 ? (
        <p className="text-sm text-slate-600">Add ingredients first, then come back to build this.</p>
      ) : (
        <>
          <label htmlFor="component-search" className="sr-only">
            Search components
          </label>
          <input
            id="component-search"
            type="search"
            placeholder="Search ingredients and sub-recipes"
            data-testid="component-search"
            className={`${inputClass} mb-2`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {groups.length === 0 && <p className="text-sm text-slate-600">Nothing matches &quot;{query.trim()}&quot;</p>}
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{group.title}</p>
                <ul className="space-y-1">
                  {group.items.map((option) => {
                    const id = `component-${option.kind}-${testIdFor(option.name)}`;
                    return (
                      <li key={key(option)}>
                        <label htmlFor={id} className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
                          <input
                            id={id}
                            type="checkbox"
                            data-testid={id}
                            aria-label={option.name}
                            className="mt-1 size-4 accent-emerald-600"
                            checked={chosen.has(key(option))}
                            onChange={(e) => toggle(option, e.target.checked)}
                          />
                          <span className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-900">{option.name}</span>
                            <AllergenBadges allergens={option.allergens} testId={`${id}-allergens`} />
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
      {error && (
        <p id="error-components" role="alert" data-testid="error-components" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}
