import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { LogoMark } from "@/components/logo";
import { requireOwner } from "@/lib/auth";
import { loadMenu } from "@/lib/menu";
import { siteUrl } from "@/lib/site-url";
import { ShareActions } from "./share-actions";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage({ searchParams }: PageProps<"/dashboard">) {
  const owner = await requireOwner("/dashboard");
  const [{ welcome }, menu, base] = await Promise.all([searchParams, loadMenu(owner.restaurant.id), siteUrl()]);
  const menuUrl = `${base}/m/${owner.restaurant.slug}`;
  const qrSvg = await QRCode.toString(menuUrl, {
    type: "svg",
    margin: 0,
    width: 176,
    color: { dark: "#0d0c0a", light: "#f3ede2" },
  });

  const stats = [
    { label: "Ingredients", value: menu.ingredients.length, testId: "count-ingredients" },
    { label: "Sub-recipes", value: menu.recipes.length, testId: "count-recipes" },
    { label: "Dishes", value: menu.dishes.length, testId: "count-dishes" },
    { label: "Published dishes", value: menu.dishes.filter((d) => d.published).length, testId: "count-published" },
  ];
  const empty = stats.slice(0, 3).every((s) => s.value === 0);

  return (
    <div className="space-y-12">
      {welcome && (
        <p role="status" data-testid="flash-success" className="rounded-full border border-emerald-700/20 bg-emerald-700/10 px-5 py-2.5 text-sm text-emerald-900">
          Welcome to SafePlate, {owner.restaurant.name}!
        </p>
      )}

      <header>
        <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Overview</p>
        <h1 className="mt-3 font-serif text-5xl leading-none text-ink sm:text-6xl">{owner.restaurant.name}</h1>
      </header>

      {empty && (
        <p data-testid="empty-menu" className="rounded-2xl border border-[#d4a24c]/40 bg-[#d4a24c]/10 px-5 py-4 text-sm text-stone-800">
          Your menu is empty. Start by adding ingredients, or load the sample menu from Settings.
        </p>
      )}

      <dl className="grid grid-cols-2 border-y border-stone-300/80 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className={`px-1 py-6 sm:px-5 ${i > 0 ? "sm:border-l sm:border-stone-300/80" : ""} ${i % 2 === 1 ? "border-l border-stone-300/80 pl-5 sm:pl-5" : ""}`}>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{stat.label}</dt>
            <dd className="mt-2 font-serif text-6xl leading-none text-ink" data-testid={stat.testId}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="share" className="grid items-center gap-10 lg:grid-cols-[auto_minmax(0,1fr)]">
        {/* The printable table card */}
        <div id="table-card" className="mx-auto w-72 rotate-[-2deg] rounded-[1.75rem] bg-ink p-7 text-center text-ivory shadow-[0_40px_60px_-30px_rgba(13,12,10,0.6)] print:rotate-0 print:shadow-none">
          <LogoMark tone="light" className="mx-auto size-7" />
          <p className="mt-5 text-[9px] uppercase tracking-[0.4em] text-brass">Allergen menu</p>
          <p className="mt-2 font-serif text-3xl leading-tight">{owner.restaurant.name}</p>
          <div className="mx-auto mt-5 w-44 rounded-2xl bg-ivory p-3" data-testid="menu-qr" role="img" aria-label={`QR code for ${menuUrl}`}>
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
          </div>
          <p className="mt-5 font-serif text-lg italic text-ivory/80">Scan to see what&apos;s safe for you</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Share</p>
          <h2 id="share" className="mt-3 font-serif text-4xl leading-tight text-ink">
            Your public menu
          </h2>
          <p className="mt-3 max-w-md text-stone-600">
            Print this card for your tables, or share the link. Guests filter your menu by their allergies, with no app and no
            account needed.
          </p>
          <Link
            href={`/m/${owner.restaurant.slug}`}
            className="mt-5 inline-block break-all font-serif text-xl text-ink underline decoration-[#d4a24c] decoration-2 underline-offset-4 hover:decoration-ink"
            data-testid="public-menu-link"
          >
            {menuUrl}
          </Link>
          <div className="mt-6">
            <ShareActions url={menuUrl} />
          </div>
        </div>
      </section>
    </div>
  );
}
