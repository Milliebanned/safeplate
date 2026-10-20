import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { dishComponents, dishes, ingredients, recipeComponents, recipes, restaurants } from "@/db/schema";
import { type AllergenCode, type Component, createAllergenResolver, sortAllergens } from "./allergens";
import { CATEGORIES } from "./sample-menu";

export type IngredientView = { id: string; name: string; allergens: AllergenCode[]; usedIn: string[] };
export type ComponentView = Component & { name: string };
export type RecipeView = {
  id: string;
  name: string;
  components: ComponentView[];
  allergens: AllergenCode[];
  usedIn: string[];
};
export type DishView = {
  id: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  published: boolean;
  components: ComponentView[];
  allergens: AllergenCode[];
};
export type Menu = { ingredients: IngredientView[]; recipes: RecipeView[]; dishes: DishView[] };

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

/** Loads one restaurant's full menu and calculates every allergen from current data. */
export async function loadMenu(restaurantId: string): Promise<Menu> {
  const db = getDb();
  const [ingredientRows, recipeRows, dishRows] = await Promise.all([
    db.select().from(ingredients).where(eq(ingredients.restaurantId, restaurantId)).orderBy(asc(ingredients.name)),
    db.select().from(recipes).where(eq(recipes.restaurantId, restaurantId)).orderBy(asc(recipes.name)),
    db.select().from(dishes).where(eq(dishes.restaurantId, restaurantId)).orderBy(asc(dishes.name)),
  ]);
  const recipeIds = recipeRows.map((r) => r.id);
  const dishIds = dishRows.map((d) => d.id);
  const [recipeComponentRows, dishComponentRows] = await Promise.all([
    recipeIds.length
      ? db.select().from(recipeComponents).where(inArray(recipeComponents.recipeId, recipeIds))
      : Promise.resolve([]),
    dishIds.length
      ? db.select().from(dishComponents).where(inArray(dishComponents.dishId, dishIds))
      : Promise.resolve([]),
  ]);

  const ingredientName = new Map(ingredientRows.map((i) => [i.id, i.name]));
  const recipeName = new Map(recipeRows.map((r) => [r.id, r.name]));
  const named = (c: Component): ComponentView => ({
    ...c,
    name: (c.kind === "ingredient" ? ingredientName.get(c.id) : recipeName.get(c.id)) ?? "?",
  });

  const recipeGraph = new Map<string, Component[]>(recipeRows.map((r) => [r.id, []]));
  for (const c of recipeComponentRows) {
    recipeGraph
      .get(c.recipeId)!
      .push(c.ingredientId ? { kind: "ingredient", id: c.ingredientId } : { kind: "recipe", id: c.childRecipeId! });
  }
  const dishGraph = new Map<string, Component[]>(dishRows.map((d) => [d.id, []]));
  for (const c of dishComponentRows) {
    dishGraph
      .get(c.dishId)!
      .push(c.ingredientId ? { kind: "ingredient", id: c.ingredientId } : { kind: "recipe", id: c.recipeId! });
  }

  const resolver = createAllergenResolver({
    ingredients: new Map(ingredientRows.map((i) => [i.id, i.allergens])),
    recipes: recipeGraph,
  });

  // Where each ingredient / sub-recipe is used directly (for "Can't delete … it is used in …").
  const usedIn = new Map<string, string[]>();
  const addUse = (id: string, by: string) => usedIn.set(id, [...(usedIn.get(id) ?? []), by]);
  for (const r of recipeRows) for (const c of recipeGraph.get(r.id)!) addUse(c.id, r.name);
  for (const d of dishRows) for (const c of dishGraph.get(d.id)!) addUse(c.id, d.name);

  return {
    ingredients: ingredientRows.map((i) => ({
      id: i.id,
      name: i.name,
      allergens: sortAllergens(i.allergens),
      usedIn: (usedIn.get(i.id) ?? []).sort(),
    })),
    recipes: recipeRows.map((r) => ({
      id: r.id,
      name: r.name,
      components: recipeGraph.get(r.id)!.map(named).sort(byName),
      allergens: resolver.recipeAllergens(r.id),
      usedIn: (usedIn.get(r.id) ?? []).sort(),
    })),
    dishes: dishRows
      .map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        priceCents: d.priceCents,
        published: d.published,
        components: dishGraph.get(d.id)!.map(named).sort(byName),
        allergens: resolver.componentsAllergens(dishGraph.get(d.id)!),
      }))
      .sort(
        (a, b) =>
          CATEGORIES.indexOf(a.category as never) - CATEGORIES.indexOf(b.category as never) || byName(a, b),
      ),
  };
}

export async function findRestaurantBySlug(slug: string) {
  const [row] = await getDb()
    .select({ id: restaurants.id, name: restaurants.name, slug: restaurants.slug })
    .from(restaurants)
    .where(eq(restaurants.slug, slug));
  return row ?? null;
}

/** Groups dishes by category in menu order, skipping empty categories. */
export function groupByCategory<T extends { category: string }>(items: T[]) {
  return CATEGORIES.map((category) => ({ category, items: items.filter((i) => i.category === category) })).filter(
    (g) => g.items.length > 0,
  );
}
