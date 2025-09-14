import { z } from "zod";

// Product/Ingredient schema
export const productSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  supplier: z.string().optional(),
  waste: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  quantity: z.number().min(0),
  unit: z.enum(["kg", "l", "pezzo"]),
  pricePerUnit: z.number().min(0),
});

export const insertProductSchema = productSchema.omit({ id: true });

// Recipe schema
export const recipeIngredientSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  cost: z.number().min(0),
});

export const recipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(recipeIngredientSchema),
  totalCost: z.number().min(0),
});

export const insertRecipeSchema = recipeSchema.omit({ id: true });

// Dish schema
export const dishIngredientSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  cost: z.number().min(0),
});

export const dishSchema = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(dishIngredientSchema),
  totalCost: z.number().min(0),
  sellingPrice: z.number().min(0),
  netPrice: z.number().min(0),
  foodCost: z.number().min(0),
  sold: z.number().min(0).default(0),
});

export const insertDishSchema = dishSchema.omit({ id: true, sold: true });

// Waste schema
export const wasteSchema = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number().min(0),
  cost: z.number().min(0),
  date: z.string(),
  notes: z.string().optional(),
});

export const insertWasteSchema = wasteSchema.omit({ id: true });

// Personal meal schema
export const personalMealSchema = z.object({
  id: z.string(),
  dishId: z.string(),
  quantity: z.number().min(0).default(1),
  cost: z.number().min(0),
  date: z.string(),
  notes: z.string().optional(),
});

export const insertPersonalMealSchema = personalMealSchema.omit({ id: true });

// Types
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Dish = z.infer<typeof dishSchema>;
export type InsertDish = z.infer<typeof insertDishSchema>;
export type Waste = z.infer<typeof wasteSchema>;
export type InsertWaste = z.infer<typeof insertWasteSchema>;
export type PersonalMeal = z.infer<typeof personalMealSchema>;
export type InsertPersonalMeal = z.infer<typeof insertPersonalMealSchema>;
