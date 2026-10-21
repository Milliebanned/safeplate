"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AllergenBadges } from "@/components/allergen-badges";
import { ALLERGEN_COLORS, AllergenEmblem } from "@/components/allergen-emblem";
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

  // Text always updates instantly; only the turn of the card is animated.
  const flipIn = reduce ? { opacity: [0, 1] } : { rotateX: [-90, 0], opacity: [0, 1] };

  return (
    <div className="space-y-14">
      <section aria-labelledby="allergy-filter" className="rounded-[2rem] border border-ivory/10 bg-ink-2/80 p-5 backdrop-blur sm:p-7">
        <h2 id="allergy-filter" className="font-serif text-3xl italic text-ivory">
          I&apos;m allergic to:
        </h2>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Allergies to avoid">
          {ALLERGENS.map((a) => {
            const on = avoid.includes(a.code);
            return (
              <motion.button
                key={a.code}
                type="button"
                aria-pressed={on}
                data-testid={`filter-${a.code}`}
                onClick={() => toggle(a.code)}
                whileTap={reduce ? undefined : { scale: 0.94 }}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
                  on ? "border-ivory bg-ivory font-semibold text-ink" : "border-ivory/15 text-ivory/75 hover:border-ivory/40 hover:text-ivory"
                }`}
              >
                <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: ALLERGEN_COLORS[a.code] }} />
                {a.label}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-ivory/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="[perspective:600px]">
            <motion.p
              key={filtering ? `${safeCount}/${dishes.length}` : "none"}
              animate={flipIn}
              transition={{ duration: 0.35 }}
              className={`font-serif text-xl ${filtering ? "text-ivory" : "text-ivory/60"}`}
              data-testid="filter-summary"
              aria-live="polite"
            >
              {filtering
                ? `${safeCount} of ${dishes.length} dishes are free from your selected allergens.`
                : "Select your allergies to see which dishes are safe for you."}
            </motion.p>
          </div>
          <label htmlFor="hide-unsafe" className="flex shrink-0 cursor-pointer items-center gap-2.5 text-sm text-ivory/75">
            <input
              id="hide-unsafe"
              type="checkbox"
              data-testid="hide-unsafe"
              className="size-4 accent-emerald-400"
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
            <div className="mb-6 flex items-center gap-4">
              <span className="hairline flex-1" aria-hidden />
              <h2 id={`cat-${category}`} className="font-serif text-3xl italic text-brass">
                {category}
              </h2>
              <span className="hairline flex-1" aria-hidden />
            </div>
            <ul className="divide-y divide-ivory/10">
              {items.map(({ dish, matches }) => {
                const verdict = matches.length ? `Contains: ${formatAllergens(matches)}` : "Safe for you";
                const unsafe = filtering && matches.length > 0;
                return (
                  <li
                    key={dish.id}
                    data-testid={`menu-dish-${testIdFor(dish.name)}`}
                    className={`flex gap-4 py-6 transition-opacity sm:gap-6 ${unsafe ? "opacity-60" : ""}`}
                  >
                    <AllergenEmblem name={dish.name} allergens={dish.allergens} highlight={matches} size={72} tone="dark" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-serif text-2xl leading-tight text-ivory" data-testid="menu-dish-name">
                          {dish.name}
                        </h3>
                        <span aria-hidden className="mb-1.5 min-w-6 flex-1 border-b border-dotted border-ivory/25" />
                        <span className="font-serif text-xl text-brass" data-testid="menu-dish-price">
                          {formatPrice(dish.priceCents)}
                        </span>
                      </div>
                      {dish.description && <p className="mt-1 text-[15px] italic text-ivory/55">{dish.description}</p>}
                      <div className="mt-3">
                        <AllergenBadges allergens={dish.allergens} highlight={matches} testId="menu-dish-allergens" tone="dark" />
                      </div>
                      {filtering && (
                        <div className="mt-3 [perspective:600px]">
                          <motion.div
                            key={verdict}
                            animate={flipIn}
                            transition={{ duration: 0.35 }}
                            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-sm ${
                              matches.length
                                ? "border-red-400/40 bg-red-500/10 text-red-200"
                                : "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                            }`}
                          >
                            <span aria-hidden className={`size-1.5 rounded-full ${matches.length ? "bg-red-400" : "bg-emerald-400"}`} />
                            <span data-testid="menu-dish-verdict">{verdict}</span>
                          </motion.div>
                        </div>
                      )}
                    </div>
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
