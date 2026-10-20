"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { loadSampleMenu as loadSample } from "@/db/sample";
import { restaurants } from "@/db/schema";
import { type ActionResult, isUniqueViolation } from "@/lib/action-result";
import { requireOwner } from "@/lib/auth";
import { validateRestaurantName, validateSlug } from "@/lib/validation";

const SLUG_TAKEN = "That menu address is already taken";

export async function saveSettings(input: { name: string; slug: string }): Promise<ActionResult> {
  const owner = await requireOwner("/dashboard/settings");
  const name = input.name.trim();
  const slug = input.slug.trim();
  const fieldErrors: Record<string, string> = {};
  const nameError = validateRestaurantName(name);
  if (nameError) fieldErrors.name = nameError;
  const slugError = validateSlug(slug);
  if (slugError) fieldErrors.slug = slugError;
  else {
    const clash = await getDb()
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(and(eq(restaurants.slug, slug), ne(restaurants.id, owner.restaurant.id)));
    if (clash.length) fieldErrors.slug = SLUG_TAKEN;
  }
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  try {
    await getDb().update(restaurants).set({ name, slug }).where(eq(restaurants.id, owner.restaurant.id));
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, fieldErrors: { slug: SLUG_TAKEN } };
    throw error;
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

export async function loadSampleMenu(): Promise<ActionResult> {
  const owner = await requireOwner("/dashboard/settings");
  const counts = await getDb().transaction((tx) => loadSample(tx, owner.restaurant.id));
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: `Sample menu loaded: ${counts.ingredients} ingredients, ${counts.recipes} sub-recipes, ${counts.dishes} dishes.`,
  };
}
