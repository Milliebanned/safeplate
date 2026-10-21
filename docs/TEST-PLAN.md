# SafePlate test plan

SafePlate is verified end to end by **TestSprite**. Every pull request deploys a Vercel preview, and the TestSprite GitHub App runs the full suite against it. A failing test blocks the merge.

- **Project:** SafePlate (TestSprite web portal, frontend)
- **Suite:** 24 tests, planned by TestSprite's agents from [PRD.md](PRD.md) and a live exploration of the app
- **Browser size:** 1280 × 720

## How the tests are kept trustworthy

TestSprite planned and generated every test. We reviewed the plan before the first run, and after the first run we read the code TestSprite saved. Two weaknesses showed up:

1. **"Unique" values were frozen.** Values the agent chose on the first run, such as a sign-up email, were saved into the test permanently, so a second run would hit "An account with this email already exists".
2. **Some saved checks were shallow.** Several tests ended by checking only that a page had loaded, not the result the user should see.

We updated the saved code through the TestSprite CLI (`testsprite test code put`), so that every test:

- **checks the exact result** from the PRD, for example `5 of 8 dishes are free from your selected allergens.`;
- **creates fresh data on every run** (names and emails carry a run-specific random number, never a date, so two runs on the same day cannot collide);
- **cleans up after itself**, so tests never collide with each other or with the next run.

Two fixed restaurants keep the data predictable: **Demo Bistro** (`/m/demo-bistro`, the sample menu, read-only) and **Empty Kitchen** (`/m/empty-kitchen`, no dishes). Tests that need an owner log in to the **Test Kitchen** test account.

## What each test verifies

### Public menu

| Test | Verifies |
|---|---|
| View the public landing page | Headline, explanation, the three "How it works" steps, the plate showcase, and the Log in, Create free account and View demo menu entry points |
| Open the demo menu from the home page | "View demo menu" opens `/m/demo-bistro` with the restaurant name and the allergen notice |
| Browse the demo menu without selecting allergies | The prompt "Select your allergies to see which dishes are safe for you.", exactly 8 published dishes, the draft dish hidden, prices and allergens shown |
| Filter the demo menu by selected allergies | Gluten + Peanuts gives "5 of 8 dishes are free from your selected allergens." and the exact verdict on each dish; the selection is kept in the address |
| Open a public menu by direct address | `/m/demo-bistro?avoid=sesame` pre-selects Sesame and shows "7 of 8 dishes are free…" with Hummus & Pita marked "Contains: Sesame" |
| Hide unsafe dishes in the demo menu | With Milk selected and "Hide dishes that aren't safe" ticked, only the 5 safe dishes remain |
| Share a filtered demo menu URL | Eggs, Gluten and Milk give "3 of 8…", and the same view survives a reload of the shared address |
| View the empty public menu state | Empty Kitchen shows "This restaurant hasn't published any dishes yet." and the allergen notice |
| Open an unknown public menu address | A made-up address returns HTTP 404 and the "Menu not found" page |

### Accounts and access

| Test | Verifies |
|---|---|
| Log in and reach the dashboard | Log in from the home page lands on the Test Kitchen overview |
| Reject login with incorrect credentials | A wrong password shows "Incorrect email or password", stays on the login page and keeps the email |
| Show account creation errors during sign up | Every sign-up error message, including "An account with this email already exists" and "Passwords do not match" |
| Sign up and reach the dashboard | A brand-new account lands on the dashboard with "Welcome to SafePlate, {name}!" |
| Redirect signed-out users to log in from the dashboard | `/dashboard` while signed out redirects to log in with "Please log in to continue." |
| Return to the requested dashboard page after log in | Logging in from a redirect returns the owner to the page they asked for |
| Log out from the dashboard | Log out shows "You have been logged out." and the dashboard is no longer accessible |
| Log out from the dashboard overview | After logging out, any dashboard page asks the visitor to log in again |

### Dashboard and menu management

| Test | Verifies |
|---|---|
| See empty-state guidance on a new restaurant dashboard | A new restaurant sees the getting-started message and four counts of 0 |
| View dashboard overview counts and menu link | The four counts, the public menu link ending in `/m/test-kitchen`, the QR code and Copy link |
| Open public menu from dashboard | "View public menu" opens the restaurant's own public menu |
| Navigate dashboard sections from the overview | Every section opens with the right heading and is marked as the current page |
| Search ingredients by name | Searching "butter" shows only Butter with its Milk tag; a search with no match shows the exact "No ingredients match" message |
| Create ingredient with allergen tags | A new ingredient with Sesame shows `Ingredient "…" added. Contains: Sesame.` and its tag, then is deleted with the exact "deleted" message |
| Prevent duplicate sub-recipe names | A name that already exists (in any letter case) is rejected with the exact error, and the original is untouched |

## Next additions

Tests for editing and deleting ingredients, sub-recipes and dishes, dish photos, draft dishes, allergen changes flowing through to dishes, and the restaurant settings are being added through the TestSprite CLI, using the same rules: exact checks, fresh data and cleanup.
