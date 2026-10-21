"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview", numeral: "I", testId: "nav-overview" },
  { href: "/dashboard/ingredients", label: "Ingredients", numeral: "II", testId: "nav-ingredients" },
  { href: "/dashboard/recipes", label: "Sub-recipes", numeral: "III", testId: "nav-recipes" },
  { href: "/dashboard/dishes", label: "Dishes", numeral: "IV", testId: "nav-dishes" },
  { href: "/dashboard/settings", label: "Settings", numeral: "V", testId: "nav-settings" },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              data-testid={link.testId}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors lg:rounded-xl lg:py-2.5 ${
                active ? "bg-ivory text-ink" : "text-ivory/65 hover:bg-ivory/5 hover:text-ivory"
              }`}
            >
              <span
                className={`hidden w-6 font-serif text-base italic lg:inline ${active ? "text-brass" : "text-ivory/35 group-hover:text-brass/80"}`}
                aria-hidden
              >
                {link.numeral}
              </span>
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
