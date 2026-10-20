import Link from "next/link";
import { Logo } from "@/components/logo";
import { PlateHero } from "@/components/plate-hero";
import { TiltCard } from "@/components/tilt-card";
import { primaryButton } from "@/components/ui";
import { HERO_DISHES } from "@/lib/hero-dishes";

const STEPS = [
  {
    title: "Add your ingredients",
    text: "Tick the allergens each ingredient contains — once.",
    icon: "M4 7h16M4 12h10M4 17h7",
  },
  {
    title: "Build sub-recipes and dishes",
    text: "SafePlate calculates every dish's allergens, even ones hidden three sauces deep.",
    icon: "M12 3v18M3 12h18",
  },
  {
    title: "Share your menu",
    text: "Customers scan a QR code, select their allergies and instantly see what's safe.",
    icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2z",
  },
];

const LOOP = [
  { label: "Write", text: "A change is made on its own branch." },
  { label: "Test", text: "TestSprite runs the full suite on a live preview." },
  { label: "Fix", text: "Any failure blocks the merge until the root cause is fixed." },
  { label: "Ship", text: "Only green changes reach your guests." },
];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { loggedOut } = await searchParams;

  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-[#f7f5ef]/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <Link href="/login" className="rounded-lg px-3 py-2 font-semibold text-slate-700 hover:text-slate-900" data-testid="nav-login">
              Log in
            </Link>
            <Link href="/signup" className={primaryButton} data-testid="nav-signup">
              Create free account
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        {loggedOut && (
          <p
            role="status"
            data-testid="flash-success"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
          >
            You have been logged out.
          </p>
        )}

        <section className="grid items-center gap-10 pb-12 pt-10 lg:grid-cols-12 lg:gap-6 lg:pt-14">
          <div className="lg:col-span-5">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              Allergen-safe menus
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Know exactly what&apos;s in every dish
              <span className="font-extralight"> — and let your guests know too.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              SafePlate tracks the 14 major allergens through every ingredient, sauce and dish, then gives your restaurant
              a public menu customers can filter by their allergies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/m/demo-bistro"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
                data-testid="view-demo-menu"
              >
                View demo menu
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-white"
                data-testid="hero-signup"
              >
                Create free account
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <svg viewBox="0 0 24 24" className="size-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Every change to SafePlate is tested automatically before it ships.
            </p>
          </div>

          <div className="lg:col-span-7">
            <PlateHero dishes={HERO_DISHES} />
          </div>
        </section>

        <section aria-labelledby="how-it-works" className="py-14">
          <h2 id="how-it-works" className="font-display mb-8 text-3xl font-bold tracking-tight text-slate-900">
            How it works
          </h2>
          <ol className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <TiltCard className="h-full rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d={step.icon} />
                      </svg>
                    </span>
                    <span className="font-display text-4xl font-extralight text-slate-300">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{step.text}</p>
                </TiltCard>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="verified"
          className="relative mb-16 overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-10 text-white sm:px-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border-[40px] border-emerald-800/40"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Why you can trust it</p>
          <h2 id="verified" className="font-display mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            A mistake here could hide a peanut. So nothing ships unverified.
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-4">
            {LOOP.map((step, i) => (
              <li key={step.label} className="rounded-2xl border border-emerald-800 bg-emerald-900/50 p-4">
                <p className="text-sm font-semibold text-emerald-300">
                  {i + 1}. {step.label}
                </p>
                <p className="mt-1 text-sm text-emerald-50/90">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} SafePlate</span>
          <span>Every change to SafePlate is tested automatically before it ships.</span>
        </div>
      </footer>
    </div>
  );
}
