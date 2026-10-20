# Project rules — TestSprite Hackathon Season 4 entry

**Before ANY action in this repo** (creating files, writing code, setup steps, PRs), check it against the checklist below and name the item numbers it serves. Every required item must exist. Don't skip or improvise. If something is unclear, ask the user. At the end of every task, report which checklist items are done and which are pending.

## THE TWO CORE RULES (read first, every time)
1. **"Best projects with TestSprite wired into the repo, so every pull request gets tested."**
   Every change reaches `main` through a PR. Every PR (drafts included) gets a TestSprite check. A failing check blocks the merge. Never merge a PR without a green TestSprite check.
2. **"Commit history is the proof the app is yours."**
   Commit small and often from day one, one logical change per commit, with clear messages. No giant dump commits. Never squash or force-push away history on `main`. Commits use the user's own git identity only, with no AI credit.

## Agent loop (Write → Test → Fix → Test again)
- All changes go through a PR on a `feat/...` or `fix/...` branch. Never push directly to `main`.
- When the TestSprite check fails, run `testsprite test failure get <test-id>` to read the failure bundle. Fix the ROOT CAUSE in the app code, never weaken or delete the test, then push again so the check reruns.
- Add or extend TestSprite tests for every new feature in the same PR.
- NO AI ATTRIBUTION anywhere: no `Co-Authored-By` trailer, no "Generated with Claude Code" line, no AI author/contributor credit in commits, PRs, README, docs, package.json, or any file.
- Never commit secrets. The TestSprite test-account credentials live only in TestSprite's sign-in settings.

## Checklist (verbatim — do not alter)

