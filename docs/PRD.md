# SafePlate: Product Requirements Document

**Live app:** https://safeplate.milliebanned.xyz
**Repository:** https://github.com/Milliebanned/safeplate

## 1. Summary

SafePlate helps restaurants publish **allergen-safe menus**. The owner records every ingredient and the allergens it contains. They build sub-recipes (sauces, dressings, doughs) and dishes from those ingredients, and SafePlate **calculates every dish's allergens automatically**, including allergens hidden inside nested sub-recipes. Each restaurant gets a **public menu page**. There, a customer selects their allergies and instantly sees which dishes are safe for them.

A mistake in this product can send someone to hospital. Because of that, every code change is tested automatically with TestSprite on every pull request before it can merge.

## 2. Users

| User | Needs an account? | What they do |
|---|---|---|
| **Restaurant owner** | Yes (email + password) | Manages ingredients, sub-recipes, dishes and settings for their own restaurant. |
| **Customer / visitor** | No | Views a restaurant's public menu and filters it by their allergies. |

Each owner account has exactly one restaurant. An owner can only see and change their own restaurant's data.

## 3. The 14 major allergens

SafePlate tracks the 14 major food allergens. They are always displayed in this alphabetical order, with these exact labels:

Celery, Crustaceans, Eggs, Fish, Gluten, Lupin, Milk, Molluscs, Mustard, Peanuts, Sesame, Soybeans, Sulphites, Tree nuts

## 4. Core rule: how allergens are calculated

1. An **ingredient** has zero or more allergens, set by the owner.
2. A **sub-recipe** is made of ingredients and/or other sub-recipes. Its allergens are the union of the allergens of everything inside it, at any depth.
3. A **dish** is made of ingredients and/or sub-recipes. Its allergens are the union of the allergens of everything inside it, at any depth.
4. Allergens are always calculated from current data. If an owner adds "Sesame" to an ingredient, every sub-recipe and dish that uses it shows "Sesame" immediately, with no extra step.
5. A sub-recipe can never contain itself, directly or through other sub-recipes (no cycles).

**Example:** the ingredient Dijon mustard (Mustard) is inside the sub-recipe Mustard Vinaigrette. That sits inside the sub-recipe Green Goddess Dressing, which also contains Greek yogurt (Milk). The dish Grilled Salmon uses Salmon (Fish) and Green Goddess Dressing, so Grilled Salmon contains **Fish, Milk, Mustard**.

## 5. Pages and features

### 5.1 Home page (`/`)
- Explains the product in one sentence and shows three steps: add ingredients → build dishes → share your menu.
- **"View demo menu"** button opens the public menu of the sample restaurant "Demo Bistro" (`/m/demo-bistro`) without signing in.
- **"Create free account"** button opens `/signup`. **"Log in"** link opens `/login`.
- After logging out, the home page shows: **"You have been logged out."**

### 5.2 Sign up (`/signup`)
Fields: Restaurant name, Email, Password, Confirm password.

| Rule | Error message |
|---|---|
| Restaurant name empty | `Restaurant name is required` |
| Restaurant name shorter than 2 or longer than 60 characters | `Restaurant name must be 2 to 60 characters` |
| Email empty or not a valid email | `Enter a valid email address` |
| Email already registered (case-insensitive) | `An account with this email already exists` |
| Password shorter than 8 characters | `Password must be at least 8 characters` |
| Confirm password different from password | `Passwords do not match` |

On success, the owner is signed in and sent to `/dashboard`, which shows **"Welcome to SafePlate, {Restaurant name}!"**. The restaurant's public menu address is created from its name, e.g. "Luna Café" → `/m/luna-cafe`. If that address is taken, a number is added (`luna-cafe-2`).

### 5.3 Log in (`/login`)
Fields: Email, Password.
- Wrong email or password → `Incorrect email or password`
- On success → `/dashboard`.
- Visiting any `/dashboard` page while signed out redirects to `/login` and shows **"Please log in to continue."** After logging in, the owner returns to the page they asked for.

