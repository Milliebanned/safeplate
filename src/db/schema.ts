import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_unique").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    // SHA-256 of the session token; the raw token only ever lives in the cookie.
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("restaurants_owner_unique").on(t.ownerId),
    uniqueIndex("restaurants_slug_unique").on(t.slug),
  ],
);

export const ingredients = pgTable(
  "ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    allergens: text("allergens").array().notNull().default(sql`'{}'::text[]`),
  },
  (t) => [uniqueIndex("ingredients_name_unique").on(t.restaurantId, sql`lower(${t.name})`)],
);

export const recipes = pgTable(
  "recipes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("recipes_name_unique").on(t.restaurantId, sql`lower(${t.name})`)],
);

export const recipeComponents = pgTable(
  "recipe_components",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    ingredientId: uuid("ingredient_id").references(() => ingredients.id, { onDelete: "restrict" }),
    childRecipeId: uuid("child_recipe_id").references(() => recipes.id, { onDelete: "restrict" }),
  },
  (t) => [
    index("recipe_components_recipe_idx").on(t.recipeId),
    check(
      "recipe_components_one_target",
      sql`(${t.ingredientId} is null) <> (${t.childRecipeId} is null)`,
    ),
  ],
);

export const dishes = pgTable(
  "dishes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull(),
    priceCents: integer("price_cents").notNull(),
    published: boolean("published").notNull().default(true),
  },
  (t) => [
    uniqueIndex("dishes_name_unique").on(t.restaurantId, sql`lower(${t.name})`),
    check("dishes_price_positive", sql`${t.priceCents} > 0`),
  ],
);

export const dishComponents = pgTable(
  "dish_components",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dishId: uuid("dish_id")
      .notNull()
      .references(() => dishes.id, { onDelete: "cascade" }),
    ingredientId: uuid("ingredient_id").references(() => ingredients.id, { onDelete: "restrict" }),
    recipeId: uuid("recipe_id").references(() => recipes.id, { onDelete: "restrict" }),
  },
  (t) => [
    index("dish_components_dish_idx").on(t.dishId),
    check("dish_components_one_target", sql`(${t.ingredientId} is null) <> (${t.recipeId} is null)`),
  ],
);
