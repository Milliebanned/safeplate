import { eq, inArray } from "drizzle-orm";
import { SAMPLE_DISHES, SAMPLE_INGREDIENTS, SAMPLE_RECIPES } from "@/lib/sample-menu";
import type { Tx } from "./index";
import { dishComponents, dishes, ingredients, recipeComponents, recipes } from "./schema";

/** Removes every ingredient, sub-recipe and dish of one restaurant. */
export async function clearMenu(tx: Tx, restaurantId: string) {
  await tx.delete(dishes).where(eq(dishes.restaurantId, restaurantId));
  const recipeIds = (
    await tx.select({ id: recipes.id }).from(recipes).where(eq(recipes.restaurantId, restaurantId))
  ).map((r) => r.id);
  if (recipeIds.length) {
    await tx.delete(recipeComponents).where(inArray(recipeComponents.recipeId, recipeIds));
  }
  await tx.delete(recipes).where(eq(recipes.restaurantId, restaurantId));
  await tx.delete(ingredients).where(eq(ingredients.restaurantId, restaurantId));
}

/** Replaces one restaurant's menu with the PRD sample menu (section 7). */
export async function loadSampleMenu(tx: Tx, restaurantId: string) {
  await clearMenu(tx, restaurantId);

  const ingredientRows = await tx
    .insert(ingredients)
    .values(SAMPLE_INGREDIENTS.map((i) => ({ restaurantId, name: i.name, allergens: i.allergens })))
    .returning({ id: ingredients.id, name: ingredients.name });
  const ingredientId = new Map(ingredientRows.map((r) => [r.name, r.id]));

  // Batched inserts: a handful of round trips instead of one per row, so this stays fast.
  const recipeRows = await tx
    .insert(recipes)
    .values(SAMPLE_RECIPES.map((r) => ({ restaurantId, name: r.name })))
    .returning({ id: recipes.id, name: recipes.name });
  const recipeId = new Map(recipeRows.map((r) => [r.name, r.id]));
  await tx.insert(recipeComponents).values(
    SAMPLE_RECIPES.flatMap((r) =>
      r.components.map((c) =>
        "ingredient" in c
          ? { recipeId: recipeId.get(r.name)!, ingredientId: ingredientId.get(c.ingredient)! }
          : { recipeId: recipeId.get(r.name)!, childRecipeId: recipeId.get(c.recipe)! },
      ),
    ),
  );

  const dishRows = await tx
    .insert(dishes)
    .values(
      SAMPLE_DISHES.map((d) => ({
        restaurantId,
        name: d.name,
        description: d.description,
        category: d.category,
        priceCents: d.priceCents,
        published: d.published,
      })),
    )
    .returning({ id: dishes.id, name: dishes.name });
  const dishId = new Map(dishRows.map((d) => [d.name, d.id]));
  await tx.insert(dishComponents).values(
    SAMPLE_DISHES.flatMap((d) =>
      d.components.map((c) =>
        "ingredient" in c
          ? { dishId: dishId.get(d.name)!, ingredientId: ingredientId.get(c.ingredient)! }
          : { dishId: dishId.get(d.name)!, recipeId: recipeId.get(c.recipe)! },
      ),
    ),
  );

  return {
    ingredients: SAMPLE_INGREDIENTS.length,
    recipes: SAMPLE_RECIPES.length,
    dishes: SAMPLE_DISHES.length,
  };
}
