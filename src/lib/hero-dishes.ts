import { type AllergenCode, type Component, createAllergenResolver } from "./allergens";
import { SAMPLE_DISHES, SAMPLE_INGREDIENTS, SAMPLE_RECIPES, type SampleComponent } from "./sample-menu";

// Dishes featured in the home page plate carousel. Allergens are calculated from the
// sample menu with the same resolver the app uses, so the hero can never drift from the data.

export type HeroDish = {
  name: string;
  light: string; // first line of the title, thin
  bold: string; // second line, heavy
  image: string;
  tint: string; // background arc colour
  accent: string; // badge colour
  priceCents: number;
  category: string;
  allergens: AllergenCode[];
};

const FEATURED: { name: string; light: string; bold: string; image: string; tint: string; accent: string }[] = [
  { name: "Grilled Salmon", light: "Grilled", bold: "Salmon", image: "/dishes/grilled-salmon.webp", tint: "#fde2d3", accent: "#f97316" },
  { name: "Hummus & Pita", light: "Hummus &", bold: "Pita", image: "/dishes/hummus-pita.webp", tint: "#fdf0c4", accent: "#d97706" },
  { name: "Garden Salad", light: "Garden", bold: "Salad", image: "/dishes/garden-salad.webp", tint: "#d5f2e3", accent: "#059669" },
  { name: "Peanut Noodles", light: "Peanut", bold: "Noodles", image: "/dishes/peanut-noodles.webp", tint: "#f9dccb", accent: "#c2410c" },
  { name: "Garlic Shrimp", light: "Garlic", bold: "Shrimp", image: "/dishes/garlic-shrimp.webp", tint: "#fbd9d9", accent: "#dc2626" },
  { name: "Chocolate Brownie", light: "Chocolate", bold: "Brownie", image: "/dishes/chocolate-brownie.webp", tint: "#eadfd6", accent: "#7c4a2d" },
];

const toComponent = (c: SampleComponent): Component =>
  "ingredient" in c ? { kind: "ingredient", id: c.ingredient } : { kind: "recipe", id: c.recipe };

const resolver = createAllergenResolver({
  ingredients: new Map(SAMPLE_INGREDIENTS.map((i) => [i.name, i.allergens])),
  recipes: new Map(SAMPLE_RECIPES.map((r) => [r.name, r.components.map(toComponent)])),
});

export const HERO_DISHES: HeroDish[] = FEATURED.map((f) => {
  const dish = SAMPLE_DISHES.find((d) => d.name === f.name);
  if (!dish) throw new Error(`Hero dish "${f.name}" is not in the sample menu`);
  return {
    ...f,
    priceCents: dish.priceCents,
    category: dish.category,
    allergens: resolver.componentsAllergens(dish.components.map(toComponent)),
  };
});
