import Link from "next/link";
import { Logo } from "@/components/logo";
import { requireOwner } from "@/lib/auth";
import { logout } from "../(auth)/actions";
import { DashboardNav } from "./nav";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const owner = await requireOwner();

  return (
    <div className="flex flex-1 flex-col bg-[#f4efe6] text-ink lg:flex-row">
      <aside className="theme-ink flex flex-col gap-5 px-4 py-4 lg:sticky lg:top-0 lg:h-svh lg:w-72 lg:shrink-0 lg:gap-8 lg:px-5 lg:py-7">
        <div className="flex items-center justify-between gap-3 lg:block">
          <Logo href="/dashboard" tone="light" />
          <div className="lg:mt-8">
            <p className="hidden text-[10px] uppercase tracking-[0.35em] text-ivory/40 lg:block">Your restaurant</p>
            <p className="max-w-[12rem] truncate font-serif text-lg text-ivory lg:mt-1 lg:max-w-none lg:text-2xl" data-testid="restaurant-name">
              {owner.restaurant.name}
            </p>
          </div>
        </div>
        <nav aria-label="Dashboard" className="lg:flex-1">
          <DashboardNav />
        </nav>
        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
          <Link
            href={`/m/${owner.restaurant.slug}`}
            className="flex-1 rounded-full border border-ivory/20 px-4 py-2 text-center text-sm text-ivory hover:border-ivory/50"
            data-testid="nav-public-menu"
          >
            View public menu
          </Link>
          <form action={logout} className="lg:w-full">
            <button
              type="submit"
              className="w-full rounded-full px-4 py-2 text-sm text-ivory/55 hover:text-ivory"
              data-testid="logout"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 lg:px-12 lg:py-14">{children}</main>
    </div>
  );
}
