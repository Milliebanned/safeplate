import type { PickerOption } from "@/components/component-picker";
import type { Menu } from "./menu";

/** Everything that can go into a sub-recipe or dish: sub-recipes first, then ingredients. */
export function pickerOptions(menu: Menu): PickerOption[] {
  return [
    ...menu.recipes.map((r) => ({ kind: "recipe" as const, id: r.id, name: r.name, allergens: r.allergens })),
    ...menu.ingredients.map((i) => ({ kind: "ingredient" as const, id: i.id, name: i.name, allergens: i.allergens })),
  ];
}
