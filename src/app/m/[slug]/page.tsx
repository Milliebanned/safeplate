import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parseAvoidParam } from "@/lib/allergens";
import { findRestaurantBySlug, loadMenu } from "@/lib/menu";
import { MenuFilter, type PublicDish } from "./menu-filter";

export async function generateMetadata({ params }: PageProps<"/m/[slug]">): Promise<Metadata> {
  const restaurant = await findRestaurantBySlug((await params).slug);
  return { title: restaurant ? `${restaurant.name} menu` : "Menu not found" };
}

export default async function PublicMenuPage({ params, searchParams }: PageProps<"/m/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const restaurant = await findRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const menu = await loadMenu(restaurant.id);
  const dishes: PublicDish[] = menu.dishes
    .filter((d) => d.published)
    .map(({ id, name, description, category, priceCents, allergens }) => ({
      id,
      name,
      description,
      category,
      priceCents,
      allergens,
    }));

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Allergen menu</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900" data-testid="menu-restaurant-name">
            {restaurant.name}
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-6">
        <p
          role="note"
          data-testid="menu-disclaimer"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Allergen information is provided by the restaurant. Always tell your server about your allergies.
        </p>

        {dishes.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600" data-testid="menu-empty">
            This restaurant hasn&apos;t published any dishes yet.
          </p>
        ) : (
          <MenuFilter dishes={dishes} initialAvoid={parseAvoidParam(query.avoid)} initialHide={query.hide === "1"} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-2xl px-4 py-5 text-center text-sm text-slate-500">
          Powered by{" "}
          <Link href="/" className="font-semibold text-emerald-700 hover:underline">
            SafePlate
          </Link>
        </p>
      </footer>
    </div>
  );
}
