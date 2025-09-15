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
  effectivePricePerUnit: real("effective_price_per_unit").notNull(),
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
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: real("quantity").notNull(),
  cost: real("cost").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personal meals table
export const personalMeals = pgTable("personal_meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dishId: varchar("dish_id").notNull().references(() => dishes.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  cost: real("cost").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

// Orders table (Ricevimento Merci)
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplier: text("supplier").notNull(),
  orderDate: text("order_date").notNull(),
  items: json("items").$type<z.infer<typeof orderItemSchema>[]>().notNull(),
  totalAmount: real("total_amount").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, cancelled
  notes: text("notes"),
  operatorName: text("operator_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock movements table (Magazzino In/Out)
export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  movementType: varchar("movement_type").notNull(), // 'in' | 'out'
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price"),
  totalCost: real("total_cost"),
  source: varchar("source").notNull(), // 'order', 'sale', 'waste', 'adjustment'
  sourceId: varchar("source_id"), // ID dell'ordine, vendita, etc.
  movementDate: text("movement_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory snapshots table (per calcoli teorici)
export const inventorySnapshots = pgTable("inventory_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  snapshotDate: text("snapshot_date").notNull(),
  initialQuantity: real("initial_quantity").notNull(),
  finalQuantity: real("final_quantity").notNull(),
  theoreticalQuantity: real("theoretical_quantity"),
  variance: real("variance"), // differenza tra teorico e finale
  createdAt: timestamp("created_at").defaultNow(),
});

// Editable inventory values table (nuovo sistema per magazzino editabile)
export const editableInventory = pgTable("editable_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  initialQuantity: real("initial_quantity").notNull().default(0),
  finalQuantity: real("final_quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  effectivePricePerUnit: true, // Calculated automatically by backend
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

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  items: z.array(orderItemSchema),
  totalAmount: z.number().min(0),
  status: z.enum(["pending", "confirmed", "cancelled", "pendente"]).default("pending"),
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
}).extend({
  movementType: z.enum(["in", "out"]),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  source: z.enum(["order", "sale", "waste", "personal_meal", "adjustment"]),
});

export const insertInventorySnapshotSchema = createInsertSchema(inventorySnapshots).omit({
  id: true,
  createdAt: true,
}).extend({
  initialQuantity: z.number().min(0),
  finalQuantity: z.number().min(0),
  theoreticalQuantity: z.number().min(0).optional(),
  variance: z.number().optional(),
});

export const insertEditableInventorySchema = createInsertSchema(editableInventory).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
}).extend({
  initialQuantity: z.number().min(0),
  finalQuantity: z.number().min(0),
});

// Update schemas for secure PATCH/PUT operations
export const updateProductSchema = insertProductSchema.partial().omit({
  // Explicitly omit immutable fields that should never be updated
}).extend({
  // Allow optional updates but maintain validation
  waste: z.number().min(0).max(100).optional(),
  quantity: z.number().min(0).optional(),
  pricePerUnit: z.number().min(0).optional(),
  unit: z.enum(["kg", "l", "pezzo"]).optional(),
});

export const updateRecipeSchema = z.object({
  name: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).optional(),
  totalCost: z.number().min(0).optional(),
});

export const updateDishSchema = z.object({
  name: z.string().optional(),
  ingredients: z.array(dishIngredientSchema).optional(),
  totalCost: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  netPrice: z.number().min(0).optional(),
  foodCost: z.number().min(0).optional(),
  sold: z.number().min(0).optional(),
});

export const updateOrderSchema = z.object({
  supplier: z.string().optional(),
  orderDate: z.string().optional(),
  items: z.array(orderItemSchema).optional(),
  totalAmount: z.number().min(0).optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "pendente"]).optional(),
  notes: z.string().optional(),
  operatorName: z.string().optional(),
});

export const updateStockMovementSchema = z.object({
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  movementDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInventorySnapshotSchema = z.object({
  snapshotDate: z.string().optional(),
  initialQuantity: z.number().min(0).optional(),
  finalQuantity: z.number().min(0).optional(),
  theoreticalQuantity: z.number().min(0).optional(),
  variance: z.number().optional(),
});

export const updateEditableInventorySchema = z.object({
  initialQuantity: z.number().min(0).optional(),
  finalQuantity: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type UpdateRecipe = z.infer<typeof updateRecipeSchema>;
export type Dish = typeof dishes.$inferSelect;
export type InsertDish = z.infer<typeof insertDishSchema>;
export type UpdateDish = z.infer<typeof updateDishSchema>;
export type Waste = typeof waste.$inferSelect;
export type InsertWaste = z.infer<typeof insertWasteSchema>;
export type PersonalMeal = typeof personalMeals.$inferSelect;
export type InsertPersonalMeal = z.infer<typeof insertPersonalMealSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type UpdateStockMovement = z.infer<typeof updateStockMovementSchema>;
export type InventorySnapshot = typeof inventorySnapshots.$inferSelect;
export type InsertInventorySnapshot = z.infer<typeof insertInventorySnapshotSchema>;
export type UpdateInventorySnapshot = z.infer<typeof updateInventorySnapshotSchema>;
export type EditableInventory = typeof editableInventory.$inferSelect;
export type InsertEditableInventory = z.infer<typeof insertEditableInventorySchema>;
export type UpdateEditableInventory = z.infer<typeof updateEditableInventorySchema>;
