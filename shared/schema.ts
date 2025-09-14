import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Recipe ingredient schema
export const recipeIngredientSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  cost: z.number().min(0),
});

// Dish ingredient schema
export const dishIngredientSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  cost: z.number().min(0),
});

// Product/Ingredient table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: text("name").notNull(),
  supplier: text("supplier"),
  waste: real("waste").notNull().default(0),
  notes: text("notes"),
  quantity: real("quantity").notNull(),
  unit: varchar("unit").notNull(), // kg, l, pezzo
  pricePerUnit: real("price_per_unit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recipe table
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ingredients: json("ingredients").$type<z.infer<typeof recipeIngredientSchema>[]>().notNull(),
  totalCost: real("total_cost").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dish table
export const dishes = pgTable("dishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ingredients: json("ingredients").$type<z.infer<typeof dishIngredientSchema>[]>().notNull(),
  totalCost: real("total_cost").notNull(),
  sellingPrice: real("selling_price").notNull(),
  netPrice: real("net_price").notNull(),
  foodCost: real("food_cost").notNull(),
  sold: integer("sold").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Waste table
export const waste = pgTable("waste", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: real("quantity").notNull(),
  cost: real("cost").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personal meals table
export const personalMeals = pgTable("personal_meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dishId: varchar("dish_id").notNull().references(() => dishes.id),
  quantity: integer("quantity").notNull().default(1),
  cost: real("cost").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  waste: z.number().min(0).max(100).default(0),
  quantity: z.number().min(0),
  pricePerUnit: z.number().min(0),
  unit: z.enum(["kg", "l", "pezzo"]),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  ingredients: z.array(recipeIngredientSchema),
  totalCost: z.number().min(0),
});

export const insertDishSchema = createInsertSchema(dishes).omit({
  id: true,
  sold: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  ingredients: z.array(dishIngredientSchema),
  totalCost: z.number().min(0),
  sellingPrice: z.number().min(0),
  netPrice: z.number().min(0),
  foodCost: z.number().min(0),
});

export const insertWasteSchema = createInsertSchema(waste).omit({
  id: true,
  createdAt: true,
}).extend({
  quantity: z.number().min(0),
  cost: z.number().min(0),
});

export const insertPersonalMealSchema = createInsertSchema(personalMeals).omit({
  id: true,
  createdAt: true,
}).extend({
  quantity: z.number().min(0).default(1),
  cost: z.number().min(0),
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Dish = typeof dishes.$inferSelect;
export type InsertDish = z.infer<typeof insertDishSchema>;
export type Waste = typeof waste.$inferSelect;
export type InsertWaste = z.infer<typeof insertWasteSchema>;
export type PersonalMeal = typeof personalMeals.$inferSelect;
export type InsertPersonalMeal = z.infer<typeof insertPersonalMealSchema>;
