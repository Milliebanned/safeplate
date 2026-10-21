import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
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
    .map(({ id, name, description, category, priceCents, photoUrl, allergens }) => ({
      id,
      name,
      description,
      category,
      priceCents,
      photoUrl,
      allergens,
    }));

  return (
    <div className="theme-ink grain flex flex-1 flex-col overflow-x-clip">
      <header className="mx-auto w-full max-w-3xl px-5 pb-6 pt-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-ivory/60 hover:text-ivory" aria-label="SafePlate home">
          <LogoMark tone="light" className="size-6" />
        </Link>
        <p className="mt-6 text-[11px] uppercase tracking-[0.4em] text-brass">Allergen menu</p>
        <h1 className="mt-4 font-serif text-[clamp(2.8rem,10vw,5.5rem)] leading-[0.95] text-ivory" data-testid="menu-restaurant-name">
          {restaurant.name}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-ivory/60">
          Choose your allergies and every dish tells you whether it is safe, checked down to the last ingredient.
        </p>
        <div className="mx-auto mt-8 flex max-w-xs items-center gap-3" aria-hidden>
          <span className="hairline flex-1" />
          <span className="size-1.5 rounded-full bg-brass" />
          <span className="hairline flex-1" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-5 pb-16">
        <p role="note" className="mx-auto max-w-xl text-center text-sm italic text-ivory/50">
          <span data-testid="menu-disclaimer">Allergen information is provided by the restaurant. Always tell your server about your allergies.</span>
        </p>

        {dishes.length === 0 ? (
          <p className="rounded-[2rem] border border-ivory/10 p-8 text-center font-serif text-2xl italic text-ivory/70" data-testid="menu-empty">
            This restaurant hasn&apos;t published any dishes yet.
          </p>
        ) : (
          <MenuFilter dishes={dishes} initialAvoid={parseAvoidParam(query.avoid)} initialHide={query.hide === "1"} />
        )}
      </main>

      <footer className="border-t border-ivory/10">
        <p className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-5 py-6 text-sm text-ivory/45">
          <LogoMark tone="light" className="size-4" />
          Allergen checks by{" "}
          <Link href="/" className="text-ivory/70 hover:text-ivory">
            SafePlate
          </Link>
        </p>
      </footer>
    </div>
  );
}
