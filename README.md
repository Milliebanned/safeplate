# SafePlate

**Allergen-safe menus for restaurants — verified on every pull request.**

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
- **Unit tests guard the core logic.** The allergen calculation (`src/lib/allergens.ts`) is unit-tested against every expected result in the PRD.

## What the test suite covers

The TestSprite suite is planned from [docs/PRD.md](docs/PRD.md) and runs against the live app in a real browser. It covers:

- **Accounts:** sign-up (valid and every validation error), duplicate email, login, wrong password, logout, redirect-and-return for protected pages, and signed-out visitors blocked from the dashboard.
- **Ingredients:** add, edit, search (match and no match), duplicate names, length limits, and delete blocked while in use.
- **Sub-recipes:** create with nested components, calculated allergens, "no components" error, and circular-recipe protection.
- **Dishes:** create and edit, price validation, description limit, calculated allergens in the saved message, Published vs Draft.
- **Allergen propagation:** changing one ingredient updates every sub-recipe and dish that uses it.
- **Public menu:** filtering by one or more allergens with exact safe counts, the "Safe for you" / "Contains" verdicts, hiding unsafe dishes, draft dishes never shown, filters surviving reload, unknown menus, and the mobile layout.
- **Settings:** rename, menu address validation and uniqueness, load sample menu.

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
