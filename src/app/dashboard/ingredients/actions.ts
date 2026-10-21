"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { ingredients } from "@/db/schema";
import { type ActionResult, isUniqueViolation } from "@/lib/action-result";
import { sortAllergens } from "@/lib/allergens";
import { requireOwner } from "@/lib/auth";
import { ingredientSavedMessage } from "@/lib/components";
import { loadMenu } from "@/lib/menu";
import { duplicateNameMessage, joinNames, validateItemName } from "@/lib/validation";

export async function saveIngredient(input: {
  id?: string;
  name: string;
  allergens: string[];
}): Promise<ActionResult> {
  const owner = await requireOwner("/dashboard/ingredients");
  const restaurantId = owner.restaurant.id;
  const name = input.name.trim();
  const nameError = validateItemName(name);
  if (nameError) return { ok: false, fieldErrors: { name: nameError } };

  const db = getDb();
  const clash = await db
    .select({ id: ingredients.id })
    .from(ingredients)
    .where(
      and(
        eq(ingredients.restaurantId, restaurantId),
        eq(sql`lower(${ingredients.name})`, name.toLowerCase()),
        input.id ? ne(ingredients.id, input.id) : undefined,
      ),
    );
  if (clash.length) return { ok: false, fieldErrors: { name: duplicateNameMessage("ingredient", name) } };

  const allergens = sortAllergens(input.allergens);
  try {
    if (input.id) {
      const updated = await db
        .update(ingredients)
        .set({ name, allergens })
        .where(and(eq(ingredients.id, input.id), eq(ingredients.restaurantId, restaurantId)))
        .returning({ id: ingredients.id });
      if (!updated.length) return { ok: false, message: "That ingredient no longer exists." };
    } else {
      await db.insert(ingredients).values({ restaurantId, name, allergens });
    }
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, fieldErrors: { name: duplicateNameMessage("ingredient", name) } };
    throw error;
  }

  revalidatePath("/", "layout");
  return { ok: true, message: ingredientSavedMessage(name, allergens, input.id ? "updated" : "added") };
}

export async function deleteIngredient(id: string): Promise<ActionResult> {
  const owner = await requireOwner("/dashboard/ingredients");
  const menu = await loadMenu(owner.restaurant.id);
  const ingredient = menu.ingredients.find((i) => i.id === id);
  if (!ingredient) return { ok: false, message: "That ingredient no longer exists." };
  if (ingredient.usedIn.length) {
    return { ok: false, message: `Can't delete "${ingredient.name}": it is used in ${joinNames(ingredient.usedIn)}.` };
  }
  await getDb()
    .delete(ingredients)
    .where(and(eq(ingredients.id, id), eq(ingredients.restaurantId, owner.restaurant.id)));
  revalidatePath("/", "layout");
  return { ok: true, message: `Ingredient "${ingredient.name}" deleted.` };
}
