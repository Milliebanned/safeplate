"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview", testId: "nav-overview" },
  { href: "/dashboard/ingredients", label: "Ingredients", testId: "nav-ingredients" },
  { href: "/dashboard/recipes", label: "Sub-recipes", testId: "nav-recipes" },
  { href: "/dashboard/dishes", label: "Dishes", testId: "nav-dishes" },
  { href: "/dashboard/settings", label: "Settings", testId: "nav-settings" },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <ul className="flex gap-1 overflow-x-auto">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              data-testid={link.testId}
              aria-current={active ? "page" : undefined}
              className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
