import Link from "next/link";
import { Logo } from "@/components/logo";
import { primaryButton, secondaryButton } from "@/components/ui";

const STEPS = [
  {
    title: "Add your ingredients",
    text: "Tick the allergens each ingredient contains — once.",
  },
  {
    title: "Build sub-recipes and dishes",
    text: "SafePlate calculates every dish's allergens, even ones hidden three sauces deep.",
  },
  {
    title: "Share your menu",
    text: "Customers scan a QR code, select their allergies and instantly see what's safe.",
  },
];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { loggedOut } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="font-semibold text-slate-700 hover:text-slate-900" data-testid="nav-login">
            Log in
          </Link>
          <Link href="/signup" className={primaryButton} data-testid="nav-signup">
            Create free account
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        {loggedOut && (
          <p
            role="status"
            data-testid="flash-success"
            className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
          >
            You have been logged out.
          </p>
        )}

        <section className="py-10 sm:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">Allergen-safe menus</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Know exactly what&apos;s in every dish — and let your guests know too.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            SafePlate tracks the 14 major allergens through every ingredient, sauce and dish, then gives your
            restaurant a public menu customers can filter by their allergies.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/m/demo-bistro" className={primaryButton} data-testid="view-demo-menu">
              View demo menu
            </Link>
            <Link href="/signup" className={secondaryButton} data-testid="hero-signup">
              Create free account
            </Link>
          </div>
        </section>

        <section aria-labelledby="how-it-works" className="pb-16">
          <h2 id="how-it-works" className="mb-6 text-2xl font-bold text-slate-900">
            How it works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="mb-3 grid size-8 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} SafePlate</span>
          <span>Every change to SafePlate is tested automatically before it ships.</span>
        </div>
      </footer>
    </div>
  );
}
