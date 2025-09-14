import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

// Components
import AppHeader from "@/components/AppHeader";
import TabNavigation from "@/components/TabNavigation";
import ProductForm from "@/components/ProductForm";
import ProductList from "@/components/ProductList";
import RecipeForm from "@/components/RecipeForm";
import RecipeList from "@/components/RecipeList";
import DishForm from "@/components/DishForm";
import DishList from "@/components/DishList";
import WasteForm from "@/components/WasteForm";
import SalesSummary from "@/components/SalesSummary";

// Types
import type { Product, Recipe, Dish, Waste, PersonalMeal, InsertProduct, InsertRecipe, InsertDish, InsertWaste, InsertPersonalMeal } from "@shared/schema";

function FoodCostManager() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [maxFoodCost, setMaxFoodCost] = useState(30);
  
  // Mock data - TODO: remove mock functionality and connect to backend
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      code: 'FAR-001',
      name: 'Farina Tipo 00',
      supplier: 'Molino Bianco',
      waste: 2,
      notes: 'Farina di qualità per pasta fresca',
      quantity: 25,
      unit: 'kg',
      pricePerUnit: 1.20,
    },
    {
      id: '2',
      code: 'OLI-001', 
      name: 'Olio Extravergine',
      supplier: 'Frantoio Rossi',
      waste: 0,
      quantity: 5,
      unit: 'l',
      pricePerUnit: 8.50,
    },
    {
      id: '3',
      code: 'TOM-001',
      name: 'Pomodori San Marzano',
      waste: 5,
      quantity: 10,
      unit: 'kg',
      pricePerUnit: 3.20,
    },
  ]);

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: '1',
      name: 'Pasta Frolla Base',
      ingredients: [
        { productId: '1', quantity: 0.5, cost: 0.60 },
        { productId: '2', quantity: 0.1, cost: 0.85 },
      ],
      totalCost: 1.45,
    },
  ]);

  const [dishes, setDishes] = useState<Dish[]>([
    {
      id: '1',
      name: 'Spaghetti alla Carbonara',
      ingredients: [
        { productId: '1', quantity: 0.1, cost: 0.12 },
        { productId: '2', quantity: 0.02, cost: 0.17 },
      ],
      totalCost: 0.29,
      sellingPrice: 12.00,
      netPrice: 9.84,
      foodCost: 2.9,
      sold: 15,
    },
    {
      id: '2',
      name: 'Pizza Margherita',
      ingredients: [
        { productId: '1', quantity: 0.25, cost: 0.30 },
        { productId: '3', quantity: 0.2, cost: 0.64 },
      ],
      totalCost: 0.94,
      sellingPrice: 8.00,
      netPrice: 6.56,
      foodCost: 14.3,
      sold: 22,
    },
  ]);

  const [waste, setWaste] = useState<Waste[]>([
    {
      id: '1',
      productId: '1',
      quantity: 2,
      cost: 2.40,
      date: '2024-01-15',
      notes: 'Farina scaduta',
    },
  ]);

  const [personalMeals, setPersonalMeals] = useState<PersonalMeal[]>([
    {
      id: '1',
      dishId: '1',
      quantity: 2,
      cost: 0.58,
      date: '2024-01-15',
      notes: 'Pranzo staff',
    },
  ]);

  // Event handlers
  const handleAddProduct = (product: InsertProduct) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
    console.log("Product added:", newProduct);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    console.log("Product deleted:", productId);
  };

  const handleAddRecipe = (recipe: InsertRecipe) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
    };
    setRecipes(prev => [...prev, newRecipe]);
    console.log("Recipe added:", newRecipe);
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    console.log("Recipe deleted:", recipeId);
  };

  const handleAddDish = (dish: InsertDish) => {
    const newDish: Dish = {
      ...dish,
      id: Date.now().toString(),
      sold: 0,
    };
    setDishes(prev => [...prev, newDish]);
    console.log("Dish added:", newDish);
  };

  const handleDeleteDish = (dishId: string) => {
    setDishes(prev => prev.filter(d => d.id !== dishId));
    console.log("Dish deleted:", dishId);
  };

  const handleUpdateSold = (dishId: string, sold: number) => {
    setDishes(prev => 
      prev.map(dish => 
        dish.id === dishId ? { ...dish, sold } : dish
      )
    );
    console.log("Dish sold updated:", dishId, sold);
  };

  const handleClearSales = () => {
    setDishes(prev => prev.map(dish => ({ ...dish, sold: 0 })));
    console.log("All sales cleared");
  };

  const handleAddWaste = (wasteData: InsertWaste) => {
    const newWaste: Waste = {
      ...wasteData,
      id: Date.now().toString(),
    };
    setWaste(prev => [...prev, newWaste]);
    console.log("Waste added:", newWaste);
  };

  const handleAddPersonalMeal = (mealData: InsertPersonalMeal) => {
    const newMeal: PersonalMeal = {
      ...mealData,
      id: Date.now().toString(),
    };
    setPersonalMeals(prev => [...prev, newMeal]);
    console.log("Personal meal added:", newMeal);
  };

  const handleExportPDF = () => {
    console.log("Export PDF functionality would be implemented here");
    // TODO: Implement PDF export functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto bg-card shadow-xl flex flex-col">
        <AppHeader onExportPDF={handleExportPDF} />
        
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-grow p-4 sm:p-8 overflow-y-auto">
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="md:flex md:gap-6 space-y-6 md:space-y-0">
              <div className="md:w-1/2 space-y-6">
                <ProductForm onSubmit={handleAddProduct} />
                <RecipeForm 
                  products={products} 
                  onSubmit={handleAddRecipe} 
                />
              </div>
              <div className="md:w-1/2 space-y-6">
                <ProductList 
                  products={products} 
                  onDelete={handleDeleteProduct}
                />
                <RecipeList 
                  recipes={recipes} 
                  products={products}
                  onDelete={handleDeleteRecipe}
                />
              </div>
            </div>
          )}

          {/* Food Cost Tab */}
          {activeTab === "food-cost" && (
            <div className="space-y-6">
              <SalesSummary 
                dishes={dishes}
                products={products}
                waste={waste}
                personalMeals={personalMeals}
                maxFoodCost={maxFoodCost}
                onMaxFoodCostChange={setMaxFoodCost}
              />
              <div className="md:flex md:gap-6 space-y-6 md:space-y-0">
                <div className="md:w-1/2">
                  <DishForm 
                    products={products} 
                    onSubmit={handleAddDish} 
                  />
                </div>
                <div className="md:w-1/2">
                  <DishList 
                    dishes={dishes} 
                    products={products}
                    onDelete={handleDeleteDish}
                    onUpdateSold={handleUpdateSold}
                    onClearSales={handleClearSales}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Waste Tab */}
          {activeTab === "waste" && (
            <div className="max-w-2xl mx-auto">
              <WasteForm 
                products={products}
                dishes={dishes}
                onSubmitWaste={handleAddWaste}
                onSubmitPersonalMeal={handleAddPersonalMeal}
              />
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <SalesSummary 
              dishes={dishes}
              products={products}
              waste={waste}
              personalMeals={personalMeals}
              maxFoodCost={maxFoodCost}
              onMaxFoodCostChange={setMaxFoodCost}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={FoodCostManager} />
      <Route component={FoodCostManager} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;