"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AllergenBadges } from "@/components/allergen-badges";
import { ALLERGEN_COLORS, AllergenEmblem } from "@/components/allergen-emblem";
import { TiltCard } from "@/components/tilt-card";
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
  const reduce = useReducedMotion();
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

  // The text always changes instantly; only the flip is animated, so what you read is never stale.
  const flipIn = reduce ? { opacity: [0, 1] } : { rotateX: [-90, 0], opacity: [0, 1] };

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="allergy-filter"
        className="relative z-10 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-5"
      >
        <h2 id="allergy-filter" className="mb-3 font-semibold text-slate-900">
          I&apos;m allergic to:
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Allergies to avoid">
          {ALLERGENS.map((a) => {
            const on = avoid.includes(a.code);
            return (
              <motion.button
                key={a.code}
                type="button"
                aria-pressed={on}
                data-testid={`filter-${a.code}`}
                onClick={() => toggle(a.code)}
                whileTap={reduce ? undefined : { scale: 0.92 }}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium ${
                  on ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-600/25" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-full ring-2 ring-white/70"
                  style={{ backgroundColor: ALLERGEN_COLORS[a.code] }}
                />
                {a.label}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="[perspective:600px]">
            <motion.p
              key={filtering ? `${safeCount}/${dishes.length}` : "none"}
              animate={flipIn}
              transition={{ duration: 0.35 }}
              className="text-sm font-semibold text-slate-800"
              data-testid="filter-summary"
              aria-live="polite"
            >
              {filtering
                ? `${safeCount} of ${dishes.length} dishes are free from your selected allergens.`
                : "Select your allergies to see which dishes are safe for you."}
            </motion.p>
          </div>
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
            <h2 id={`cat-${category}`} className="font-display mb-4 flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
              {category}
              <span className="h-px flex-1 bg-gradient-to-r from-slate-300 to-transparent" aria-hidden />
            </h2>
            <ul className="space-y-4">
              {items.map(({ dish, matches }) => {
                const verdict = matches.length ? `Contains: ${formatAllergens(matches)}` : "Safe for you";
                return (
                  <li key={dish.id} data-testid={`menu-dish-${testIdFor(dish.name)}`}>
                    <TiltCard
                      max={5}
                      className={`rounded-3xl border bg-white/85 p-4 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.45)] backdrop-blur sm:p-5 ${
                        filtering ? (matches.length ? "border-red-200" : "border-emerald-300") : "border-white/80"
                      }`}
                    >
                      <div className="flex gap-4">
                        <AllergenEmblem name={dish.name} allergens={dish.allergens} highlight={matches} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold text-slate-900" data-testid="menu-dish-name">
                              {dish.name}
                            </h3>
                            <span className="shrink-0 font-display text-lg font-bold text-slate-900" data-testid="menu-dish-price">
                              {formatPrice(dish.priceCents)}
                            </span>
                          </div>
                          {dish.description && <p className="mt-1 text-sm text-slate-600">{dish.description}</p>}
                          {filtering && (
                            <div className="mt-3 [perspective:600px]">
                              <motion.div
                                key={verdict}
                                animate={flipIn}
                                transition={{ duration: 0.35 }}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-sm font-semibold ${
                                  matches.length ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"
                                }`}
                              >
                                <span aria-hidden>{matches.length ? "⚠" : "✓"}</span>
                                <span data-testid="menu-dish-verdict">{verdict}</span>
                              </motion.div>
                            </div>
                          )}
                          <div className="mt-3">
                            <AllergenBadges allergens={dish.allergens} highlight={matches} testId="menu-dish-allergens" />
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
