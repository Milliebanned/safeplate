import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { loadMenu } from "@/lib/menu";
import { IngredientManager } from "./ingredient-manager";

export const metadata: Metadata = { title: "Ingredients" };

export default async function IngredientsPage() {
  const owner = await requireOwner("/dashboard/ingredients");
  const menu = await loadMenu(owner.restaurant.id);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-5xl leading-none text-ink">Ingredients</h1>
        <p className="mt-1 text-stone-600">
          Record the allergens in each ingredient once. Every sub-recipe and dish that uses it updates automatically.
        </p>
      </div>
      <IngredientManager ingredients={menu.ingredients} />
    </div>
  );
}
