// Utility functions for price calculations with real food cost considering waste and weight adjustments

export interface Product {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  wastePercentage: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{
    productId: string;
    quantity: number;
    cost: number;
  }>;
  weightAdjustment: number;
  totalCost: number;
  sellingPrice?: number;
}

export interface RecipeIngredient {
  productId: string;
  quantity: number;
  cost: number;
}

export interface DishIngredient {
  productId?: string;
  recipeId?: string;
  quantity: number;
  cost: number;
}

// Default target food cost percentages
export const DEFAULT_TARGET_FOOD_COST_PERCENTAGE = 30; // 30%

/**
 * Calculate the real food cost for a recipe considering weight adjustment
 * @param totalCost - Total raw ingredient cost
 * @param weightAdjustment - Weight change percentage (e.g., -50 for 50% loss)
 * @returns Real food cost per final kg/unit
 */
export function calculateRecipeRealFoodCost(totalCost: number, weightAdjustment: number): number {
  if (weightAdjustment === -100) {
    throw new Error("Weight adjustment cannot be -100% (complete loss)");
  }
  
  // Weight adjustment affects final yield
  // -50% means we get 50% less product, so cost per kg doubles
  // +70% means we get 70% more product, so cost per kg decreases
  const multiplier = 1 + (weightAdjustment / 100);
  
  // Real cost per final unit = raw cost / final yield multiplier
  return totalCost / multiplier;
}

/**
 * Calculate the real food cost for a product considering waste
 * @param pricePerUnit - Gross price per unit
 * @param wastePercentage - Waste percentage (e.g., 5 for 5% waste)
 * @returns Real food cost per usable unit
 */
export function calculateProductRealFoodCost(pricePerUnit: number, wastePercentage: number): number {
  // Waste affects usable quantity
  // 5% waste means we only get 95% usable, so cost per usable unit increases
  const usablePercentage = (100 - wastePercentage) / 100;
  return pricePerUnit / usablePercentage;
}

/**
 * Calculate suggested selling price based on real food cost and target percentage
 * @param realFoodCost - Real food cost per unit considering waste/weight adjustments
 * @param targetFoodCostPercentage - Target food cost percentage (default: 30%)
 * @returns Suggested selling price
 */
export function calculateSuggestedPrice(
  realFoodCost: number, 
  targetFoodCostPercentage: number = DEFAULT_TARGET_FOOD_COST_PERCENTAGE
): number {
  if (targetFoodCostPercentage <= 0 || targetFoodCostPercentage >= 100) {
    throw new Error("Target food cost percentage must be between 0 and 100");
  }
  
  return realFoodCost / (targetFoodCostPercentage / 100);
}

/**
 * Calculate suggested price for a recipe considering weight adjustment
 * @param totalCost - Total raw ingredient cost
 * @param weightAdjustment - Weight adjustment percentage
 * @param targetFoodCostPercentage - Target food cost percentage (default: 30%)
 * @returns Suggested selling price per final kg/unit
 */
export function calculateRecipeSuggestedPrice(
  totalCost: number,
  weightAdjustment: number,
  targetFoodCostPercentage: number = DEFAULT_TARGET_FOOD_COST_PERCENTAGE
): number {
  const realFoodCost = calculateRecipeRealFoodCost(totalCost, weightAdjustment);
  return calculateSuggestedPrice(realFoodCost, targetFoodCostPercentage);
}

/**
 * Calculate suggested price for a dish considering ingredient waste and recipe weight adjustments
 * @param ingredients - Array of dish ingredients (can be products or recipes)
 * @param products - Map of products by ID
 * @param recipes - Map of recipes by ID
 * @param targetFoodCostPercentage - Target food cost percentage (default: 30%)
 * @returns Suggested selling price for the dish
 */
export function calculateDishSuggestedPrice(
  ingredients: DishIngredient[],
  products: Map<string, Product>,
  recipes: Map<string, Recipe>,
  targetFoodCostPercentage: number = DEFAULT_TARGET_FOOD_COST_PERCENTAGE
): number {
  let totalRealFoodCost = 0;

  for (const ingredient of ingredients) {
    if (ingredient.productId) {
      // Product ingredient - consider waste
      const product = products.get(ingredient.productId);
      if (product) {
        const realCostPerUnit = calculateProductRealFoodCost(product.pricePerUnit, product.wastePercentage);
        totalRealFoodCost += realCostPerUnit * ingredient.quantity;
      }
    } else if (ingredient.recipeId) {
      // Recipe ingredient - consider weight adjustment
      const recipe = recipes.get(ingredient.recipeId);
      if (recipe) {
        const realCostPerUnit = calculateRecipeRealFoodCost(recipe.totalCost, recipe.weightAdjustment);
        totalRealFoodCost += realCostPerUnit * ingredient.quantity;
      }
    }
  }

  return calculateSuggestedPrice(totalRealFoodCost, targetFoodCostPercentage);
}

/**
 * Format price with currency symbol
 * @param price - Price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

/**
 * Calculate actual food cost percentage
 * @param foodCost - Actual food cost
 * @param sellingPrice - Selling price
 * @returns Food cost percentage
 */
export function calculateFoodCostPercentage(foodCost: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return (foodCost / sellingPrice) * 100;
}