import { 
  type Product, 
  type Recipe, 
  type Dish, 
  type Waste, 
  type PersonalMeal,
  type Order,
  type StockMovement,
  type InventorySnapshot,
  type InsertProduct,
  type InsertRecipe,
  type InsertDish,
  type InsertWaste,
  type InsertPersonalMeal,
  type InsertOrder,
  type InsertStockMovement,
  type InsertInventorySnapshot,
  type UpdateProduct,
  type UpdateRecipe,
  type UpdateDish,
  type UpdateOrder,
  type UpdateStockMovement,
  type UpdateInventorySnapshot,
  products,
  recipes,
  dishes,
  waste,
  personalMeals,
  orders,
  stockMovements,
  inventorySnapshots
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

// Database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Storage interface for Food Cost Manager
export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Recipes
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: UpdateRecipe): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;

  // Dishes
  getDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, dish: UpdateDish): Promise<Dish | undefined>;
  deleteDish(id: string): Promise<boolean>;

  // Waste
  getWaste(): Promise<Waste[]>;
  createWaste(waste: InsertWaste): Promise<Waste>;
  deleteWaste(id: string): Promise<boolean>;

  // Personal Meals
  getPersonalMeals(): Promise<PersonalMeal[]>;
  createPersonalMeal(meal: InsertPersonalMeal): Promise<PersonalMeal>;
  deletePersonalMeal(id: string): Promise<boolean>;

  // Orders (Ricevimento Merci)
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: UpdateOrder): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;

  // Stock Movements (Magazzino In/Out)
  getStockMovements(): Promise<StockMovement[]>;
  getStockMovement(id: string): Promise<StockMovement | undefined>;
  getStockMovementsByProduct(productId: string): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  updateStockMovement(id: string, movement: UpdateStockMovement): Promise<StockMovement | undefined>;
  deleteStockMovement(id: string): Promise<boolean>;

  // Inventory Snapshots
  getInventorySnapshots(): Promise<InventorySnapshot[]>;
  getInventorySnapshot(id: string): Promise<InventorySnapshot | undefined>;
  getInventorySnapshotsByProduct(productId: string): Promise<InventorySnapshot[]>;
  createInventorySnapshot(snapshot: InsertInventorySnapshot): Promise<InventorySnapshot>;
  updateInventorySnapshot(id: string, snapshot: UpdateInventorySnapshot): Promise<InventorySnapshot | undefined>;
  deleteInventorySnapshot(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values({
      ...insertProduct,
      supplier: insertProduct.supplier || null,
      notes: insertProduct.notes || null,
    }).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: UpdateProduct): Promise<Product | undefined> {
    // Filter out undefined values and ensure only safe fields are updated
    const sanitizedUpdates: any = {};
    if (updates.code !== undefined) sanitizedUpdates.code = updates.code;
    if (updates.name !== undefined) sanitizedUpdates.name = updates.name;
    if (updates.supplier !== undefined) sanitizedUpdates.supplier = updates.supplier;
    if (updates.waste !== undefined) sanitizedUpdates.waste = updates.waste;
    if (updates.notes !== undefined) sanitizedUpdates.notes = updates.notes;
    if (updates.quantity !== undefined) sanitizedUpdates.quantity = updates.quantity;
    if (updates.unit !== undefined) sanitizedUpdates.unit = updates.unit;
    if (updates.pricePerUnit !== undefined) sanitizedUpdates.pricePerUnit = updates.pricePerUnit;
    
    // Always update the updatedAt timestamp
    sanitizedUpdates.updatedAt = new Date();
    
    const result = await db.update(products)
      .set(sanitizedUpdates)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const result = await db.select().from(recipes).where(eq(recipes.id, id));
    return result[0];
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const result = await db.insert(recipes).values(insertRecipe).returning();
    return result[0];
  }

  async updateRecipe(id: string, updates: UpdateRecipe): Promise<Recipe | undefined> {
    // Filter out undefined values and ensure only safe fields are updated
    const sanitizedUpdates: any = {};
    if (updates.name !== undefined) sanitizedUpdates.name = updates.name;
    if (updates.ingredients !== undefined) sanitizedUpdates.ingredients = updates.ingredients;
    if (updates.totalCost !== undefined) sanitizedUpdates.totalCost = updates.totalCost;
    
    // Always update the updatedAt timestamp
    sanitizedUpdates.updatedAt = new Date();
    
    const result = await db.update(recipes)
      .set(sanitizedUpdates)
      .where(eq(recipes.id, id))
      .returning();
    return result[0];
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const result = await db.delete(recipes).where(eq(recipes.id, id));
    return result.rowCount > 0;
  }

  // Dishes
  async getDishes(): Promise<Dish[]> {
    return await db.select().from(dishes);
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const result = await db.select().from(dishes).where(eq(dishes.id, id));
    return result[0];
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const result = await db.insert(dishes).values({
      ...insertDish,
      sold: 0
    }).returning();
    return result[0];
  }

  async updateDish(id: string, updates: UpdateDish): Promise<Dish | undefined> {
    // Filter out undefined values and ensure only safe fields are updated
    const sanitizedUpdates: any = {};
    if (updates.name !== undefined) sanitizedUpdates.name = updates.name;
    if (updates.ingredients !== undefined) sanitizedUpdates.ingredients = updates.ingredients;
    if (updates.totalCost !== undefined) sanitizedUpdates.totalCost = updates.totalCost;
    if (updates.sellingPrice !== undefined) sanitizedUpdates.sellingPrice = updates.sellingPrice;
    if (updates.netPrice !== undefined) sanitizedUpdates.netPrice = updates.netPrice;
    if (updates.foodCost !== undefined) sanitizedUpdates.foodCost = updates.foodCost;
    if (updates.sold !== undefined) sanitizedUpdates.sold = updates.sold;
    
    // Always update the updatedAt timestamp
    sanitizedUpdates.updatedAt = new Date();
    
    const result = await db.update(dishes)
      .set(sanitizedUpdates)
      .where(eq(dishes.id, id))
      .returning();
    return result[0];
  }

  async deleteDish(id: string): Promise<boolean> {
    const result = await db.delete(dishes).where(eq(dishes.id, id));
    return result.rowCount > 0;
  }

  // Waste
  async getWaste(): Promise<Waste[]> {
    return await db.select().from(waste);
  }

  async createWaste(insertWaste: InsertWaste): Promise<Waste> {
    const result = await db.insert(waste).values({
      ...insertWaste,
      notes: insertWaste.notes || null,
    }).returning();
    return result[0];
  }

  async deleteWaste(id: string): Promise<boolean> {
    const result = await db.delete(waste).where(eq(waste.id, id));
    return result.rowCount > 0;
  }

  // Personal Meals
  async getPersonalMeals(): Promise<PersonalMeal[]> {
    return await db.select().from(personalMeals);
  }

  async createPersonalMeal(insertMeal: InsertPersonalMeal): Promise<PersonalMeal> {
    const result = await db.insert(personalMeals).values({
      ...insertMeal,
      notes: insertMeal.notes || null,
    }).returning();
    return result[0];
  }

  async deletePersonalMeal(id: string): Promise<boolean> {
    const result = await db.delete(personalMeals).where(eq(personalMeals.id, id));
    return result.rowCount > 0;
  }

  // Orders (Ricevimento Merci)
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values({
      ...insertOrder,
      notes: insertOrder.notes || null,
      operatorName: insertOrder.operatorName || null,
    }).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: UpdateOrder): Promise<Order | undefined> {
    const sanitizedUpdates: any = {};
    if (updates.supplier !== undefined) sanitizedUpdates.supplier = updates.supplier;
    if (updates.orderDate !== undefined) sanitizedUpdates.orderDate = updates.orderDate;
    if (updates.items !== undefined) sanitizedUpdates.items = updates.items;
    if (updates.totalAmount !== undefined) sanitizedUpdates.totalAmount = updates.totalAmount;
    if (updates.status !== undefined) sanitizedUpdates.status = updates.status;
    if (updates.notes !== undefined) sanitizedUpdates.notes = updates.notes;
    if (updates.operatorName !== undefined) sanitizedUpdates.operatorName = updates.operatorName;
    
    sanitizedUpdates.updatedAt = new Date();
    
    const result = await db.update(orders)
      .set(sanitizedUpdates)
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return result.rowCount > 0;
  }

  // Stock Movements (Magazzino In/Out)
  async getStockMovements(): Promise<StockMovement[]> {
    return await db.select().from(stockMovements);
  }

  async getStockMovement(id: string): Promise<StockMovement | undefined> {
    const result = await db.select().from(stockMovements).where(eq(stockMovements.id, id));
    return result[0];
  }

  async getStockMovementsByProduct(productId: string): Promise<StockMovement[]> {
    return await db.select().from(stockMovements).where(eq(stockMovements.productId, productId));
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const result = await db.insert(stockMovements).values({
      ...insertMovement,
      unitPrice: insertMovement.unitPrice || null,
      totalCost: insertMovement.totalCost || null,
      sourceId: insertMovement.sourceId || null,
      notes: insertMovement.notes || null,
    }).returning();
    return result[0];
  }

  async updateStockMovement(id: string, updates: UpdateStockMovement): Promise<StockMovement | undefined> {
    const sanitizedUpdates: any = {};
    if (updates.quantity !== undefined) sanitizedUpdates.quantity = updates.quantity;
    if (updates.unitPrice !== undefined) sanitizedUpdates.unitPrice = updates.unitPrice;
    if (updates.totalCost !== undefined) sanitizedUpdates.totalCost = updates.totalCost;
    if (updates.movementDate !== undefined) sanitizedUpdates.movementDate = updates.movementDate;
    if (updates.notes !== undefined) sanitizedUpdates.notes = updates.notes;
    
    const result = await db.update(stockMovements)
      .set(sanitizedUpdates)
      .where(eq(stockMovements.id, id))
      .returning();
    return result[0];
  }

  async deleteStockMovement(id: string): Promise<boolean> {
    const result = await db.delete(stockMovements).where(eq(stockMovements.id, id));
    return result.rowCount > 0;
  }

  // Inventory Snapshots
  async getInventorySnapshots(): Promise<InventorySnapshot[]> {
    return await db.select().from(inventorySnapshots);
  }

  async getInventorySnapshot(id: string): Promise<InventorySnapshot | undefined> {
    const result = await db.select().from(inventorySnapshots).where(eq(inventorySnapshots.id, id));
    return result[0];
  }

  async getInventorySnapshotsByProduct(productId: string): Promise<InventorySnapshot[]> {
    return await db.select().from(inventorySnapshots).where(eq(inventorySnapshots.productId, productId));
  }

  async createInventorySnapshot(insertSnapshot: InsertInventorySnapshot): Promise<InventorySnapshot> {
    const result = await db.insert(inventorySnapshots).values({
      ...insertSnapshot,
      theoreticalQuantity: insertSnapshot.theoreticalQuantity || null,
      variance: insertSnapshot.variance || null,
    }).returning();
    return result[0];
  }

  async updateInventorySnapshot(id: string, updates: UpdateInventorySnapshot): Promise<InventorySnapshot | undefined> {
    const sanitizedUpdates: any = {};
    if (updates.snapshotDate !== undefined) sanitizedUpdates.snapshotDate = updates.snapshotDate;
    if (updates.initialQuantity !== undefined) sanitizedUpdates.initialQuantity = updates.initialQuantity;
    if (updates.finalQuantity !== undefined) sanitizedUpdates.finalQuantity = updates.finalQuantity;
    if (updates.theoreticalQuantity !== undefined) sanitizedUpdates.theoreticalQuantity = updates.theoreticalQuantity;
    if (updates.variance !== undefined) sanitizedUpdates.variance = updates.variance;
    
    const result = await db.update(inventorySnapshots)
      .set(sanitizedUpdates)
      .where(eq(inventorySnapshots.id, id))
      .returning();
    return result[0];
  }

  async deleteInventorySnapshot(id: string): Promise<boolean> {
    const result = await db.delete(inventorySnapshots).where(eq(inventorySnapshots.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();