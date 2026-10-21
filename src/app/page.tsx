import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import { PlateHero } from "@/components/plate-hero";
import { HERO_DISHES } from "@/lib/hero-dishes";

const STEPS = [
  {
    numeral: "I",
    title: "Add your ingredients",
    text: "Mark the allergens in each ingredient. You only do it once.",
  },
  {
    numeral: "II",
    title: "Build sub-recipes and dishes",
    text: "SafePlate calculates the allergens in every dish, including those hidden in sauces and bases.",
  },
  {
    numeral: "III",
    title: "Share your menu",
    text: "Guests scan a QR code, choose their allergies and see at a glance what is safe.",
  },
];

const STANDARD = [
  { label: "Write", text: "Each change is made on its own branch." },
  { label: "Test", text: "TestSprite runs the full test suite against a live preview." },
  { label: "Fix", text: "A failing test blocks the release until the cause is fixed." },
  { label: "Serve", text: "Only verified changes reach your menu." },
];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { loggedOut } = await searchParams;

  return (
    <div className="theme-ink grain flex flex-1 flex-col overflow-x-clip">
      <header className="relative z-30">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5">
          <Logo tone="light" />
          <nav className="flex items-center gap-1 text-sm sm:gap-3">
            <Link href="/login" className="rounded-full px-4 py-2 text-ivory/80 hover:text-ivory" data-testid="nav-login">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-ivory/25 px-4 py-2 text-ivory hover:border-ivory/60"
              data-testid="nav-signup"
            >
              Create free account
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5">
        {loggedOut && (
          <p
            role="status"
            data-testid="flash-success"
            className="mx-auto mt-2 max-w-md rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2.5 text-center text-sm text-emerald-200"
          >
            You have been logged out.
          </p>
        )}

        <section className="pb-20 pt-10 text-center sm:pt-14">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brass">Allergen-safe menus for restaurants</p>
          <h1 className="mx-auto mt-6 max-w-5xl font-serif text-[clamp(3.2rem,9vw,8rem)] leading-[0.92] tracking-tight text-ivory">
            Know what&apos;s <span className="italic text-brass">on every plate.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ivory/70">
            SafePlate traces the 14 major allergens through every ingredient, sauce and dish, then gives your guests a menu
            they can filter by their own allergies.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/m/demo-bistro"
              className="rounded-full bg-ivory px-7 py-3.5 text-sm font-semibold text-ink hover:bg-white"
              data-testid="view-demo-menu"
            >
              View demo menu
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-ivory/25 px-7 py-3.5 text-sm font-semibold text-ivory hover:border-ivory/60"
              data-testid="hero-signup"
            >
              Create free account
            </Link>
          </div>

          <div className="mt-20">
            <PlateHero dishes={HERO_DISHES} />
          </div>
        </section>

        <div className="hairline" />

        <section aria-labelledby="how-it-works" className="py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-brass">The method</p>
              <h2 id="how-it-works" className="mt-4 font-serif text-5xl leading-none text-ivory sm:text-6xl">
                How it <span className="italic">works</span>
              </h2>
              <p className="mt-6 max-w-sm text-ivory/60">
                Three courses, served in order. The work happens once, and every dish stays accurate as your recipes change.
              </p>
            </div>
            <ol className="divide-y divide-ivory/10 border-y border-ivory/10">
              {STEPS.map((step) => (
                <li key={step.title} className="group grid grid-cols-[4rem_minmax(0,1fr)] gap-6 py-8">
                  <span className="font-serif text-4xl italic text-brass/80 transition-colors group-hover:text-brass">
                    {step.numeral}.
                  </span>
                  <div>
                    <h3 className="font-serif text-3xl text-ivory">{step.title}</h3>
                    <p className="mt-2 max-w-md text-ivory/60">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="standard"
          className="relative mb-24 overflow-hidden rounded-[2.5rem] border border-ivory/10 bg-bottle px-6 py-14 sm:px-14"
        >
          <LogoMark tone="light" className="pointer-events-none absolute -right-16 -top-16 size-72 opacity-[0.07]" />
          <p className="text-[11px] uppercase tracking-[0.4em] text-emerald-300/80">Our standard</p>
          <h2 id="standard" className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-ivory sm:text-5xl">
            Every change is tested <span className="italic">before it reaches a guest.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-ivory/65">
            A single mistake could hide a peanut. That is why no update to SafePlate is released until our automated tests
            have checked it on a live copy of the app.
          </p>
          <Link
            href="/verified"
            className="mt-7 inline-flex rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-ink hover:bg-white"
            data-testid="view-safety-record"
          >
            See the safety record
          </Link>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-ivory/10 bg-ivory/10 sm:grid-cols-4">
            {STANDARD.map((step, i) => (
              <li key={step.label} className="bg-bottle p-6">
                <p className="font-serif text-2xl italic text-emerald-200">
                  {String(i + 1).padStart(2, "0")} {step.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ivory/65">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-ivory/50">
          <span className="flex items-center gap-2">
            <LogoMark tone="light" className="size-5" />© {new Date().getFullYear()} SafePlate
          </span>
          <Link href="/verified" className="hover:text-ivory">
            Every change to SafePlate is tested automatically before it ships.
          </Link>
        </div>
      </footer>
    </div>
  );
}
