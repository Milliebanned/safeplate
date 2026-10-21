// The 14 major food allergens, in the fixed alphabetical display order from the PRD.
export const ALLERGENS = [
  { code: "celery", label: "Celery" },
  { code: "crustaceans", label: "Crustaceans" },
  { code: "eggs", label: "Eggs" },
  { code: "fish", label: "Fish" },
  { code: "gluten", label: "Gluten" },
  { code: "lupin", label: "Lupin" },
  { code: "milk", label: "Milk" },
  { code: "molluscs", label: "Molluscs" },
  { code: "mustard", label: "Mustard" },
  { code: "peanuts", label: "Peanuts" },
  { code: "sesame", label: "Sesame" },
  { code: "soybeans", label: "Soybeans" },
  { code: "sulphites", label: "Sulphites" },
  { code: "tree-nuts", label: "Tree nuts" },
] as const;

export type AllergenCode = (typeof ALLERGENS)[number]["code"];

const ORDER = new Map<string, number>(ALLERGENS.map((a, i) => [a.code, i]));
const LABELS = new Map<string, string>(ALLERGENS.map((a) => [a.code, a.label]));

export function isAllergenCode(value: string): value is AllergenCode {
  return ORDER.has(value);
}

/** Removes unknown codes and duplicates, and returns codes in display order. */
export function sortAllergens(codes: Iterable<string>): AllergenCode[] {
  return [...new Set(codes)]
    .filter(isAllergenCode)
    .sort((a, b) => ORDER.get(a)! - ORDER.get(b)!);
}

export function allergenLabel(code: string): string {
  return LABELS.get(code) ?? code;
}

/** "Milk, Sesame", or "" for an empty list. */
export function formatAllergens(codes: Iterable<string>): string {
  return sortAllergens(codes).map(allergenLabel).join(", ");
}

/** Parses "?avoid=milk,sesame" into valid codes in display order. */
export function parseAvoidParam(value: string | string[] | undefined): AllergenCode[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return sortAllergens(raw.split(",").map((s) => s.trim().toLowerCase()));
}

// ---------------------------------------------------------------------------
// Allergen calculation: ingredient → sub-recipe → dish (PRD section 4)
// ---------------------------------------------------------------------------

export type Component =
  | { kind: "ingredient"; id: string }
  | { kind: "recipe"; id: string };

export type MenuGraph = {
  ingredients: Map<string, readonly string[]>; // ingredient id → allergen codes
  recipes: Map<string, readonly Component[]>; // recipe id → components
};

/**
 * Returns a function that calculates the allergens of any recipe, memoized.
 * Throws if a recipe contains itself at any depth, because a cycle means the data is corrupt.
 */
export function createAllergenResolver(graph: MenuGraph) {
  const memo = new Map<string, AllergenCode[]>();
  const visiting = new Set<string>();

  function recipeAllergens(recipeId: string): AllergenCode[] {
    const cached = memo.get(recipeId);
    if (cached) return cached;
    if (visiting.has(recipeId)) {
      throw new Error(`Sub-recipe cycle detected at ${recipeId}`);
    }
    visiting.add(recipeId);
    const result = componentsAllergens(graph.recipes.get(recipeId) ?? []);
    visiting.delete(recipeId);
    memo.set(recipeId, result);
    return result;
  }

  function componentsAllergens(components: readonly Component[]): AllergenCode[] {
    const found = new Set<string>();
    for (const c of components) {
      const codes =
        c.kind === "ingredient" ? (graph.ingredients.get(c.id) ?? []) : recipeAllergens(c.id);
      for (const code of codes) found.add(code);
    }
    return sortAllergens(found);
  }

  return { recipeAllergens, componentsAllergens };
}

/**
 * True if `recipeId` would reach itself after its components are set to `components`.
 * Returns the id of the offending direct component, or null if the change is safe.
 */
export function findCycle(
  recipes: Map<string, readonly Component[]>,
  recipeId: string,
  components: readonly Component[],
): string | null {
  const reaches = (from: string, seen: Set<string>): boolean => {
    if (from === recipeId) return true;
    if (seen.has(from)) return false;
    seen.add(from);
    return (recipes.get(from) ?? []).some((c) => c.kind === "recipe" && reaches(c.id, seen));
  };
  for (const c of components) {
    if (c.kind === "recipe" && reaches(c.id, new Set())) return c.id;
  }
  return null;
}

/** Allergens from `dishAllergens` that the customer asked to avoid, in display order. */
export function matchingAllergens(dishAllergens: readonly string[], avoid: readonly string[]) {
  const avoidSet = new Set(avoid);
  return sortAllergens(dishAllergens.filter((a) => avoidSet.has(a)));
}
