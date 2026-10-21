import { allergenLabel } from "@/lib/allergens";
import { ALLERGEN_COLORS } from "./allergen-emblem";

export function AllergenBadges({
  allergens,
  highlight = [],
  testId = "allergens",
  tone = "light",
}: {
  allergens: readonly string[];
  highlight?: readonly string[];
  testId?: string;
  tone?: "light" | "dark";
}) {
  if (allergens.length === 0) {
    return (
      <span className={`text-sm ${tone === "dark" ? "italic text-emerald-300/90" : "text-slate-500"}`} data-testid={testId}>
        No major allergens
      </span>
    );
  }

  if (tone === "dark") {
    return (
      <ul className="flex flex-wrap gap-x-3.5 gap-y-1" data-testid={testId} aria-label="Allergens">
        {allergens.map((code) => {
          const hit = highlight.includes(code);
          return (
            <li
              key={code}
              data-testid={`allergen-${code}`}
              className={`flex items-center gap-1.5 text-[13px] ${hit ? "font-semibold text-red-300" : "text-ivory/60"}`}
            >
              <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: hit ? "#f87171" : ALLERGEN_COLORS[code] }} />
              {allergenLabel(code)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex flex-wrap gap-1.5" data-testid={testId} aria-label="Allergens">
      {allergens.map((code) => (
        <li
          key={code}
          data-testid={`allergen-${code}`}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            highlight.includes(code)
              ? "border-red-600 bg-red-600 text-white"
              : "border-stone-300 bg-[#fbf8f2] text-stone-700"
          }`}
        >
          <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: ALLERGEN_COLORS[code] }} />
          {allergenLabel(code)}
        </li>
      ))}
    </ul>
  );
}
