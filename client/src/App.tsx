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

// API Hooks
import {
  useProducts,
  useRecipes,
  useDishes,
  useWaste,
  usePersonalMeals,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
  useCreateDish,
  useUpdateDish,
  useDeleteDish,
  useCreateWaste,
  useCreatePersonalMeal,
} from "@/hooks/useApi";

// Types
import type { Product, Recipe, Dish, InsertProduct, InsertRecipe, InsertDish, InsertWaste, InsertPersonalMeal } from "@shared/schema";

function FoodCostManager() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [maxFoodCost, setMaxFoodCost] = useState(30);
  
  // Edit state - keep as local state
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [editingDish, setEditingDish] = useState<Dish | undefined>();
  
  // React Query hooks for data fetching
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: recipes = [], isLoading: isLoadingRecipes } = useRecipes();
  const { data: dishes = [], isLoading: isLoadingDishes } = useDishes();
  const { data: waste = [], isLoading: isLoadingWaste } = useWaste();
  const { data: personalMeals = [], isLoading: isLoadingPersonalMeals } = usePersonalMeals();

  // React Query mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const deleteRecipeMutation = useDeleteRecipe();
  
  const createDishMutation = useCreateDish();
  const updateDishMutation = useUpdateDish();
  const deleteDishMutation = useDeleteDish();
  
  const createWasteMutation = useCreateWaste();
  const createPersonalMealMutation = useCreatePersonalMeal();

  // Product handlers
  const handleAddProduct = (product: InsertProduct) => {
    createProductMutation.mutate(product);
    console.log("Product creation submitted:", product);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    console.log("Editing product:", product);
  };

  const handleUpdateProduct = (updatedProduct: InsertProduct) => {
    if (!editingProduct) return;
    
    updateProductMutation.mutate(
      { id: editingProduct.id, data: updatedProduct },
      {
        onSuccess: () => {
          setEditingProduct(undefined);
        },
      }
    );
    console.log("Product update submitted:", updatedProduct);
  };

  const handleCancelEditProduct = () => {
    setEditingProduct(undefined);
    console.log("Product edit cancelled");
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProductMutation.mutate(productId);
    console.log("Product deletion submitted:", productId);
  };

  // Recipe handlers
  const handleAddRecipe = (recipe: InsertRecipe) => {
    createRecipeMutation.mutate(recipe);
    console.log("Recipe creation submitted:", recipe);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    console.log("Editing recipe:", recipe);
  };

  const handleUpdateRecipe = (updatedRecipe: InsertRecipe) => {
    if (!editingRecipe) return;
    
    updateRecipeMutation.mutate(
      { id: editingRecipe.id, data: updatedRecipe },
      {
        onSuccess: () => {
          setEditingRecipe(undefined);
        },
      }
    );
    console.log("Recipe update submitted:", updatedRecipe);
  };

  const handleCancelEditRecipe = () => {
    setEditingRecipe(undefined);
    console.log("Recipe edit cancelled");
  };

  const handleDeleteRecipe = (recipeId: string) => {
    deleteRecipeMutation.mutate(recipeId);
    console.log("Recipe deletion submitted:", recipeId);
  };

  // Dish handlers
  const handleAddDish = (dish: InsertDish) => {
    createDishMutation.mutate(dish);
    console.log("Dish creation submitted:", dish);
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    console.log("Editing dish:", dish);
  };

  const handleUpdateDish = (updatedDish: InsertDish) => {
    if (!editingDish) return;
    
    updateDishMutation.mutate(
      { id: editingDish.id, data: updatedDish },
      {
        onSuccess: () => {
          setEditingDish(undefined);
        },
      }
    );
    console.log("Dish update submitted:", updatedDish);
  };

  const handleCancelEditDish = () => {
    setEditingDish(undefined);
    console.log("Dish edit cancelled");
  };

  const handleDeleteDish = (dishId: string) => {
    deleteDishMutation.mutate(dishId);
    console.log("Dish deletion submitted:", dishId);
  };

  const handleUpdateSold = (dishId: string, sold: number) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;
    
    updateDishMutation.mutate({
      id: dishId,
      data: { sold }
    });
    console.log("Dish sold update submitted:", dishId, sold);
  };

  const handleClearSales = () => {
    // Update all dishes to have sold = 0
    dishes.forEach(dish => {
      if (dish.sold > 0) {
        updateDishMutation.mutate({
          id: dish.id,
          data: { sold: 0 }
        });
      }
    });
    console.log("Clear all sales submitted");
  };

  // Waste and Personal Meal handlers
  const handleAddWaste = (wasteData: InsertWaste) => {
    createWasteMutation.mutate(wasteData);
    console.log("Waste creation submitted:", wasteData);
  };

  const handleAddPersonalMeal = (mealData: InsertPersonalMeal) => {
    createPersonalMealMutation.mutate(mealData);
    console.log("Personal meal creation submitted:", mealData);
  };

  const handleExportPDF = () => {
    console.log("Export PDF functionality would be implemented here");
    // TODO: Implement PDF export functionality
  };

  // Show loading state while data is being fetched
  const isLoading = isLoadingProducts || isLoadingRecipes || isLoadingDishes || isLoadingWaste || isLoadingPersonalMeals;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Caricamento dati...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Connessione al database in corso
          </div>
        </div>
      </div>
    );
  }

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
                <ProductForm 
                  onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                  editProduct={editingProduct}
                  onCancel={editingProduct ? handleCancelEditProduct : undefined}
                />
                <RecipeForm 
                  products={products} 
                  onSubmit={editingRecipe ? handleUpdateRecipe : handleAddRecipe}
                  editRecipe={editingRecipe}
                  onCancel={editingRecipe ? handleCancelEditRecipe : undefined}
                />
              </div>
              <div className="md:w-1/2 space-y-6">
                <ProductList 
                  products={products} 
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
                <RecipeList 
                  recipes={recipes} 
                  products={products}
                  onEdit={handleEditRecipe}
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
                    onSubmit={editingDish ? handleUpdateDish : handleAddDish}
                    editDish={editingDish}
                    onCancel={editingDish ? handleCancelEditDish : undefined}
                  />
                </div>
                <div className="md:w-1/2">
                  <DishList 
                    dishes={dishes} 
                    products={products}
                    onEdit={handleEditDish}
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