```
TESTSPRITE SEASON 4 — WINNING CHECKLIST
Deadline: Oct 22, 11:59 PM PT

=====================================================
PART A — THE NON-NEGOTIABLES (miss one = weak or disqualified)
=====================================================
1.  TestSprite account created with the SAME email you will submit with.
2.  Public GitHub repo containing all source code.
3.  App deployed to a PUBLIC live URL (not localhost).
4.  Hosting that creates a separate PREVIEW URL for every PR (Vercel recommended).
5.  Test suite generated in the TestSprite 3.0 Web Portal BEFORE wiring up GitHub.
6.  TestSprite GitHub App installed on the repo
    (Workspace Settings → Connections → Integrations → GitHub → Connect).
7.  A Pull Request trigger created in the project's "GitHub Action" tab,
    with the preview URL pattern, e.g. https://APP-git-{branch-slug}-TEAM.vercel.app
8.  README.md: what the app is, the live URL, and WHAT THE TEST SUITE COVERS.
9.  .gitignore present. Zero secrets committed (no API keys, passwords, .env files).
10. At least one PR with a TestSprite check on it, ending GREEN.
11. Discord post in #hackathon-submissions with:
    PR link + live URL + TestSprite account email + name (+ optional video).

=====================================================
PART B — BUILT INTO THE APP CODE (so TestSprite can test it deeply)
=====================================================
12. Every button, input, and key element has a clear, accessible label
    (proper <label>, aria-label, visible text) and a data-testid.
    → The AI tester finds things reliably = fewer flaky tests.
13. Every action shows a visible, specific result message:
    "Task 'Buy milk' saved", "Email is invalid", "Total: $42.50".
    → Lets tests check REAL outcomes (assertion depth = points).
14. Proper validation and error states on every form
    (empty field, wrong format, too long, duplicate).
    → Gives TestSprite edge cases to test (scenario design = points).
15. Empty states ("No items yet — create your first one") and loading states.
16. A dedicated TEST ACCOUNT for TestSprite to log in with.
    Credentials stored ONLY in TestSprite's sign-in settings, never in the repo.
17. Predictable demo/seed data so tests produce the same result every run.
    Optional: a safe "reset demo data" action for the test account only.
18. No captcha, bot-blocking, or random popups that would block the AI tester.
19. A /health or status endpoint that shows the app is up.
20. Fast, stable pages: no animation or timing tricks that cause flaky tests.
21. Real persistence (database), so tests can verify that data survives a reload.

=====================================================
PART C — FILES IN THE REPO THAT SHOW PROFESSIONALISM
=====================================================
22. docs/PRD.md: a clear product spec (features, user flows, rules, edge cases).
    Upload it to TestSprite as a Test Source. Their docs call the PRD
    "the biggest lever on plan quality".
23. docs/TEST-PLAN.md: a table of every feature → which TestSprite tests cover it
    (happy path, validation, errors, auth, edge cases).
24. .env.example listing the required variables with fake values.
25. .github/pull_request_template.md with a checklist
    ("TestSprite check green", "tests added for new feature").
26. CONTRIBUTING.md explaining the Write → Test → Fix → Test-again loop.
27. CLAUDE.md / AGENTS.md: instructions for the coding agent, e.g.
    "When the TestSprite check fails, run `testsprite test failure get`,
    fix the root cause, never weaken the test, push again."
28. The TestSprite agent skill installed via `testsprite setup` and committed,
    so anyone who clones the repo gets the same loop.
29. LICENSE file (MIT).
30. Clean commit history and well-named branches (feat/..., fix/...).

=====================================================
PART D — WIRING THE "TESTS THAT RUN THEMSELVES" (40 pts)
=====================================================
31. PR trigger ON for every PR into main.
32. "Include draft PRs" ON.
33. "Block PR until tests pass" ON once the suite is stable.
34. GitHub branch protection on main: require the TestSprite status check
    + require PRs (no direct pushes). This proves "it holds the merge".
35. Coverage breadth: tests for EVERY main feature, not just the homepage
    (signup/login, create, edit, delete, search/filter, settings, logout).
36. Assertion depth: tests check the exact text, values, and saved data.
37. Scenario design: happy paths + invalid input + empty states
    + unauthorized access + reload-persistence + mobile layout.
38. README badge or section linking to the latest green TestSprite PR check.

=====================================================
PART E — PROVING THE LOOP (the strongest evidence they ask for)
=====================================================
39. PR #1 "baseline": the full suite runs and is green.
40. PR #2 "real feature": add a genuine feature with the AI agent →
    TestSprite catches a real bug → check RED (merge blocked) →
    agent reads the failure bundle → fixes the root cause → pushes →
    check reruns → GREEN → merged.
    "A run that failed, was fixed, and went green is the strongest proof."
41. In that PR's description, document the story honestly:
    what failed, what the failure bundle said, what was fixed, links to both runs.
42. Add new TestSprite tests for each new feature in its PR
    (the suite grows with the app).
43. Keep 3–5 merged PRs, all with TestSprite checks, so judges see a habit,
    not a one-off.

=====================================================
PART F — STAND-OUT / INNOVATION IDEAS (20 pts)
=====================================================
44. A public "Quality" page inside the app showing recent PRs and their
    TestSprite check results (read from the public GitHub API, no secrets).
    The app visibly displays that it tests itself.
45. A "How this app is verified" section in the README with a simple diagram:
    Agent writes → PR → Vercel preview → TestSprite → fail/fix → green → merge.
46. Dependabot enabled: dependency-update PRs get tested by TestSprite too,
    so the repo "keeps testing itself after the hackathon ends".
    (Watch your credits; the free plan has 150/month.)
47. Optional extra layer: a GitHub Actions workflow using the TestSprite CLI
    (`testsprite ci init github` / `ci run`) with a job summary and JUnit report.
    Only if credits allow, because it runs tests a second time.
48. A short demo GIF/video of the red → fix → green loop
    (not scored, but helps judges understand in 30 seconds).

=====================================================
PART G — ENGAGEMENT BONUS (open-ended extra points)
=====================================================
49. Post progress on X tagging @test_sprite (screenshots of red → green PRs).
50. Take part in Discord polls and discussions.
51. Write a long-form post (dev.to / Medium / Hashnode): "How my app tests itself
    on every PR with TestSprite".
52. Give specific feedback in Discord on the portal/CLI
    (what you tried, what happened, what you expected). This may earn credits.

=====================================================
PART H — OPTIONAL: CLI IMPROVEMENT BONUS ($1,000 pool, until Oct 29)
=====================================================
53. Find a real problem in github.com/TestSprite/testsprite-cli → open an issue →
    assign it to yourself.
54. PR that fixes it, WITH tests, body containing "Closes #N",
    the ticked entry checkbox, and your Discord username.
55. Max 3 PRs, $50+ each if merged. No typo/whitespace/comment-only PRs.
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
