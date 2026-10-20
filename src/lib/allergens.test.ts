import { describe, expect, it } from "vitest";
import {
  type Component,
  createAllergenResolver,
  findCycle,
  formatAllergens,
  matchingAllergens,
  parseAvoidParam,
  sortAllergens,
} from "./allergens";
import { SAMPLE_DISHES, SAMPLE_INGREDIENTS, SAMPLE_RECIPES, type SampleComponent } from "./sample-menu";

function sampleGraph() {
  const toComponent = (c: SampleComponent): Component =>
    "ingredient" in c ? { kind: "ingredient", id: c.ingredient } : { kind: "recipe", id: c.recipe };
  return {
    ingredients: new Map(SAMPLE_INGREDIENTS.map((i) => [i.name, i.allergens])),
    recipes: new Map(SAMPLE_RECIPES.map((r) => [r.name, r.components.map(toComponent)])),
    toComponent,
  };
}

describe("sortAllergens / formatAllergens", () => {
  it("orders allergens alphabetically by label and drops duplicates and unknown codes", () => {
    expect(sortAllergens(["tree-nuts", "milk", "celery", "milk", "bogus"])).toEqual([
      "celery",
      "milk",
      "tree-nuts",
    ]);
    expect(formatAllergens(["sesame", "gluten"])).toBe("Gluten, Sesame");
    expect(formatAllergens([])).toBe("");
  });
});

describe("parseAvoidParam", () => {
  it("reads a comma-separated query value", () => {
    expect(parseAvoidParam("sesame,MILK, gluten")).toEqual(["gluten", "milk", "sesame"]);
    expect(parseAvoidParam(undefined)).toEqual([]);
    expect(parseAvoidParam("nonsense")).toEqual([]);
  });
});

describe("allergen calculation on the PRD sample menu", () => {
  const graph = sampleGraph();
  const resolver = createAllergenResolver(graph);

  it.each([
    ["Hummus", ["sesame"]],
    ["Garlic Yogurt Sauce", ["milk"]],
    ["Peanut Sauce", ["gluten", "peanuts", "soybeans"]],
    ["Mustard Vinaigrette", ["mustard"]],
    ["Green Goddess Dressing", ["milk", "mustard"]],
  ])("sub-recipe %s contains %j", (name, expected) => {
    expect(resolver.recipeAllergens(name)).toEqual(expected);
  });

  it.each([
    ["Hummus & Pita", ["gluten", "sesame"]],
    ["Garden Salad", ["mustard", "tree-nuts"]],
    ["Celery Soup", ["celery", "milk"]],
    ["Peanut Noodles", ["gluten", "peanuts", "soybeans"]],
    ["Grilled Salmon", ["fish", "milk", "mustard"]],
    ["Garlic Shrimp", ["crustaceans", "milk"]],
    ["Roasted Potatoes", []],
    ["Chocolate Brownie", ["eggs", "gluten", "milk", "soybeans"]],
    ["Fresh Lemonade", []],
  ])("dish %s contains %j", (name, expected) => {
    const dish = SAMPLE_DISHES.find((d) => d.name === name)!;
    expect(resolver.componentsAllergens(dish.components.map(graph.toComponent))).toEqual(expected);
  });

  it.each([
    [["sesame"], 7],
    [["milk"], 5],
    [["gluten", "peanuts"], 5],
    [["celery"], 8],
  ])("avoiding %j leaves %i of 8 published dishes safe", (avoid, safeCount) => {
    const published = SAMPLE_DISHES.filter((d) => d.published);
    expect(published).toHaveLength(8);
    const safe = published.filter(
      (d) =>
        matchingAllergens(resolver.componentsAllergens(d.components.map(graph.toComponent)), avoid)
          .length === 0,
    );
    expect(safe).toHaveLength(safeCount);
  });

  it("propagates an ingredient change to every dish that uses it", () => {
    const changed = sampleGraph();
    changed.ingredients.set("Lemon juice", ["sulphites"]);
    const r = createAllergenResolver(changed);
    const lemonade = SAMPLE_DISHES.find((d) => d.name === "Fresh Lemonade")!;
    const salmon = SAMPLE_DISHES.find((d) => d.name === "Grilled Salmon")!;
    expect(r.componentsAllergens(lemonade.components.map(changed.toComponent))).toEqual(["sulphites"]);
    // Lemon juice → Mustard Vinaigrette → Green Goddess Dressing → Grilled Salmon (3 levels deep)
    expect(r.componentsAllergens(salmon.components.map(changed.toComponent))).toEqual([
      "fish",
      "milk",
      "mustard",
      "sulphites",
    ]);
  });
});

describe("findCycle", () => {
  const recipes = new Map<string, Component[]>([
    ["A", [{ kind: "recipe", id: "B" }]],
    ["B", [{ kind: "recipe", id: "C" }]],
    ["C", [{ kind: "ingredient", id: "x" }]],
  ]);

  it("rejects a recipe that includes itself directly", () => {
    expect(findCycle(recipes, "A", [{ kind: "recipe", id: "A" }])).toBe("A");
  });

  it("rejects a recipe that would reach itself through others", () => {
    expect(findCycle(recipes, "C", [{ kind: "recipe", id: "A" }])).toBe("A");
  });

  it("allows a safe change", () => {
    expect(findCycle(recipes, "A", [{ kind: "recipe", id: "C" }])).toBeNull();
  });

  it("refuses to calculate allergens for corrupt cyclic data", () => {
    const cyclic = new Map<string, Component[]>([
      ["A", [{ kind: "recipe", id: "B" }]],
      ["B", [{ kind: "recipe", id: "A" }]],
    ]);
    const r = createAllergenResolver({ ingredients: new Map(), recipes: cyclic });
    expect(() => r.recipeAllergens("A")).toThrow(/cycle/);
  });
});
