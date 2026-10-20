import { allergenLabel } from "@/lib/allergens";

export function AllergenBadges({
  allergens,
  highlight = [],
  testId = "allergens",
}: {
  allergens: readonly string[];
  highlight?: readonly string[];
  testId?: string;
}) {
  if (allergens.length === 0) {
    return (
      <span className="text-sm text-slate-500" data-testid={testId}>
        No major allergens
      </span>
    );
  }
  return (
    <ul className="flex flex-wrap gap-1.5" data-testid={testId} aria-label="Allergens">
      {allergens.map((code) => (
        <li
          key={code}
          data-testid={`allergen-${code}`}
          className={
            highlight.includes(code)
              ? "rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white"
              : "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900"
          }
        >
          {allergenLabel(code)}
        </li>
      ))}
    </ul>
  );
}