### 5.4 Log out
A **"Log out"** button is always visible in the dashboard navigation. It ends the session and returns to `/` with "You have been logged out." After logging out, `/dashboard` is no longer accessible.

### 5.5 Dashboard overview (`/dashboard`)
- Shows counts: **Ingredients**, **Sub-recipes**, **Dishes**, **Published dishes**.
- Shows the restaurant's public menu link and a **QR code** that opens it, ready to print for tables.
- Navigation: Overview, Ingredients, Sub-recipes, Dishes, Settings, View public menu, Log out.
- A brand-new restaurant shows a getting-started message: **"Your menu is empty. Start by adding ingredients, or load the sample menu from Settings."**

### 5.6 Ingredients (`/dashboard/ingredients`)
- A list of all ingredients, sorted A→Z, each showing its allergen badges. An ingredient with no allergens shows "No major allergens".
- **Search box** filters the list by name as you type. If nothing matches: `No ingredients match "{query}"`.
- Empty state: **"No ingredients yet. Add your first one."**
- **Add ingredient:** a name plus 14 allergen checkboxes.
- **Edit ingredient:** change the name and/or allergens.
- **Delete ingredient:** a two-step confirmation (Delete → Confirm delete). An ingredient that is used in a sub-recipe or dish cannot be deleted.

| Situation | Message |
|---|---|
| Added | `Ingredient "{name}" added. Contains: {allergens}.` or `Ingredient "{name}" added. Contains no major allergens.` |
| Updated | `Ingredient "{name}" updated. Contains: {allergens}.` or `Ingredient "{name}" updated. Contains no major allergens.` |
| Deleted | `Ingredient "{name}" deleted.` |
| Name empty | `Name is required` |
| Name longer than 60 characters | `Name must be 60 characters or fewer` |
| Name already exists in this restaurant (case-insensitive) | `An ingredient named "{name}" already exists` |
| Delete while in use | `Can't delete "{name}": it is used in {list of sub-recipes/dishes}.` |

### 5.7 Sub-recipes (`/dashboard/recipes`)
- A list of sub-recipes, sorted A→Z, each showing its **calculated allergens** and its components.
- Empty state: **"No sub-recipes yet. Create one to reuse sauces, dressings and bases."**
- **Create / edit:** a name plus a selection of components (any ingredients and any other sub-recipes).
- **Delete:** two-step confirmation. A sub-recipe used elsewhere cannot be deleted.

| Situation | Message |
|---|---|
| Saved | `Sub-recipe "{name}" saved. Contains: {allergens}.` or `Sub-recipe "{name}" saved. Contains no major allergens.` |
| Deleted | `Sub-recipe "{name}" deleted.` |
| Name empty / too long / duplicate | Same rules and wording as ingredients, with "sub-recipe" instead of "ingredient" |
| No components selected | `Add at least one ingredient or sub-recipe` |
| Would create a cycle | `"{name}" can't include "{other}" because "{other}" already contains "{name}".` |
| Delete while in use | `Can't delete "{name}": it is used in {list}.` |

### 5.8 Dishes (`/dashboard/dishes`)
- A list of dishes grouped by category (Starters, Mains, Sides, Desserts, Drinks). Each shows its price, its **calculated allergens**, and whether it is **Published** or **Draft**.
- Empty state: **"No dishes yet. Create your first dish."**
- **Create / edit fields:** Name, Description (optional, up to 200 characters), Category, Price, Dish photo (optional), Components (ingredients and/or sub-recipes), Published (checkbox).
- **Dish photo:** the owner chooses a JPG, PNG or WebP image. It is cropped to a square and resized in the browser, previewed as a round plate, and shown on the public menu. The owner can change or remove it at any time. Each dish in the dashboard list shows its photo.
- **Delete:** two-step confirmation.

