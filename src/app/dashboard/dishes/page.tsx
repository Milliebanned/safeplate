import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { loadMenu } from "@/lib/menu";
import { pickerOptions } from "@/lib/picker-options";
import { DishManager } from "./dish-manager";

export const metadata: Metadata = { title: "Dishes" };

export default async function DishesPage() {
  const owner = await requireOwner("/dashboard/dishes");
  const menu = await loadMenu(owner.restaurant.id);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dishes</h1>
        <p className="mt-1 text-slate-600">
          Build dishes from ingredients and sub-recipes. Allergens are calculated for you — you never type them twice.
        </p>
      </div>
      <DishManager dishes={menu.dishes} options={pickerOptions(menu)} />
    </div>
  );
}
