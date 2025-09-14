import { apiRequest } from "./queryClient";
import type { 
  Product, Recipe, Dish, Waste, PersonalMeal,
  InsertProduct, InsertRecipe, InsertDish, InsertWaste, InsertPersonalMeal,
  UpdateProduct, UpdateRecipe, UpdateDish
} from "@shared/schema";

// Products API
export const productsApi = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch("/api/products", { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    return response.json();
  },

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`/api/products/${id}`, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    return response.json();
  },

  async createProduct(data: InsertProduct): Promise<Product> {
    const response = await apiRequest("POST", "/api/products", data);
    return response.json();
  },

  async updateProduct(id: string, data: UpdateProduct): Promise<Product> {
    const response = await apiRequest("PUT", `/api/products/${id}`, data);
    return response.json();
  },

  async deleteProduct(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/products/${id}`);
  },
};

// Recipes API
export const recipesApi = {
  async getRecipes(): Promise<Recipe[]> {
    const response = await fetch("/api/recipes", { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.statusText}`);
    }
    return response.json();
  },

  async getRecipe(id: string): Promise<Recipe> {
    const response = await fetch(`/api/recipes/${id}`, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Failed to fetch recipe: ${response.statusText}`);
    }
    return response.json();
  },

  async createRecipe(data: InsertRecipe): Promise<Recipe> {
    const response = await apiRequest("POST", "/api/recipes", data);
    return response.json();
  },

  async updateRecipe(id: string, data: UpdateRecipe): Promise<Recipe> {
    const response = await apiRequest("PUT", `/api/recipes/${id}`, data);
    return response.json();
  },

  async deleteRecipe(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/recipes/${id}`);
  },
};

// Dishes API
export const dishesApi = {
  async getDishes(): Promise<Dish[]> {
    const response = await fetch("/api/dishes", { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Failed to fetch dishes: ${response.statusText}`);
    }
    return response.json();
  },

  async getDish(id: string): Promise<Dish> {
    const response = await fetch(`/api/dishes/${id}`, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Failed to fetch dish: ${response.statusText}`);
    }
    return response.json();
  },

  async createDish(data: InsertDish): Promise<Dish> {
    const response = await apiRequest("POST", "/api/dishes", data);
    return response.json();
  },

  async updateDish(id: string, data: UpdateDish): Promise<Dish> {
    const response = await apiRequest("PUT", `/api/dishes/${id}`, data);
    return response.json();
  },

  async deleteDish(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/dishes/${id}`);
  },
};

// Waste API
export const wasteApi = {
  async getWaste(): Promise<Waste[]> {
    const response = await fetch("/api/waste", { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Failed to fetch waste: ${response.statusText}`);
    }
    return response.json();
  },

  async createWaste(data: InsertWaste): Promise<Waste> {
    const response = await apiRequest("POST", "/api/waste", data);
    return response.json();
  },

  async deleteWaste(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/waste/${id}`);
  },
};

// Personal Meals API
export const personalMealsApi = {
  async getPersonalMeals(): Promise<PersonalMeal[]> {
    const response = await fetch("/api/personal-meals", { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Failed to fetch personal meals: ${response.statusText}`);
    }
    return response.json();
  },

  async createPersonalMeal(data: InsertPersonalMeal): Promise<PersonalMeal> {
    const response = await apiRequest("POST", "/api/personal-meals", data);
    return response.json();
  },

  async deletePersonalMeal(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/personal-meals/${id}`);
  },
};

// Export all APIs for convenience
export const api = {
  products: productsApi,
  recipes: recipesApi,
  dishes: dishesApi,
  waste: wasteApi,
  personalMeals: personalMealsApi,
};