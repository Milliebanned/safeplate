import type { Component } from "./allergens";
import { formatAllergens } from "./allergens";
import type { Menu } from "./menu";

export const NO_COMPONENTS = "Add at least one ingredient or sub-recipe";

/** Keeps only components that exist in this restaurant's menu, without duplicates. */
export function ownComponents(menu: Menu, components: Component[]): Component[] {
  const ingredientIds = new Set(menu.ingredients.map((i) => i.id));
  const recipeIds = new Set(menu.recipes.map((r) => r.id));
  const seen = new Set<string>();
  return components.filter((c) => {
    const k = `${c.kind}:${c.id}`;
    const exists = c.kind === "ingredient" ? ingredientIds.has(c.id) : recipeIds.has(c.id);
    if (!exists || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** `Dish "X" saved. Contains: Milk, Sesame.` / `… Contains no major allergens.` */
export function savedMessage(kind: "Dish" | "Sub-recipe", name: string, allergens: readonly string[]) {
  return allergens.length
    ? `${kind} "${name}" saved. Contains: ${formatAllergens(allergens)}.`
    : `${kind} "${name}" saved. Contains no major allergens.`;
}