| Situation | Message |
|---|---|
| Saved | `Dish "{name}" saved. Contains: {allergens}.` or `Dish "{name}" saved. Contains no major allergens.` |
| Deleted | `Dish "{name}" deleted.` |
| Name empty / too long / duplicate | Same rules and wording as ingredients, with "dish" instead of "ingredient" |
| Description longer than 200 characters | `Description must be 200 characters or fewer` |
| Price missing, zero, negative, more than 2 decimals, or above 9999.99 | `Enter a price like 12.50` |
| No components selected | `Add at least one ingredient or sub-recipe` |
| Photo is not a JPG, PNG or WebP image | `Choose a JPG, PNG or WebP image` |
| Photo larger than 15 MB before resizing | `Choose an image smaller than 15 MB` |
| Photo larger than 1.5 MB after resizing | `Photo must be smaller than 1.5 MB` |

Prices are shown in US dollars with two decimals, e.g. `$12.50`.

### 5.9 Settings (`/dashboard/settings`)
- **Restaurant name** (same rules as sign up).
- **Public menu address** (`/m/{address}`): 3 to 40 characters, lowercase letters, numbers and hyphens only. Error for bad format: `Use 3 to 40 lowercase letters, numbers or hyphens`. Error if taken: `That menu address is already taken`.
- Saving shows: `Settings saved.`
- **Load sample menu:** replaces this restaurant's ingredients, sub-recipes and dishes with the sample menu (section 7), after a two-step confirmation. It shows: `Sample menu loaded: 23 ingredients, 5 sub-recipes, 9 dishes.` It only ever affects the signed-in owner's own restaurant.

### 5.10 Public menu (`/m/{address}`)
No sign-in needed. Mobile-first layout.
- Shows the restaurant name and only **published** dishes, grouped by category, each with its photo (or its initials when it has none), price, description and allergen badges. Draft dishes never appear.
- **"I'm allergic to:"** with 14 toggle buttons, one per allergen.
- With no allergies selected: **"Select your allergies to see which dishes are safe for you."**
- With allergies selected, every dish shows either **"Safe for you"** or **"Contains: {matching allergens}"**, and a summary line shows **"{X} of {Y} dishes are free from your selected allergens."**
- **"Hide dishes that aren't safe"** checkbox hides the dishes marked "Contains".
- The selected allergies are kept in the page address (e.g. `?avoid=milk,sesame`), so the filtered view survives a reload and can be shared.
- If the restaurant has no published dishes: **"This restaurant hasn't published any dishes yet."**
- An unknown address shows a **"Menu not found"** page.
- Every public menu shows the notice: **"Allergen information is provided by the restaurant. Always tell your server about your allergies."**

### 5.11 Health check (`/api/health`)
Returns JSON `{"status":"ok","database":"ok"}` when the app and database are working.

### 5.12 Confirmation messages
On the Ingredients, Sub-recipes, Dishes and Settings pages, every result message (success or error) appears pinned to the bottom of the screen, so the owner sees it even after acting on an item far down a long list.

### 5.13 Safety record (`/verified`)
A public page, linked from the home page as "See the safety record", that lists the repository's recent pull requests with the TestSprite verdict on each one's latest commit (Passed, Failed, Running or Not tested), a link to the TestSprite report, and the latest merged release. It reads GitHub's public API and refreshes every five minutes. If GitHub cannot be reached, it shows: "The verification history is temporarily unavailable."

## 6. Security and data rules
- Passwords are stored only as secure hashes.
- Sessions use an HTTP-only cookie and expire after 30 days.
- Every dashboard page and every change re-checks who is signed in. An owner can never read or change another restaurant's data, even by editing ids in requests.
- Visitors who are not signed in can only see public menus, the home page, sign up and log in.

## 7. Sample menu (Demo Bistro)

The public demo restaurant **Demo Bistro** (`/m/demo-bistro`) and the "Load sample menu" action use this exact data.

