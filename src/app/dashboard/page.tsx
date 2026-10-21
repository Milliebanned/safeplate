import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { cardClass } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { loadMenu } from "@/lib/menu";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage({ searchParams }: PageProps<"/dashboard">) {
  const owner = await requireOwner("/dashboard");
  const [{ welcome }, menu, base] = await Promise.all([searchParams, loadMenu(owner.restaurant.id), siteUrl()]);
  const menuUrl = `${base}/m/${owner.restaurant.slug}`;
  const qrSvg = await QRCode.toString(menuUrl, { type: "svg", margin: 1, width: 192 });

  const stats = [
    { label: "Ingredients", value: menu.ingredients.length, testId: "count-ingredients" },
    { label: "Sub-recipes", value: menu.recipes.length, testId: "count-recipes" },
    { label: "Dishes", value: menu.dishes.length, testId: "count-dishes" },
    { label: "Published dishes", value: menu.dishes.filter((d) => d.published).length, testId: "count-published" },
  ];
  const empty = stats.slice(0, 3).every((s) => s.value === 0);

  return (
    <div className="space-y-8">
      {welcome && (
        <p
          role="status"
          data-testid="flash-success"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
        >
          Welcome to SafePlate, {owner.restaurant.name}!
        </p>
      )}

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-slate-600">{owner.restaurant.name}</p>
      </div>

      {empty && (
        <p data-testid="empty-menu" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your menu is empty. Start by adding ingredients, or load the sample menu from Settings.
        </p>
      )}

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={cardClass}>
            <dt className="text-sm text-slate-600">{stat.label}</dt>
            <dd className="font-display mt-1 text-4xl font-bold text-slate-900" data-testid={stat.testId}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className={`${cardClass} flex flex-col gap-6 sm:flex-row sm:items-center`} aria-labelledby="share">
        <div
          className="mx-auto size-48 shrink-0 sm:mx-0"
          data-testid="menu-qr"
          role="img"
          aria-label={`QR code for ${menuUrl}`}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div>
          <h2 id="share" className="text-lg font-semibold text-slate-900">
            Your public menu
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Print this QR code for your tables. Customers can filter your menu by their allergies — no app or account
            needed.
          </p>
          <Link
            href={`/m/${owner.restaurant.slug}`}
            className="mt-3 inline-block break-all font-medium text-emerald-700 hover:underline"
            data-testid="public-menu-link"
          >
            {menuUrl}
          </Link>
        </div>
      </section>
    </div>
  );
}
