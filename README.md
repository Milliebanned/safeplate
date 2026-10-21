# SafePlate

**Allergen-safe menus for restaurants, verified on every pull request.**

[![Verified by TestSprite on every pull request](https://img.shields.io/badge/TestSprite-every%20PR%20verified-0b3b2c?style=flat-square)](https://safeplate.milliebanned.xyz/verified)

🔗 **Live app:** https://safeplate.milliebanned.xyz
🍽️ **Demo menu (no sign-up):** https://safeplate.milliebanned.xyz/m/demo-bistro

A guest with a sesame allergy asks, "Is the salmon safe?" Too often the honest answer is "I think so". The dressing changed last week, and nobody updated the allergen sheet.

SafePlate fixes that at the source. A restaurant records the allergens in each **ingredient** once. It builds **sub-recipes** (sauces, dressings, bases) and **dishes** from those ingredients, and SafePlate **calculates every dish's allergens automatically**, through any number of nested sauces. Change one ingredient and every affected dish updates instantly. Guests scan a QR code, tap their allergies, and see **"Safe for you"** or **"Contains: Sesame"** on every dish.

## Features

| | |
|---|---|
| 🧂 **Ingredients** | Tag each ingredient with any of the 14 major allergens. Search, edit, and safe delete (an ingredient that's still in use can't be deleted). |
| 🥣 **Sub-recipes** | Reusable sauces and bases built from ingredients *and other sub-recipes*, with protection against circular recipes. |
| 🍝 **Dishes** | Price, category, description and Published/Draft status. Allergens are calculated, never typed by hand. |
| 📱 **Public menu + QR code** | Mobile-first menu where guests filter by allergy. The filter lives in the URL (`?avoid=milk,sesame`), so it survives reloads and can be shared. |
| 🧪 **Sample menu** | One click loads a realistic sample menu (23 ingredients, 5 sub-recipes, 9 dishes) to explore or start over. |
| 🔒 **Owner accounts** | Email/password sign-up, hashed passwords, HTTP-only sessions. Each owner can only ever see and change their own restaurant. |

## How SafePlate is verified

A bug here isn't a cosmetic glitch: it could hide a peanut. So **no change reaches production without passing TestSprite**:

```
 ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐   ┌──────────────────────┐
 │ Coding agent │──▶│ Pull request │──▶│ Vercel preview    │──▶│ TestSprite runs the  │
 │ writes code  │   │ opened       │   │ deploy for the PR │   │ full suite on the PR │
 └──────────────┘   └──────────────┘   └───────────────────┘   └──────────┬───────────┘
        ▲                                                                 │
        │                                          ┌──────────────────────┴──────────┐
        │                                          ▼                                 ▼
        │                               ┌─────────────────────┐          ┌─────────────────────┐
        └───────────────────────────────│ ❌ Failed: merge    │          │ ✅ Passed: merge    │
          agent reads the failure       │ blocked             │          │ allowed → production│
          bundle and fixes the root     └─────────────────────┘          └─────────────────────┘
          cause, then pushes again
```

- **Every PR is tested.** The TestSprite GitHub App runs the suite against that PR's own preview deployment, including draft PRs.
- **Failures block the merge.** The TestSprite check is a required status check on `main`, and nobody can push to `main` directly.
- **Fixes target the root cause.** The coding agent reads TestSprite's failure bundle (failing step, DOM snapshot, root-cause hypothesis) and fixes the app, never the test. See [AGENTS.md](AGENTS.md).
- **Each PR gets its own data.** Every preview deployment runs on its own copy of the database, so PR tests never touch the live menus.
- **Unit tests guard the core logic.** The allergen calculation (`src/lib/allergens.ts`) is unit-tested against every expected result in the PRD.

## Proof: what TestSprite caught

The full history is public on the in-app **[Safety record](https://safeplate.milliebanned.xyz/verified)** page, built from this repository's pull requests and their TestSprite checks.

| Pull request | What happened |
|---|---|
| [#1](https://github.com/Milliebanned/safeplate/pull/1) Test plan | TestSprite's first PR run **failed 23/24**: "Create ingredient with allergen tags". The allergen was saved, but the confirmation did not say so and the form had already cleared. |
| [#3](https://github.com/Milliebanned/safeplate/pull/3) Fix | The confirmation now names the saved allergens (`Ingredient "…" added. Contains: Sesame.`). **Green 24/24**, merged. |
| [#4](https://github.com/Milliebanned/safeplate/pull/4) Fix | 15 new tests found that **confirmations rendered 1,566 px off-screen** after acting low on a long list. They now float at the bottom of the screen. **Green 39/39**, merged. |

Each PR description records what failed, what TestSprite's failure bundle said, the root cause, and the fix.

## What we found while testing the tester

We read the code TestSprite saved after its runs, not only the green ticks. Four things we found and fixed:

1. **"Unique" test data was frozen.** Values the agent chose on its first run (a sign-up email, an ingredient name) were stored permanently, so a later run collided with "already exists". On one PR this **blocked** the sign-up test. The tests now make up a random number on every run and retry if it is taken.
2. **Some saved checks were shallow.** Several stored tests ended by checking only that a page loaded. We rewrote them with the CLI (`testsprite test code put`) to assert the exact results in the PRD, such as `5 of 8 dishes are free from your selected allergens.`
3. **Long branch names hid the preview.** Vercel shortens preview addresses longer than 63 characters, so the PR trigger could not find PR #2's preview. Branch names in this repo are now 27 characters or fewer ([CONTRIBUTING.md](CONTRIBUTING.md)).
4. **An ambiguous step.** "Reload the Settings page" was carried out as a click on the page's own link, which keeps the form as typed. The step now navigates away and back.

## What the test suite covers

The **39-test** TestSprite suite is planned from [docs/PRD.md](docs/PRD.md) and runs against the live app in a real browser. It covers:

- **Accounts:** sign-up (valid and every validation error), duplicate email, login, wrong password, logout, redirect-and-return for protected pages, and signed-out visitors blocked from the dashboard.
- **Ingredients:** add, edit, search (match and no match), duplicate names, length limits, and delete blocked while in use.
- **Sub-recipes:** create with nested components, calculated allergens, "no components" error, and circular-recipe protection.
- **Dishes:** create and edit, price validation, description limit, calculated allergens in the saved message, Published vs Draft.
- **Allergen propagation:** changing one ingredient updates every sub-recipe and dish that uses it.
- **Public menu:** filtering by one or more allergens with exact safe counts, the "Safe for you" / "Contains" verdicts, hiding unsafe dishes, draft dishes never shown, filters surviving reload, and unknown menus.
- **Settings:** menu address changes, name and address validation, address uniqueness, and loading the sample menu.
- **Safety record:** the public page listing each pull request and its TestSprite verdict.

The full feature → test mapping is in [docs/TEST-PLAN.md](docs/TEST-PLAN.md).

## Tech stack

Next.js 16 (App Router, server actions) · TypeScript · Tailwind CSS · Neon Postgres + Drizzle ORM · Vitest · deployed on Vercel · verified by TestSprite.

## Run it locally

```bash
git clone https://github.com/Milliebanned/safeplate.git
cd safeplate
npm install
cp .env.example .env.local   # then fill in your Neon database URLs
npm run db:migrate           # creates tables and the Demo Bistro sample restaurant
npm run dev                  # http://localhost:3000
```

Checks: `npm test` (unit tests) · `npm run typecheck` · `npm run lint` · `npm run build`

## Project docs

- [docs/PRD.md](docs/PRD.md): product requirements, rules and exact messages
- [docs/TEST-PLAN.md](docs/TEST-PLAN.md): what each TestSprite test verifies
- [CONTRIBUTING.md](CONTRIBUTING.md): how changes flow through the verification loop
- [AGENTS.md](AGENTS.md): rules for coding agents

## License

[MIT](LICENSE)

> Allergen information shown by SafePlate is provided by each restaurant. Guests should always tell their server about their allergies.
