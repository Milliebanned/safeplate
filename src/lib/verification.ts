import "server-only";

// Reads the public GitHub history of this repository: each pull request and the result of
// the "TestSprite V3" status check on its latest commit. Cached for five minutes so the page
// stays fast and well inside GitHub's public API limits.

const REPO = "Milliebanned/safeplate";
const CHECK = "TestSprite V3";
const API = "https://api.github.com";
const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "safeplate-verified-page" };

export type Verification = {
  number: number;
  title: string;
  url: string;
  state: "merged" | "open" | "closed";
  date: string; // ISO date of merge, close or opening
  check: { state: "success" | "failure" | "pending" | "error" | "missing"; summary: string; reportUrl: string | null };
};

type PullRequest = {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  merged_at: string | null;
  closed_at: string | null;
  created_at: string;
  head: { sha: string };
};

type CombinedStatus = { statuses: { context: string; state: string; description: string | null; target_url: string | null }[] };

async function github<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: HEADERS, next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`GitHub ${response.status} for ${path}`);
  return response.json() as Promise<T>;
}

/** The ten most recent pull requests with their TestSprite verdicts, newest first. */
export async function loadVerifications(): Promise<Verification[]> {
  const pulls = await github<PullRequest[]>(`/repos/${REPO}/pulls?state=all&per_page=10&sort=created&direction=desc`);
  return Promise.all(
    pulls.map(async (pr) => {
      const status = await github<CombinedStatus>(`/repos/${REPO}/commits/${pr.head.sha}/status`);
      const latest = status.statuses.find((s) => s.context === CHECK);
      const state = pr.merged_at ? "merged" : pr.state === "open" ? "open" : "closed";
      return {
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        state,
        date: pr.merged_at ?? pr.closed_at ?? pr.created_at,
        check: latest
          ? {
              state: (["success", "failure", "pending", "error"].includes(latest.state) ? latest.state : "error") as Verification["check"]["state"],
              summary: latest.description ?? "",
              reportUrl: latest.target_url,
            }
          : { state: "missing", summary: "No TestSprite run on this pull request", reportUrl: null },
      } satisfies Verification;
    }),
  );
}
