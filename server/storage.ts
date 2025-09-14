import { 
  type Product, 
  type Recipe, 
  type Dish, 
  type Waste, 
  type PersonalMeal,
  type InsertProduct,
  type InsertRecipe,
  type InsertDish,
  type InsertWaste,
  type InsertPersonalMeal
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for Food Cost Manager
export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Recipes
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<Recipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;

  // Dishes
  getDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, dish: Partial<Dish>): Promise<Dish | undefined>;
  deleteDish(id: string): Promise<boolean>;

  // Waste
  getWaste(): Promise<Waste[]>;
  createWaste(waste: InsertWaste): Promise<Waste>;
  deleteWaste(id: string): Promise<boolean>;

  // Personal Meals
  getPersonalMeals(): Promise<PersonalMeal[]>;
  createPersonalMeal(meal: InsertPersonalMeal): Promise<PersonalMeal>;
  deletePersonalMeal(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private recipes: Map<string, Recipe>;
  private dishes: Map<string, Dish>;
  private waste: Map<string, Waste>;
  private personalMeals: Map<string, PersonalMeal>;

  constructor() {
    this.products = new Map();
    this.recipes = new Map();
    this.dishes = new Map();
    this.waste = new Map();
    this.personalMeals = new Map();
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = { ...insertRecipe, id };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | undefined> {
    const recipe = this.recipes.get(id);
    if (!recipe) return undefined;
    
    const updated = { ...recipe, ...updates };
    this.recipes.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Dishes
  async getDishes(): Promise<Dish[]> {
    return Array.from(this.dishes.values());
  }

  async getDish(id: string): Promise<Dish | undefined> {
    return this.dishes.get(id);
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const id = randomUUID();
    const dish: Dish = { ...insertDish, id, sold: 0 };
    this.dishes.set(id, dish);
    return dish;
  }

  async updateDish(id: string, updates: Partial<Dish>): Promise<Dish | undefined> {
    const dish = this.dishes.get(id);
    if (!dish) return undefined;
    
    const updated = { ...dish, ...updates };
    this.dishes.set(id, updated);
    return updated;
  }

  async deleteDish(id: string): Promise<boolean> {
    return this.dishes.delete(id);
  }

  // Waste
  async getWaste(): Promise<Waste[]> {
    return Array.from(this.waste.values());
  }

  async createWaste(insertWaste: InsertWaste): Promise<Waste> {
    const id = randomUUID();
    const waste: Waste = { ...insertWaste, id };
    this.waste.set(id, waste);
    return waste;
  }

  async deleteWaste(id: string): Promise<boolean> {
    return this.waste.delete(id);
  }

  // Personal Meals
  async getPersonalMeals(): Promise<PersonalMeal[]> {
    return Array.from(this.personalMeals.values());
  }

  async createPersonalMeal(insertMeal: InsertPersonalMeal): Promise<PersonalMeal> {
    const id = randomUUID();
    const meal: PersonalMeal = { ...insertMeal, id };
    this.personalMeals.set(id, meal);
    return meal;
  }

  async deletePersonalMeal(id: string): Promise<boolean> {
    return this.personalMeals.delete(id);
  }
}

export const storage = new MemStorage();
