import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProductSchema, 
  insertRecipeSchema, 
  insertDishSchema, 
  insertWasteSchema, 
  insertPersonalMealSchema,
  insertOrderSchema,
  insertStockMovementSchema,
  insertInventorySnapshotSchema,
  insertEditableInventorySchema,
  insertBudgetEntrySchema,
  insertEconomicParametersSchema,
  updateProductSchema,
  updateRecipeSchema,
  updateDishSchema,
  updateOrderSchema,
  updateStockMovementSchema,
  updateInventorySnapshotSchema,
  updateEditableInventorySchema,
  updateBudgetEntrySchema,
  updateEconomicParametersSchema,
  upsertEditableInventorySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication setup - registers /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Products API Routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Recipes API Routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ error: "Failed to fetch recipe" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const validatedData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(validatedData);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create recipe" });
    }
  });

  app.put("/api/recipes/:id", async (req, res) => {
    try {
      const validatedData = updateRecipeSchema.parse(req.body);
      const recipe = await storage.updateRecipe(req.params.id, validatedData);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update recipe" });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const success = await storage.deleteRecipe(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  });

  // Dishes API Routes
  app.get("/api/dishes", async (req, res) => {
    try {
      const dishes = await storage.getDishes();
      res.json(dishes);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      res.status(500).json({ error: "Failed to fetch dishes" });
    }
  });

  app.get("/api/dishes/:id", async (req, res) => {
    try {
      const dish = await storage.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      console.error("Error fetching dish:", error);
      res.status(500).json({ error: "Failed to fetch dish" });
    }
  });

  app.post("/api/dishes", async (req, res) => {
    try {
      const validatedData = insertDishSchema.parse(req.body);
      const dish = await storage.createDish(validatedData);
      res.status(201).json(dish);
    } catch (error) {
      console.error("Error creating dish:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create dish" });
    }
  });

  app.put("/api/dishes/:id", async (req, res) => {
    try {
      const validatedData = updateDishSchema.parse(req.body);
      const dish = await storage.updateDish(req.params.id, validatedData);
      if (!dish) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      console.error("Error updating dish:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update dish" });
    }
  });

  app.delete("/api/dishes/:id", async (req, res) => {
    try {
      const success = await storage.deleteDish(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting dish:", error);
      res.status(500).json({ error: "Failed to delete dish" });
    }
  });

  // Waste API Routes
  app.get("/api/waste", async (req, res) => {
    try {
      const waste = await storage.getWaste();
      res.json(waste);
    } catch (error) {
      console.error("Error fetching waste:", error);
      res.status(500).json({ error: "Failed to fetch waste" });
    }
  });

  app.post("/api/waste", async (req, res) => {
    try {
      const validatedData = insertWasteSchema.parse(req.body);
      const waste = await storage.createWaste(validatedData);
      res.status(201).json(waste);
    } catch (error) {
      console.error("Error creating waste:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create waste" });
    }
  });

  app.delete("/api/waste/:id", async (req, res) => {
    try {
      const success = await storage.deleteWaste(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Waste record not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting waste:", error);
      res.status(500).json({ error: "Failed to delete waste" });
    }
  });

  // Personal Meals API Routes
  app.get("/api/personal-meals", async (req, res) => {
    try {
      const meals = await storage.getPersonalMeals();
      res.json(meals);
    } catch (error) {
      console.error("Error fetching personal meals:", error);
      res.status(500).json({ error: "Failed to fetch personal meals" });
    }
  });

  app.post("/api/personal-meals", async (req, res) => {
    try {
      const validatedData = insertPersonalMealSchema.parse(req.body);
      const meal = await storage.createPersonalMeal(validatedData);
      res.status(201).json(meal);
    } catch (error) {
      console.error("Error creating personal meal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create personal meal" });
    }
  });

  app.delete("/api/personal-meals/:id", async (req, res) => {
    try {
      const success = await storage.deletePersonalMeal(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Personal meal not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting personal meal:", error);
      res.status(500).json({ error: "Failed to delete personal meal" });
    }
  });

  // Orders API Routes (Ricevimento Merci)
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const validatedData = updateOrderSchema.parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const statusSchema = z.object({
        status: z.enum(["pending", "confirmed", "cancelled", "pendente"])
      });
      const validatedData = statusSchema.parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const success = await storage.deleteOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // Stock Movements API Routes (Magazzino In/Out)
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.json(movements);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      res.status(500).json({ error: "Failed to fetch stock movements" });
    }
  });

  app.get("/api/stock-movements/product/:productId", async (req, res) => {
    try {
      const movements = await storage.getStockMovementsByProduct(req.params.productId);
      res.json(movements);
    } catch (error) {
      console.error("Error fetching stock movements by product:", error);
      res.status(500).json({ error: "Failed to fetch stock movements by product" });
    }
  });

  app.get("/api/stock-movements/:id", async (req, res) => {
    try {
      const movement = await storage.getStockMovement(req.params.id);
      if (!movement) {
        return res.status(404).json({ error: "Stock movement not found" });
      }
      res.json(movement);
    } catch (error) {
      console.error("Error fetching stock movement:", error);
      res.status(500).json({ error: "Failed to fetch stock movement" });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      const validatedData = insertStockMovementSchema.parse(req.body);
      const movement = await storage.createStockMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      console.error("Error creating stock movement:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create stock movement" });
    }
  });

  app.put("/api/stock-movements/:id", async (req, res) => {
    try {
      const validatedData = updateStockMovementSchema.parse(req.body);
      const movement = await storage.updateStockMovement(req.params.id, validatedData);
      if (!movement) {
        return res.status(404).json({ error: "Stock movement not found" });
      }
      res.json(movement);
    } catch (error) {
      console.error("Error updating stock movement:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update stock movement" });
    }
  });

  app.delete("/api/stock-movements/:id", async (req, res) => {
    try {
      const success = await storage.deleteStockMovement(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Stock movement not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting stock movement:", error);
      res.status(500).json({ error: "Failed to delete stock movement" });
    }
  });

  // Inventory Snapshots API Routes
  app.get("/api/inventory-snapshots", async (req, res) => {
    try {
      const snapshots = await storage.getInventorySnapshots();
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching inventory snapshots:", error);
      res.status(500).json({ error: "Failed to fetch inventory snapshots" });
    }
  });

  app.get("/api/inventory-snapshots/product/:productId", async (req, res) => {
    try {
      const snapshots = await storage.getInventorySnapshotsByProduct(req.params.productId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching inventory snapshots by product:", error);
      res.status(500).json({ error: "Failed to fetch inventory snapshots by product" });
    }
  });

  app.get("/api/inventory-snapshots/:id", async (req, res) => {
    try {
      const snapshot = await storage.getInventorySnapshot(req.params.id);
      if (!snapshot) {
        return res.status(404).json({ error: "Inventory snapshot not found" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error fetching inventory snapshot:", error);
      res.status(500).json({ error: "Failed to fetch inventory snapshot" });
    }
  });

  app.post("/api/inventory-snapshots", async (req, res) => {
    try {
      const validatedData = insertInventorySnapshotSchema.parse(req.body);
      const snapshot = await storage.createInventorySnapshot(validatedData);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating inventory snapshot:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create inventory snapshot" });
    }
  });

  app.put("/api/inventory-snapshots/:id", async (req, res) => {
    try {
      const validatedData = updateInventorySnapshotSchema.parse(req.body);
      const snapshot = await storage.updateInventorySnapshot(req.params.id, validatedData);
      if (!snapshot) {
        return res.status(404).json({ error: "Inventory snapshot not found" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error updating inventory snapshot:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update inventory snapshot" });
    }
  });

  app.delete("/api/inventory-snapshots/:id", async (req, res) => {
    try {
      const success = await storage.deleteInventorySnapshot(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Inventory snapshot not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory snapshot:", error);
      res.status(500).json({ error: "Failed to delete inventory snapshot" });
    }
  });

  // Editable Inventory API Routes
  app.get("/api/editable-inventory", async (req, res) => {
    try {
      const inventory = await storage.getEditableInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching editable inventory:", error);
      res.status(500).json({ error: "Failed to fetch editable inventory" });
    }
  });

  app.get("/api/editable-inventory/product/:productId", async (req, res) => {
    try {
      const inventory = await storage.getEditableInventoryByProduct(req.params.productId);
      if (!inventory) {
        return res.status(404).json({ error: "Editable inventory not found" });
      }
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching editable inventory by product:", error);
      res.status(500).json({ error: "Failed to fetch editable inventory by product" });
    }
  });

  app.post("/api/editable-inventory", async (req, res) => {
    try {
      const validatedData = insertEditableInventorySchema.parse(req.body);
      const inventory = await storage.createEditableInventory(validatedData);
      res.status(201).json(inventory);
    } catch (error) {
      console.error("Error creating editable inventory:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create editable inventory" });
    }
  });

  app.put("/api/editable-inventory/:id", async (req, res) => {
    try {
      const validatedData = updateEditableInventorySchema.parse(req.body);
      const inventory = await storage.updateEditableInventory(req.params.id, validatedData);
      if (!inventory) {
        return res.status(404).json({ error: "Editable inventory record not found" });
      }
      res.json(inventory);
    } catch (error) {
      console.error("Error updating editable inventory:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update editable inventory" });
    }
  });

  app.delete("/api/editable-inventory/:id", async (req, res) => {
    try {
      const success = await storage.deleteEditableInventory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Editable inventory record not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting editable inventory:", error);
      res.status(500).json({ error: "Failed to delete editable inventory" });
    }
  });

  app.post("/api/editable-inventory/upsert", async (req, res) => {
    try {
      const validatedData = upsertEditableInventorySchema.parse(req.body);
      const inventory = await storage.upsertEditableInventory(validatedData);
      res.json(inventory);
    } catch (error) {
      console.error("Error upserting editable inventory:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to upsert editable inventory" });
    }
  });

  // Budget Entries API Routes
  app.get("/api/budget-entries", async (req, res) => {
    try {
      const budgetEntries = await storage.getBudgetEntries();
      res.json(budgetEntries);
    } catch (error) {
      console.error("Error fetching budget entries:", error);
      res.status(500).json({ error: "Failed to fetch budget entries" });
    }
  });

  app.get("/api/budget-entries/:id", async (req, res) => {
    try {
      const budgetEntry = await storage.getBudgetEntry(req.params.id);
      if (!budgetEntry) {
        return res.status(404).json({ error: "Budget entry not found" });
      }
      res.json(budgetEntry);
    } catch (error) {
      console.error("Error fetching budget entry:", error);
      res.status(500).json({ error: "Failed to fetch budget entry" });
    }
  });

  app.get("/api/budget-entries/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const budgetEntries = await storage.getBudgetEntriesByMonth(year, month);
      res.json(budgetEntries);
    } catch (error) {
      console.error("Error fetching budget entries by month:", error);
      res.status(500).json({ error: "Failed to fetch budget entries" });
    }
  });

  app.post("/api/budget-entries", async (req, res) => {
    try {
      const validatedData = insertBudgetEntrySchema.parse(req.body);
      const budgetEntry = await storage.createBudgetEntry(validatedData);
      res.status(201).json(budgetEntry);
    } catch (error) {
      console.error("Error creating budget entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create budget entry" });
    }
  });

  app.put("/api/budget-entries/:id", async (req, res) => {
    try {
      const validatedData = updateBudgetEntrySchema.parse(req.body);
      const budgetEntry = await storage.updateBudgetEntry(req.params.id, validatedData);
      if (!budgetEntry) {
        return res.status(404).json({ error: "Budget entry not found" });
      }
      res.json(budgetEntry);
    } catch (error) {
      console.error("Error updating budget entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update budget entry" });
    }
  });

  app.delete("/api/budget-entries/:id", async (req, res) => {
    try {
      const success = await storage.deleteBudgetEntry(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Budget entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting budget entry:", error);
      res.status(500).json({ error: "Failed to delete budget entry" });
    }
  });

  // Economic Parameters API Routes
  app.get("/api/economic-parameters", async (req, res) => {
    try {
      const parameters = await storage.getEconomicParameters();
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching economic parameters:", error);
      res.status(500).json({ error: "Failed to fetch economic parameters" });
    }
  });

  app.get("/api/economic-parameters/:id", async (req, res) => {
    try {
      const parameters = await storage.getEconomicParameter(req.params.id);
      if (!parameters) {
        return res.status(404).json({ error: "Economic parameters not found" });
      }
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching economic parameters:", error);
      res.status(500).json({ error: "Failed to fetch economic parameters" });
    }
  });

  app.get("/api/economic-parameters/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const parameters = await storage.getEconomicParametersByMonth(year, month);
      if (!parameters) {
        return res.status(404).json({ error: "Economic parameters not found for this month" });
      }
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching economic parameters by month:", error);
      res.status(500).json({ error: "Failed to fetch economic parameters" });
    }
  });

  app.post("/api/economic-parameters", async (req, res) => {
    try {
      const validatedData = insertEconomicParametersSchema.parse(req.body);
      const parameters = await storage.createEconomicParameters(validatedData);
      res.status(201).json(parameters);
    } catch (error) {
      console.error("Error creating economic parameters:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create economic parameters" });
    }
  });

  app.put("/api/economic-parameters/:id", async (req, res) => {
    try {
      const validatedData = updateEconomicParametersSchema.parse(req.body);
      const parameters = await storage.updateEconomicParameters(req.params.id, validatedData);
      if (!parameters) {
        return res.status(404).json({ error: "Economic parameters not found" });
      }
      res.json(parameters);
    } catch (error) {
      console.error("Error updating economic parameters:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update economic parameters" });
    }
  });

  app.put("/api/economic-parameters/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const validatedData = updateEconomicParametersSchema.parse(req.body);
      const parameters = await storage.upsertEconomicParametersByMonth(year, month, validatedData);
      res.json(parameters);
    } catch (error) {
      console.error("Error upserting economic parameters:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to upsert economic parameters" });
    }
  });

  app.delete("/api/economic-parameters/:id", async (req, res) => {
    try {
      const success = await storage.deleteEconomicParameters(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Economic parameters not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting economic parameters:", error);
      res.status(500).json({ error: "Failed to delete economic parameters" });
    }
  });

  // Food Cost Metrics API Routes
  app.get("/api/metrics/food-cost/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Get all required data for food cost calculation
      const [dishes, products, editableInventory, stockMovements] = await Promise.all([
        storage.getDishes(),
        storage.getProducts(),
        storage.getEditableInventory(),
        storage.getStockMovements()
      ]);

      // Create date range for the requested month
      const startDate = new Date(year, month - 1, 1); // month - 1 because Date month is 0-based
      const endDate = new Date(year, month, 0); // Last day of the month
      
      // Filter stock movements for the requested period
      const monthlyStockMovements = stockMovements.filter(movement => {
        const movementDate = new Date(movement.movementDate);
        return movementDate >= startDate && movementDate <= endDate;
      });

      // Create product map for quick lookup
      const productMap = new Map(products.map(p => [p.id, p]));

      // Calculate food cost metrics using the same formula as Dashboard
      // Note: dishes.sold is aggregate data - limitation documented for period-specific sales
      // 1. Calculate NET REVENUE (netPrice) for food sales - using aggregate data
      const totalFoodSales = dishes.reduce((sum, dish) => sum + (dish.netPrice * dish.sold), 0);
      
      // 2. Calculate THEORETICAL food cost (based on recipes) - using aggregate data
      const totalCostOfSales = dishes.reduce((sum, dish) => sum + (dish.totalCost * dish.sold), 0);
      const theoreticalFoodCostPercentage = totalFoodSales > 0 ? (totalCostOfSales / totalFoodSales) * 100 : 0;
      
      // 3. Calculate REAL food cost: (totale iniziale + totale IN - totale finale)
      // Note: editableInventory represents current state, not period-specific
      // Totale iniziale magazzino
      const totaleInizialeM = editableInventory.reduce((sum, inventory) => {
        const product = productMap.get(inventory.productId);
        return sum + (product ? inventory.initialQuantity * product.pricePerUnit : 0);
      }, 0);
      
      // Totale IN magazzino - filtered for the requested month
      const totaleInM = monthlyStockMovements
        .filter(movement => movement.movementType === 'in')
        .reduce((sum, movement) => sum + (movement.totalCost || 0), 0);
      
      // Totale finale magazzino
      const totaleFinaleM = editableInventory.reduce((sum, inventory) => {
        const product = productMap.get(inventory.productId);
        return sum + (product ? inventory.finalQuantity * product.pricePerUnit : 0);
      }, 0);
      
      // REAL Food cost calculation
      const totalFoodCost = totaleInizialeM + totaleInM - totaleFinaleM;
      const realFoodCostPercentage = totalFoodSales > 0 ? (totalFoodCost / totalFoodSales) * 100 : 0;
      
      // Calculate differential: Real - Theoretical
      const realVsTheoreticalDiff = realFoodCostPercentage - theoreticalFoodCostPercentage;

      res.json({
        year,
        month,
        totalFoodSales,
        totalFoodCost,
        foodCostPercentage: realFoodCostPercentage,
        theoreticalFoodCostPercentage,
        realVsTheoreticalDiff,
        calculatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error calculating food cost metrics:", error);
      res.status(500).json({ error: "Failed to calculate food cost metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}