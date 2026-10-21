import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { loadMenu } from "@/lib/menu";
import { pickerOptions } from "@/lib/picker-options";
import { RecipeManager } from "./recipe-manager";

export const metadata: Metadata = { title: "Sub-recipes" };

export default async function RecipesPage() {
  const owner = await requireOwner("/dashboard/recipes");
  const menu = await loadMenu(owner.restaurant.id);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-5xl leading-none text-ink">Sub-recipes</h1>
        <p className="mt-1 text-stone-600">
          Sauces, dressings and bases you reuse across dishes. Their allergens are calculated from what&apos;s inside,
          at any depth.
        </p>
      </div>
      <RecipeManager recipes={menu.recipes} options={pickerOptions(menu)} />
    </div>
  );
}
