"use client";

import { useState } from "react";
import { AllergenBadges } from "@/components/allergen-badges";
import { ALLERGENS, type AllergenCode, formatAllergens, matchingAllergens, sortAllergens } from "@/lib/allergens";
import { CATEGORIES } from "@/lib/sample-menu";
import { testIdFor } from "@/lib/test-id";
import { formatPrice } from "@/lib/validation";

export type PublicDish = {
  id: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  allergens: AllergenCode[];
};

/** Keeps the filter in the address bar so it survives a reload and can be shared. */
function writeUrl(avoid: string[], hide: boolean) {
  const params = new URLSearchParams();
  if (avoid.length) params.set("avoid", avoid.join(","));
  if (hide) params.set("hide", "1");
  const query = params.toString().replaceAll("%2C", ",");
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}

export function MenuFilter({
  dishes,
  initialAvoid,
  initialHide,
}: {
  dishes: PublicDish[];
  initialAvoid: AllergenCode[];
  initialHide: boolean;
}) {
  const [avoid, setAvoid] = useState<AllergenCode[]>(initialAvoid);
  const [hideUnsafe, setHideUnsafe] = useState(initialHide);
  const filtering = avoid.length > 0;

  const checked = dishes.map((dish) => ({ dish, matches: matchingAllergens(dish.allergens, avoid) }));
  const safeCount = checked.filter((c) => c.matches.length === 0).length;
  const shown = filtering && hideUnsafe ? checked.filter((c) => c.matches.length === 0) : checked;

  function toggle(code: AllergenCode) {
    const next = sortAllergens(avoid.includes(code) ? avoid.filter((c) => c !== code) : [...avoid, code]);
    setAvoid(next);
    writeUrl(next, hideUnsafe);
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="allergy-filter" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 id="allergy-filter" className="mb-3 font-semibold text-slate-900">
          I&apos;m allergic to:
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Allergies to avoid">
          {ALLERGENS.map((a) => {
            const on = avoid.includes(a.code);
            return (
              <button
                key={a.code}
                type="button"
                aria-pressed={on}
                data-testid={`filter-${a.code}`}
                onClick={() => toggle(a.code)}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                  on ? "border-red-600 bg-red-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-800" data-testid="filter-summary" aria-live="polite">
            {filtering
              ? `${safeCount} of ${dishes.length} dishes are free from your selected allergens.`
              : "Select your allergies to see which dishes are safe for you."}
          </p>
          <label htmlFor="hide-unsafe" className="flex items-center gap-2 text-sm text-slate-700">
            <input
              id="hide-unsafe"
              type="checkbox"
              data-testid="hide-unsafe"
              className="size-4 accent-emerald-600"
              checked={hideUnsafe}
              onChange={(e) => {
                setHideUnsafe(e.target.checked);
                writeUrl(avoid, e.target.checked);
              }}
            />
            Hide dishes that aren&apos;t safe
          </label>
        </div>
      </section>

      {CATEGORIES.map((category) => {
        const items = shown.filter((c) => c.dish.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} aria-labelledby={`cat-${category}`} data-testid={`menu-category-${category.toLowerCase()}`}>
            <h2 id={`cat-${category}`} className="mb-3 text-lg font-bold text-slate-900">
              {category}
            </h2>
            <ul className="space-y-3">
              {items.map(({ dish, matches }) => (
                <li
                  key={dish.id}
                  data-testid={`menu-dish-${testIdFor(dish.name)}`}
                  className={`rounded-xl border bg-white p-4 shadow-sm ${
                    filtering ? (matches.length ? "border-red-200" : "border-emerald-300") : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-900" data-testid="menu-dish-name">
                      {dish.name}
                    </h3>
                    <span className="shrink-0 font-semibold text-slate-900" data-testid="menu-dish-price">
                      {formatPrice(dish.priceCents)}
                    </span>
                  </div>
                  {dish.description && <p className="mt-1 text-sm text-slate-600">{dish.description}</p>}
                  {filtering && (
                    <p
                      data-testid="menu-dish-verdict"
                      className={`mt-3 inline-block rounded-lg px-3 py-1 text-sm font-semibold ${
                        matches.length ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {matches.length ? `Contains: ${formatAllergens(matches)}` : "Safe for you"}
                    </p>
                  )}
                  <div className="mt-3">
                    <AllergenBadges allergens={dish.allergens} highlight={matches} testId="menu-dish-allergens" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
