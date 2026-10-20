import { describe, expect, it } from "vitest";
import {
  duplicateNameMessage,
  formatPrice,
  parsePrice,
  slugify,
  validateDescription,
  validateEmail,
  validateItemName,
  validatePassword,
  validateRestaurantName,
  validateSlug,
} from "./validation";

describe("sign-up fields", () => {
  it("validates the restaurant name", () => {
    expect(validateRestaurantName("  ")).toBe("Restaurant name is required");
    expect(validateRestaurantName("A")).toBe("Restaurant name must be 2–60 characters");
    expect(validateRestaurantName("x".repeat(61))).toBe("Restaurant name must be 2–60 characters");
    expect(validateRestaurantName("Luna Café")).toBeNull();
  });

  it("validates email and password", () => {
    expect(validateEmail("not-an-email")).toBe("Enter a valid email address");
    expect(validateEmail("owner@luna.cafe")).toBeNull();
    expect(validatePassword("short")).toBe("Password must be at least 8 characters");
    expect(validatePassword("longenough")).toBeNull();
  });
});

describe("item fields", () => {
  it("validates names", () => {
    expect(validateItemName("")).toBe("Name is required");
    expect(validateItemName("x".repeat(61))).toBe("Name must be 60 characters or fewer");
    expect(validateItemName("Tahini")).toBeNull();
  });

  it("words duplicate errors per kind", () => {
    expect(duplicateNameMessage("ingredient", "Tahini")).toBe('An ingredient named "Tahini" already exists');
    expect(duplicateNameMessage("dish", "Hummus & Pita")).toBe('A dish named "Hummus & Pita" already exists');
    expect(duplicateNameMessage("sub-recipe", "Hummus")).toBe('A sub-recipe named "Hummus" already exists');
  });

  it("limits descriptions to 200 characters", () => {
    expect(validateDescription("x".repeat(200))).toBeNull();
    expect(validateDescription("x".repeat(201))).toBe("Description must be 200 characters or fewer");
  });
});

describe("prices", () => {
  it.each([
    ["12.50", 1250],
    ["12.5", 1250],
    ["7", 700],
    ["$4.00", 400],
    ["9999.99", 999999],
  ])("accepts %s", (input, cents) => {
    expect(parsePrice(input)).toBe(cents);
  });

  it.each(["", "0", "0.00", "-5", "12.505", "abc", "10000", "1,50"])("rejects %j", (input) => {
    expect(parsePrice(input)).toBeNull();
  });

  it("formats cents as dollars", () => {
    expect(formatPrice(850)).toBe("$8.50");
    expect(formatPrice(2250)).toBe("$22.50");
  });
});

describe("menu addresses", () => {
  it("slugifies restaurant names", () => {
    expect(slugify("Luna Café")).toBe("luna-cafe");
    expect(slugify("Demo Bistro")).toBe("demo-bistro");
    expect(slugify("Al's  Diner!!")).toBe("al-s-diner");
    expect(validateSlug(slugify("X"))).toBeNull();
  });

  it("validates custom addresses", () => {
    expect(validateSlug("ok")).toBe("Use 3–40 lowercase letters, numbers or hyphens");
    expect(validateSlug("Has Caps")).toBe("Use 3–40 lowercase letters, numbers or hyphens");
    expect(validateSlug("luna-cafe-2")).toBeNull();
  });
});
