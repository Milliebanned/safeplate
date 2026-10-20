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

  const recipeId = new Map<string, string>();
  for (const r of SAMPLE_RECIPES) {
    const [row] = await tx.insert(recipes).values({ restaurantId, name: r.name }).returning({ id: recipes.id });
    recipeId.set(r.name, row.id);
    await tx.insert(recipeComponents).values(
      r.components.map((c) =>
        "ingredient" in c
          ? { recipeId: row.id, ingredientId: ingredientId.get(c.ingredient)! }
          : { recipeId: row.id, childRecipeId: recipeId.get(c.recipe)! },
      ),
    );
  }

  for (const d of SAMPLE_DISHES) {
    const [row] = await tx
      .insert(dishes)
      .values({
        restaurantId,
        name: d.name,
        description: d.description,
        category: d.category,
        priceCents: d.priceCents,
        published: d.published,
      })
      .returning({ id: dishes.id });
    await tx.insert(dishComponents).values(
      d.components.map((c) =>
        "ingredient" in c
          ? { dishId: row.id, ingredientId: ingredientId.get(c.ingredient)! }
          : { dishId: row.id, recipeId: recipeId.get(c.recipe)! },
      ),
    );
  }

  return {
    ingredients: SAMPLE_INGREDIENTS.length,
    recipes: SAMPLE_RECIPES.length,
    dishes: SAMPLE_DISHES.length,
  };
}
