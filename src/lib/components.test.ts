import { describe, expect, it } from "vitest";
import { ingredientSavedMessage, savedMessage } from "./components";

describe("saved messages confirm the allergens that were stored", () => {
  it("lists an ingredient's allergens in display order", () => {
    expect(ingredientSavedMessage("QA Saffron", ["sesame"], "added")).toBe('Ingredient "QA Saffron" added. Contains: Sesame.');
    expect(ingredientSavedMessage("Soy sauce", ["soybeans", "gluten"], "updated")).toBe(
      'Ingredient "Soy sauce" updated. Contains: Gluten, Soybeans.',
    );
  });

  it("says so when an ingredient has no major allergens", () => {
    expect(ingredientSavedMessage("Sea salt", [], "added")).toBe('Ingredient "Sea salt" added. Contains no major allergens.');
  });

  it("keeps the dish and sub-recipe wording", () => {
    expect(savedMessage("Dish", "Hummus & Pita", ["sesame", "gluten"])).toBe('Dish "Hummus & Pita" saved. Contains: Gluten, Sesame.');
  });
});
