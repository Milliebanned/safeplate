# Agent instructions for SafePlate

SafePlate tells restaurant guests which dishes are safe for their allergies. A wrong answer can put someone in hospital, so **every change is verified before it ships.** These rules apply to every coding agent and every human contributor.

## The two core rules

1. **Every pull request is tested by TestSprite, and nothing merges without a green check.**
   - All changes reach `main` through a pull request. Never push directly to `main`.
   - Every PR, including draft PRs, runs the TestSprite suite against its own Vercel preview deployment.
   - A failing TestSprite check blocks the merge.
2. **Commit history is the record of the work.**
   - Commit small and often, one logical change per commit, with a clear message (`feat: …`, `fix: …`, `test: …`, `docs: …`).
   - Never squash, rewrite or force-push history on `main`.

## The verification loop (Write → Test → Fix → Test again)

1. **Write:** make the change on a `feat/…` or `fix/…` branch (27 characters or fewer, so the Vercel preview address stays predictable for TestSprite) and open a PR.
2. **Test:** TestSprite runs the suite on the PR's preview deployment and posts the result on the PR.
3. **Fix:** if a test fails, read the failure bundle (`testsprite test failure get <test-id>`). It contains the failing step, DOM snapshots, a root-cause hypothesis and a suggested fix target. **Fix the root cause in the app.** Never weaken, skip or delete a test to make it pass.
4. **Test again:** push the fix. The check reruns, and the PR can merge only when it is green.

## Working on the code

- **Product spec:** `docs/PRD.md` is the source of truth for behaviour and the exact user-facing messages. Update it in the same PR as any behaviour change, so TestSprite plans stay accurate.
- **Allergen logic** lives in `src/lib/allergens.ts`, with unit tests in `src/lib/allergens.test.ts`. Any change there needs tests.
- **New features** need new or updated TestSprite tests in the same PR, so the suite grows with the app.
- **Testability:** every interactive element has a visible label and a `data-testid`. Every action shows a specific result message.
- **Local checks before pushing:** `npx next typegen && npm run typecheck && npm test && npm run lint && npm run build`.
- **Secrets:** never commit secrets. `.env.local` is git-ignored; `.env.example` lists the variables. Test-account credentials live only in TestSprite's settings.
- **Database changes:** edit `src/db/schema.ts`, then run `npm run db:generate` and commit the migration in `drizzle/`. Migrations run automatically before every build.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
