import type { AllergenCode } from "./allergens";

// The sample menu from PRD section 7. Used for the public "Demo Bistro" restaurant
// and by Settings → "Load sample menu". Tests assert against these exact values.

export const CATEGORIES = ["Starters", "Mains", "Sides", "Desserts", "Drinks"] as const;
export type Category = (typeof CATEGORIES)[number];

export type SampleComponent = { ingredient: string } | { recipe: string };

export const SAMPLE_INGREDIENTS: { name: string; allergens: AllergenCode[] }[] = [
  { name: "Butter", allergens: ["milk"] },
  { name: "Celery", allergens: ["celery"] },
  { name: "Chickpeas", allergens: [] },
  { name: "Dark chocolate", allergens: ["milk", "soybeans"] },
  { name: "Dijon mustard", allergens: ["mustard"] },
  { name: "Egg", allergens: ["eggs"] },
  { name: "Garlic", allergens: [] },
  { name: "Greek yogurt", allergens: ["milk"] },
  { name: "Lemon juice", allergens: [] },
  { name: "Mixed greens", allergens: [] },
  { name: "Olive oil", allergens: [] },
  { name: "Peanuts", allergens: ["peanuts"] },
  { name: "Plain flour", allergens: ["gluten"] },
  { name: "Potatoes", allergens: [] },
  { name: "Rice noodles", allergens: [] },
  { name: "Salmon", allergens: ["fish"] },
  { name: "Sea salt", allergens: [] },
  { name: "Shrimp", allergens: ["crustaceans"] },
  { name: "Soy sauce", allergens: ["gluten", "soybeans"] },
  { name: "Sugar", allergens: [] },
  { name: "Tahini", allergens: ["sesame"] },
  { name: "Walnuts", allergens: ["tree-nuts"] },
  { name: "Wheat pita bread", allergens: ["gluten"] },
];

// Every sub-recipe that another one uses is listed in this file before it.
export const SAMPLE_RECIPES: { name: string; components: SampleComponent[] }[] = [
  {
    name: "Hummus",
    components: [
      { ingredient: "Chickpeas" },
      { ingredient: "Tahini" },
      { ingredient: "Lemon juice" },
      { ingredient: "Olive oil" },
      { ingredient: "Garlic" },
    ],
  },
  {
    name: "Garlic Yogurt Sauce",
    components: [{ ingredient: "Greek yogurt" }, { ingredient: "Garlic" }, { ingredient: "Lemon juice" }],
  },
  {
    name: "Peanut Sauce",
    components: [
      { ingredient: "Peanuts" },
      { ingredient: "Soy sauce" },
      { ingredient: "Lemon juice" },
      { ingredient: "Sugar" },
    ],
  },
  {
    name: "Mustard Vinaigrette",
    components: [{ ingredient: "Dijon mustard" }, { ingredient: "Olive oil" }, { ingredient: "Lemon juice" }],
  },
  {
    name: "Green Goddess Dressing",
    components: [{ recipe: "Mustard Vinaigrette" }, { ingredient: "Greek yogurt" }],
  },
];

export const SAMPLE_DISHES: {
  name: string;
  description: string;
  category: Category;
  priceCents: number;
  published: boolean;
  image?: string;
  components: SampleComponent[];
}[] = [
  {
    name: "Hummus & Pita",
    image: "/dishes/hummus-pita.webp",
    description: "Creamy chickpea hummus with warm pita.",
    category: "Starters",
    priceCents: 850,
    published: true,
    components: [{ recipe: "Hummus" }, { ingredient: "Wheat pita bread" }],
  },
  {
    name: "Garden Salad",
    image: "/dishes/garden-salad.webp",
    description: "Mixed greens, walnuts and mustard vinaigrette.",
    category: "Starters",
    priceCents: 900,
    published: true,
    components: [{ ingredient: "Mixed greens" }, { recipe: "Mustard Vinaigrette" }, { ingredient: "Walnuts" }],
  },
  {
    name: "Celery Soup",
    description: "Slow-cooked celery soup finished with butter.",
    category: "Starters",
    priceCents: 650,
    published: false,
    components: [{ ingredient: "Celery" }, { ingredient: "Butter" }],
  },
  {
    name: "Peanut Noodles",
    image: "/dishes/peanut-noodles.webp",
    description: "Rice noodles tossed in our house peanut sauce.",
    category: "Mains",
    priceCents: 1400,
    published: true,
    components: [{ ingredient: "Rice noodles" }, { recipe: "Peanut Sauce" }],
  },
  {
    name: "Grilled Salmon",
    image: "/dishes/grilled-salmon.webp",
    description: "Salmon fillet, potatoes and green goddess dressing.",
    category: "Mains",
    priceCents: 2250,
    published: true,
    components: [
      { ingredient: "Salmon" },
      { ingredient: "Potatoes" },
      { recipe: "Green Goddess Dressing" },
      { ingredient: "Sea salt" },
    ],
  },
  {
    name: "Garlic Shrimp",
    image: "/dishes/garlic-shrimp.webp",
    description: "Pan-fried shrimp in garlic butter.",
    category: "Mains",
    priceCents: 1900,
    published: true,
    components: [
      { ingredient: "Shrimp" },
      { ingredient: "Garlic" },
      { ingredient: "Butter" },
      { ingredient: "Olive oil" },
    ],
  },
  {
    name: "Roasted Potatoes",
    description: "Crispy potatoes with olive oil and sea salt.",
    category: "Sides",
    priceCents: 550,
    published: true,
    components: [{ ingredient: "Potatoes" }, { ingredient: "Olive oil" }, { ingredient: "Sea salt" }],
  },
  {
    name: "Chocolate Brownie",
    image: "/dishes/chocolate-brownie.webp",
    description: "Rich dark chocolate brownie.",
    category: "Desserts",
    priceCents: 700,
    published: true,
    components: [
      { ingredient: "Plain flour" },
      { ingredient: "Egg" },
      { ingredient: "Butter" },
      { ingredient: "Sugar" },
      { ingredient: "Dark chocolate" },
    ],
  },
  {
    name: "Fresh Lemonade",
    description: "Freshly squeezed lemonade.",
    category: "Drinks",
    priceCents: 400,
    published: true,
    components: [{ ingredient: "Lemon juice" }, { ingredient: "Sugar" }],
  },
];
