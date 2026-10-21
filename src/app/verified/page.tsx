import type { Metadata } from "next";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import { loadVerifications, type Verification } from "@/lib/verification";

export const metadata: Metadata = { title: "Safety record" };
export const revalidate = 300;

const REPO_URL = "https://github.com/Milliebanned/safeplate";

const VERDICT: Record<Verification["check"]["state"], { label: string; dot: string; text: string }> = {
  success: { label: "Passed", dot: "bg-emerald-400", text: "text-emerald-200" },
  failure: { label: "Failed", dot: "bg-red-400", text: "text-red-200" },
  error: { label: "Failed", dot: "bg-red-400", text: "text-red-200" },
  pending: { label: "Running", dot: "bg-brass", text: "text-brass" },
  missing: { label: "Not tested", dot: "bg-ivory/30", text: "text-ivory/60" },
};

const STATE_LABEL = { merged: "Merged", open: "Open", closed: "Closed" } as const;

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function VerifiedPage() {
  let verifications: Verification[] | null = null;
  try {
    verifications = await loadVerifications();
  } catch {
    verifications = null;
  }
  const latest = verifications?.find((v) => v.state === "merged" && v.check.state !== "missing");

  return (
    <div className="theme-ink grain flex flex-1 flex-col overflow-x-clip">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Logo tone="light" />
        <Link href="/m/demo-bistro" className="rounded-full border border-ivory/25 px-4 py-2 text-sm text-ivory hover:border-ivory/60">
          View demo menu
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-20">
        <section className="pb-14 pt-10">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brass">Safety record</p>
          <h1 className="mt-5 max-w-4xl font-serif text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.95] text-ivory" data-testid="verified-heading">
            Every change, <span className="italic text-brass">tested before it reaches a guest.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/65">
            SafePlate changes only through pull requests. Each one is deployed to a private preview and checked end to end by
            TestSprite. A failing check blocks the change, so a mistake can never hide an allergen on a live menu.
          </p>
        </section>

        {verifications === null ? (
          <p className="rounded-[2rem] border border-ivory/10 p-8 text-ivory/70" data-testid="verified-unavailable">
            The verification history is temporarily unavailable.{" "}
            <a href={`${REPO_URL}/pulls?q=is%3Apr`} className="text-ivory underline decoration-brass underline-offset-4">
              See every pull request on GitHub
            </a>
            .
          </p>
        ) : (
          <>
            {latest && (
              <section
                aria-labelledby="latest"
                className="relative mb-12 overflow-hidden rounded-[2.5rem] border border-ivory/10 bg-bottle px-7 py-9 sm:px-10"
                data-testid="verified-latest"
              >
                <LogoMark tone="light" className="pointer-events-none absolute -right-10 -top-10 size-56 opacity-[0.07]" />
                <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-300/80">Latest release</p>
                <h2 id="latest" className="mt-3 font-serif text-4xl text-ivory sm:text-5xl">
                  {latest.check.summary || VERDICT[latest.check.state].label}
                </h2>
                <p className="mt-3 text-ivory/65">
                  Pull request #{latest.number}, {latest.title}. Merged {dateFormat.format(new Date(latest.date))}.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  {latest.check.reportUrl && (
                    <a href={latest.check.reportUrl} className="rounded-full bg-ivory px-5 py-2.5 font-semibold text-ink hover:bg-white">
                      Open the TestSprite report
                    </a>
                  )}
                  <a href={latest.url} className="rounded-full border border-ivory/25 px-5 py-2.5 text-ivory hover:border-ivory/60">
                    View the pull request
                  </a>
                </div>
              </section>
            )}

            <section aria-labelledby="history">
              <h2 id="history" className="mb-2 font-serif text-3xl text-ivory">
                Recent changes
              </h2>
              <p className="mb-6 text-sm text-ivory/55">The TestSprite verdict on the latest commit of each pull request.</p>
              <ul className="divide-y divide-ivory/10 border-y border-ivory/10" data-testid="verified-list">
                {verifications.map((v) => {
                  const verdict = VERDICT[v.check.state];
                  return (
                    <li key={v.number} className="grid gap-3 py-5 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center" data-testid={`verified-row-${v.number}`}>
                      <span className="font-serif text-2xl italic text-brass/80">#{v.number}</span>
                      <div className="min-w-0">
                        <a href={v.url} className="font-serif text-xl text-ivory hover:underline">
                          {v.title}
                        </a>
                        <p className="mt-1 text-sm text-ivory/50">
                          {STATE_LABEL[v.state]} · {dateFormat.format(new Date(v.date))}
                          {v.check.summary && v.check.state !== "missing" ? ` · ${v.check.summary}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 rounded-full border border-ivory/15 px-3.5 py-1 text-sm ${verdict.text}`}>
                          <span aria-hidden className={`size-1.5 rounded-full ${verdict.dot}`} />
                          <span data-testid="verified-verdict">{verdict.label}</span>
                        </span>
                        {v.check.reportUrl && (
                          <a href={v.check.reportUrl} className="text-sm text-ivory/60 underline decoration-ivory/20 underline-offset-4 hover:text-ivory">
                            Report
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-ivory/50">
          <span className="flex items-center gap-2">
            <LogoMark tone="light" className="size-5" />
            Verified by TestSprite on every pull request
          </span>
          <a href={REPO_URL} className="hover:text-ivory">
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
