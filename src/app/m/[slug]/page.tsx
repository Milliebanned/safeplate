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
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="relative isolate overflow-hidden">
        <svg aria-hidden viewBox="0 0 400 400" className="absolute -right-24 -top-28 -z-10 size-[26rem] opacity-90">
          <circle cx="200" cy="200" r="150" fill="none" stroke="#d5f2e3" strokeWidth="58" strokeLinecap="round" strokeDasharray="520 1000" />
          <circle cx="200" cy="200" r="186" fill="none" stroke="#059669" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 10" />
        </svg>
        <div className="mx-auto max-w-2xl px-4 pb-4 pt-8">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 hover:underline">
            SafePlate · Allergen menu
          </Link>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl" data-testid="menu-restaurant-name">
            {restaurant.name}
          </h1>
          <p className="mt-2 text-slate-600">Tap your allergies to see what&apos;s safe for you — every dish is checked down to its last ingredient.</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-4">
        <p
          role="note"
          className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900"
        >
          <span aria-hidden>ⓘ</span>
          <span data-testid="menu-disclaimer">Allergen information is provided by the restaurant. Always tell your server about your allergies.</span>
        </p>

        {dishes.length === 0 ? (
          <p className="rounded-3xl border border-white/80 bg-white/80 p-6 text-slate-600" data-testid="menu-empty">
            This restaurant hasn&apos;t published any dishes yet.
          </p>
        ) : (
          <MenuFilter dishes={dishes} initialAvoid={parseAvoidParam(query.avoid)} initialHide={query.hide === "1"} />
        )}
      </main>

      <footer className="mt-10 border-t border-slate-200/80 bg-white/60">
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
