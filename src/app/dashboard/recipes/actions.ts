"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { recipeComponents, recipes } from "@/db/schema";
import { type ActionResult, isUniqueViolation } from "@/lib/action-result";
import { type Component, findCycle } from "@/lib/allergens";
import { requireOwner } from "@/lib/auth";
import { NO_COMPONENTS, ownComponents, savedMessage } from "@/lib/components";
import { loadMenu } from "@/lib/menu";
import { duplicateNameMessage, joinNames, validateItemName } from "@/lib/validation";

export async function saveRecipe(input: { id?: string; name: string; components: Component[] }): Promise<ActionResult> {
  const owner = await requireOwner("/dashboard/recipes");
  const restaurantId = owner.restaurant.id;
  const name = input.name.trim();
  const menu = await loadMenu(restaurantId);
  if (input.id && !menu.recipes.some((r) => r.id === input.id)) {
    return { ok: false, message: "That sub-recipe no longer exists." };
  }

  const fieldErrors: Record<string, string> = {};
  const nameError = validateItemName(name);
  if (nameError) fieldErrors.name = nameError;
  else if (menu.recipes.some((r) => r.id !== input.id && r.name.toLowerCase() === name.toLowerCase())) {
    fieldErrors.name = duplicateNameMessage("sub-recipe", name);
  }
  const components = ownComponents(menu, input.components);
  if (components.length === 0) fieldErrors.components = NO_COMPONENTS;

  if (input.id && components.length) {
    const graph = new Map(menu.recipes.map((r) => [r.id, r.components as Component[]]));
    const offender = findCycle(graph, input.id, components);
    if (offender) {
      const other = menu.recipes.find((r) => r.id === offender)?.name ?? "that sub-recipe";
      fieldErrors.components = `"${name}" can't include "${other}" because "${other}" already contains "${name}".`;
    }
  }
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const db = getDb();
  let recipeId: string;
  try {
    recipeId = await db.transaction(async (tx) => {
      let id = input.id;
      if (id) {
        await tx.update(recipes).set({ name }).where(and(eq(recipes.id, id), eq(recipes.restaurantId, restaurantId)));
        await tx.delete(recipeComponents).where(eq(recipeComponents.recipeId, id));
      } else {
        [{ id }] = await tx.insert(recipes).values({ restaurantId, name }).returning({ id: recipes.id });
      }
      await tx.insert(recipeComponents).values(
        components.map((c) =>
          c.kind === "ingredient" ? { recipeId: id!, ingredientId: c.id } : { recipeId: id!, childRecipeId: c.id },
        ),
      );
      return id!;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { name: duplicateNameMessage("sub-recipe", name) } };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  const saved = (await loadMenu(restaurantId)).recipes.find((r) => r.id === recipeId)!;
  return { ok: true, message: savedMessage("Sub-recipe", name, saved.allergens) };
}

export async function deleteRecipe(id: string): Promise<ActionResult> {
  const owner = await requireOwner("/dashboard/recipes");
  const menu = await loadMenu(owner.restaurant.id);
  const recipe = menu.recipes.find((r) => r.id === id);
  if (!recipe) return { ok: false, message: "That sub-recipe no longer exists." };
  if (recipe.usedIn.length) {
    return { ok: false, message: `Can't delete "${recipe.name}": it is used in ${joinNames(recipe.usedIn)}.` };
  }
  await getDb().transaction(async (tx) => {
    await tx.delete(recipeComponents).where(eq(recipeComponents.recipeId, id));
    await tx.delete(recipes).where(and(eq(recipes.id, id), eq(recipes.restaurantId, owner.restaurant.id)));
  });
  revalidatePath("/", "layout");
  return { ok: true, message: `Sub-recipe "${recipe.name}" deleted.` };
}
