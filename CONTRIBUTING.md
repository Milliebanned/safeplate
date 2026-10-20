# Contributing to SafePlate

SafePlate tells people with food allergies what is safe to eat, so correctness comes before speed. Every change goes through the same verification loop.

## The loop: Write → Test → Fix → Test again

1. **Branch.** Create a branch from `main` named `feat/<short-description>` or `fix/<short-description>`.
2. **Write.** Make the change in small, focused commits with clear messages (`feat: …`, `fix: …`, `test: …`, `docs: …`). If behaviour or a user-facing message changes, update [docs/PRD.md](docs/PRD.md) in the same PR.
3. **Check locally.**
   ```bash
   npx next typegen && npm run typecheck && npm test && npm run lint && npm run build
   ```
4. **Open a pull request** using the template. Draft PRs are welcome; they are tested too.
5. **Test.** Vercel deploys a preview of your branch, and the **TestSprite** GitHub App runs the full end-to-end suite against it. The result is posted on the PR and reported as a status check.
6. **Fix.** If the check fails, read the failure bundle:
   ```bash
   testsprite test failure get <test-id>
   ```
   It shows the failing step, DOM snapshots, a root-cause hypothesis and a suggested fix target. **Fix the root cause in the app. Never weaken, skip or delete a test to get a green check.** If a test is genuinely wrong because the spec changed, update the PRD and the test together, and explain why in the PR.
7. **Test again.** Push the fix. The check reruns automatically.
8. **Merge.** `main` only accepts changes through PRs with a green TestSprite check. History on `main` is never squashed or rewritten.

## Adding a feature

- Describe the behaviour and its exact messages in `docs/PRD.md`.
- Add `data-testid` attributes and visible labels to new interactive elements, and show a specific message for every action.
- Add or update TestSprite tests for the new behaviour, and update [docs/TEST-PLAN.md](docs/TEST-PLAN.md).
- Allergen logic changes in `src/lib/allergens.ts` need unit tests in `src/lib/allergens.test.ts`.

## Local setup

See [README.md](README.md#run-it-locally). Never commit `.env.local` or any credentials.
