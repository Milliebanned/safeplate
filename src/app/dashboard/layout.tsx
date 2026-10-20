import Link from "next/link";
import { Logo } from "@/components/logo";
import { requireOwner } from "@/lib/auth";
import { logout } from "../(auth)/actions";
import { DashboardNav } from "./nav";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const owner = await requireOwner();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo href="/dashboard" />
            <span className="hidden text-sm text-slate-500 sm:inline" data-testid="restaurant-name">
              {owner.restaurant.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/m/${owner.restaurant.slug}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              data-testid="nav-public-menu"
            >
              View public menu
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                data-testid="logout"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Dashboard" className="mx-auto max-w-5xl px-4 pb-2">
          <DashboardNav />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