**Ingredients (23):** Butter (Milk), Celery (Celery), Chickpeas (none), Dark chocolate (Milk, Soybeans), Dijon mustard (Mustard), Egg (Eggs), Garlic (none), Greek yogurt (Milk), Lemon juice (none), Mixed greens (none), Olive oil (none), Peanuts (Peanuts), Plain flour (Gluten), Potatoes (none), Rice noodles (none), Salmon (Fish), Sea salt (none), Shrimp (Crustaceans), Soy sauce (Gluten, Soybeans), Sugar (none), Tahini (Sesame), Walnuts (Tree nuts), Wheat pita bread (Gluten)

**Sub-recipes (5):**
| Sub-recipe | Components | Calculated allergens |
|---|---|---|
| Hummus | Chickpeas, Tahini, Lemon juice, Olive oil, Garlic | Sesame |
| Garlic Yogurt Sauce | Greek yogurt, Garlic, Lemon juice | Milk |
| Peanut Sauce | Peanuts, Soy sauce, Lemon juice, Sugar | Gluten, Peanuts, Soybeans |
| Mustard Vinaigrette | Dijon mustard, Olive oil, Lemon juice | Mustard |
| Green Goddess Dressing | Mustard Vinaigrette, Greek yogurt | Milk, Mustard |

**Dishes (9):** Hummus & Pita, Garden Salad, Peanut Noodles, Grilled Salmon, Garlic Shrimp and Chocolate Brownie come with photos.

| Dish | Category | Price | Components | Calculated allergens | Status |
|---|---|---|---|---|---|
| Hummus & Pita | Starters | $8.50 | Hummus, Wheat pita bread | Gluten, Sesame | Published |
| Garden Salad | Starters | $9.00 | Mixed greens, Mustard Vinaigrette, Walnuts | Mustard, Tree nuts | Published |
| Celery Soup | Starters | $6.50 | Celery, Butter | Celery, Milk | **Draft** |
| Peanut Noodles | Mains | $14.00 | Rice noodles, Peanut Sauce | Gluten, Peanuts, Soybeans | Published |
| Grilled Salmon | Mains | $22.50 | Salmon, Potatoes, Green Goddess Dressing, Sea salt | Fish, Milk, Mustard | Published |
| Garlic Shrimp | Mains | $19.00 | Shrimp, Garlic, Butter, Olive oil | Crustaceans, Milk | Published |
| Roasted Potatoes | Sides | $5.50 | Potatoes, Olive oil, Sea salt | No major allergens | Published |
| Chocolate Brownie | Desserts | $7.00 | Plain flour, Egg, Butter, Sugar, Dark chocolate | Eggs, Gluten, Milk, Soybeans | Published |
| Fresh Lemonade | Drinks | $4.00 | Lemon juice, Sugar | No major allergens | Published |

**Expected public-menu results for Demo Bistro (8 published dishes):**
| Selected allergies | Summary shown | Dishes marked "Contains" |
|---|---|---|
| Sesame | 7 of 8 dishes are free from your selected allergens. | Hummus & Pita |
| Milk | 5 of 8 dishes are free from your selected allergens. | Grilled Salmon, Garlic Shrimp, Chocolate Brownie |
| Gluten, Peanuts | 5 of 8 dishes are free from your selected allergens. | Hummus & Pita, Peanut Noodles, Chocolate Brownie |
| Celery | 8 of 8 dishes are free from your selected allergens. | none (Celery Soup is a draft and never shown) |

**Empty Kitchen** (`/m/empty-kitchen`) is a permanent restaurant with no dishes. Its public menu always shows: "This restaurant hasn't published any dishes yet."

## 8. Out of scope (for now)
- Multiple restaurants per account, staff accounts, and roles.
- Menu translations and "may contain" (cross-contamination) labels. These are planned as follow-up features, each delivered in its own tested pull request.
