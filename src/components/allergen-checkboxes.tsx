"use client";

import { ALLERGENS } from "@/lib/allergens";

export function AllergenCheckboxes({
  selected,
  onChange,
  idPrefix,
}: {
  selected: readonly string[];
  onChange: (next: string[]) => void;
  idPrefix: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-800">Allergens it contains</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ALLERGENS.map((a) => {
          const id = `${idPrefix}-${a.code}`;
          const checked = selected.includes(a.code);
          return (
            <label
              key={a.code}
              htmlFor={id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                checked ? "border-amber-400 bg-amber-50 text-amber-950" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <input
                id={id}
                type="checkbox"
                data-testid={`allergen-checkbox-${a.code}`}
                className="size-4 accent-amber-600"
                checked={checked}
                onChange={(e) =>
                  onChange(e.target.checked ? [...selected, a.code] : selected.filter((c) => c !== a.code))
                }
              />
              {a.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
