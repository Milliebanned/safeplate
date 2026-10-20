"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { dishComponents, dishes } from "@/db/schema";
import { type ActionResult, isUniqueViolation } from "@/lib/action-result";
import type { Component } from "@/lib/allergens";
import { requireOwner } from "@/lib/auth";
import { NO_COMPONENTS, ownComponents, savedMessage } from "@/lib/components";
import { loadMenu } from "@/lib/menu";
import { CATEGORIES } from "@/lib/sample-menu";
import { PRICE_ERROR, duplicateNameMessage, parsePrice, validateDescription, validateItemName } from "@/lib/validation";

export type DishInput = {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: string;
  published: boolean;
  components: Component[];
};

export async function saveDish(input: DishInput): Promise<ActionResult> {
  const owner = await requireOwner("/dashboard/dishes");
  const restaurantId = owner.restaurant.id;
  const menu = await loadMenu(restaurantId);
  if (input.id && !menu.dishes.some((d) => d.id === input.id)) {
    return { ok: false, message: "That dish no longer exists." };
  }

  const name = input.name.trim();
  const description = input.description.trim();
  const fieldErrors: Record<string, string> = {};
  const nameError = validateItemName(name);
  if (nameError) fieldErrors.name = nameError;
  else if (menu.dishes.some((d) => d.id !== input.id && d.name.toLowerCase() === name.toLowerCase())) {
    fieldErrors.name = duplicateNameMessage("dish", name);
  }
  const descriptionError = validateDescription(description);
  if (descriptionError) fieldErrors.description = descriptionError;
  if (!CATEGORIES.includes(input.category as never)) fieldErrors.category = "Choose a category";
  const priceCents = parsePrice(input.price);
  if (priceCents === null) fieldErrors.price = PRICE_ERROR;
  const components = ownComponents(menu, input.components);
  if (components.length === 0) fieldErrors.components = NO_COMPONENTS;
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const values = { name, description, category: input.category, priceCents: priceCents!, published: input.published };
  let dishId: string;
  try {
    dishId = await getDb().transaction(async (tx) => {
      let id = input.id;
      if (id) {
        await tx.update(dishes).set(values).where(and(eq(dishes.id, id), eq(dishes.restaurantId, restaurantId)));
        await tx.delete(dishComponents).where(eq(dishComponents.dishId, id));
      } else {
        [{ id }] = await tx.insert(dishes).values({ restaurantId, ...values }).returning({ id: dishes.id });
      }
      await tx.insert(dishComponents).values(
        components.map((c) =>
          c.kind === "ingredient" ? { dishId: id!, ingredientId: c.id } : { dishId: id!, recipeId: c.id },
        ),
      );
      return id!;
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, fieldErrors: { name: duplicateNameMessage("dish", name) } };
    throw error;
  }

  revalidatePath("/", "layout");
  const saved = (await loadMenu(restaurantId)).dishes.find((d) => d.id === dishId)!;
  return { ok: true, message: savedMessage("Dish", name, saved.allergens) };
}

export async function deleteDish(id: string): Promise<ActionResult> {
  const owner = await requireOwner("/dashboard/dishes");
  const [dish] = await getDb()
    .delete(dishes)
    .where(and(eq(dishes.id, id), eq(dishes.restaurantId, owner.restaurant.id)))
    .returning({ name: dishes.name });
  if (!dish) return { ok: false, message: "That dish no longer exists." };
  revalidatePath("/", "layout");
  return { ok: true, message: `Dish "${dish.name}" deleted.` };
}
