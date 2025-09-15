import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

// PDF Export utilities
import {
  exportInventoryToPDF,
  exportProductsToPDF,
  exportOrdersToPDF,
  exportRecipesToPDF,
  exportDishesToPDF,
  exportWasteToPDF
} from "@/utils/pdfExport";

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
import WasteRegistry from "@/components/WasteRegistry";
import SalesSummary from "@/components/SalesSummary";
import OrderForm from "@/components/OrderForm";
import OrderList from "@/components/OrderList";
import StockMovementForm from "@/components/StockMovementForm";
import StockMovementList from "@/components/StockMovementList";
import InventoryGrid from "@/components/InventoryGrid";

// API Hooks
import {
  useProducts,
  useRecipes,
  useDishes,
  useWaste,
  usePersonalMeals,
  useOrders,
  useStockMovements,
  useInventorySnapshots,
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
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  useCreateStockMovement,
  useUpdateStockMovement,
  useDeleteStockMovement,
  useCreateInventorySnapshot,
  useUpdateInventorySnapshot,
  useDeleteInventorySnapshot,
} from "@/hooks/useApi";

// Types
import type { Product, Recipe, Dish, Order, StockMovement, InventorySnapshot, InsertProduct, InsertRecipe, InsertDish, InsertWaste, InsertPersonalMeal, InsertOrder, InsertStockMovement, InsertInventorySnapshot } from "@shared/schema";

function FoodCostManager() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [maxFoodCost, setMaxFoodCost] = useState(30);
  
  // Edit state - keep as local state
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [editingDish, setEditingDish] = useState<Dish | undefined>();
  const [editingOrder, setEditingOrder] = useState<Order | undefined>();
  const [editingStockMovement, setEditingStockMovement] = useState<StockMovement | undefined>();
  const [selectedProductForMovements, setSelectedProductForMovements] = useState<string | null>(null);
  
  // React Query hooks for data fetching
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: recipes = [], isLoading: isLoadingRecipes } = useRecipes();
  const { data: dishes = [], isLoading: isLoadingDishes } = useDishes();
  const { data: waste = [], isLoading: isLoadingWaste } = useWaste();
  const { data: personalMeals = [], isLoading: isLoadingPersonalMeals } = usePersonalMeals();
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
  const { data: stockMovements = [], isLoading: isLoadingStockMovements } = useStockMovements();
  const { data: inventorySnapshots = [], isLoading: isLoadingInventorySnapshots } = useInventorySnapshots();

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
  
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();
  
  const createStockMovementMutation = useCreateStockMovement();
  const updateStockMovementMutation = useUpdateStockMovement();
  const deleteStockMovementMutation = useDeleteStockMovement();
  
  const createInventorySnapshotMutation = useCreateInventorySnapshot();
  const updateInventorySnapshotMutation = useUpdateInventorySnapshot();
  const deleteInventorySnapshotMutation = useDeleteInventorySnapshot();

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

  // Order handlers
  const handleAddOrder = (order: InsertOrder) => {
    createOrderMutation.mutate(order);
    console.log("Order creation submitted:", order);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    console.log("Editing order:", order);
  };

  const handleUpdateOrder = (updatedOrder: InsertOrder) => {
    if (!editingOrder) return;
    
    updateOrderMutation.mutate(
      { id: editingOrder.id, data: updatedOrder },
      {
        onSuccess: () => {
          setEditingOrder(undefined);
        },
      }
    );
    console.log("Order update submitted:", updatedOrder);
  };

  const handleCancelEditOrder = () => {
    setEditingOrder(undefined);
    console.log("Order edit cancelled");
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrderMutation.mutate(orderId);
    console.log("Order deletion submitted:", orderId);
  };

  // Stock Movement handlers
  const handleAddStockMovement = (movement: InsertStockMovement) => {
    createStockMovementMutation.mutate(movement);
    console.log("Stock movement creation submitted:", movement);
  };

  const handleEditStockMovement = (movement: StockMovement) => {
    setEditingStockMovement(movement);
    console.log("Editing stock movement:", movement);
  };

  const handleUpdateStockMovement = (updatedMovement: InsertStockMovement) => {
    if (!editingStockMovement) return;
    
    updateStockMovementMutation.mutate(
      { id: editingStockMovement.id, data: updatedMovement },
      {
        onSuccess: () => {
          setEditingStockMovement(undefined);
        },
      }
    );
    console.log("Stock movement update submitted:", updatedMovement);
  };

  const handleCancelEditStockMovement = () => {
    setEditingStockMovement(undefined);
    console.log("Stock movement edit cancelled");
  };

  const handleDeleteStockMovement = (movementId: string) => {
    deleteStockMovementMutation.mutate(movementId);
    console.log("Stock movement deletion submitted:", movementId);
  };

  const handleViewMovements = (productId: string) => {
    setSelectedProductForMovements(productId);
  };

  const handleCreateSnapshot = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Calculate current theoretical quantity using SAME logic as InventoryGrid
    const latestSnapshot = inventorySnapshots
      .filter(s => s.productId === productId)
      .sort((a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime())[0];

    // FIXED BASELINE LOGIC: Use same logic as InventoryGrid
    let initialQuantity: number;
    let relevantMovements: StockMovement[];

    if (latestSnapshot) {
      // BASELINE FIX: Use finalQuantity as the baseline (actual counted stock at snapshot time)
      initialQuantity = latestSnapshot.finalQuantity;
      
      // Filter movements to only those AFTER the latest snapshot date
      const cutoffDate = new Date(latestSnapshot.snapshotDate);
      relevantMovements = stockMovements.filter(m => 
        m.productId === productId && new Date(m.movementDate) > cutoffDate
      );
    } else {
      // NO-SNAPSHOT FIX: No historic movements, just use current product quantity
      initialQuantity = product.quantity;
      relevantMovements = []; // No movements to consider
    }
    
    // Calculate IN/OUT quantities from relevant movements only
    const inQuantity = relevantMovements
      .filter(m => m.movementType === "in")
      .reduce((sum, m) => sum + m.quantity, 0);
    const outQuantity = relevantMovements
      .filter(m => m.movementType === "out")
      .reduce((sum, m) => sum + m.quantity, 0);
    
    // CORRECT SEMANTICS: Teorico = computed theoretical quantity (initial + IN - OUT)
    const theoreticalQuantity = initialQuantity + inQuantity - outQuantity;
    
    // Prompt user for actual measured quantity
    const actualQuantityStr = window.prompt(
      `Crea snapshot per: ${product.name}\n\n` +
      `Quantità teorica: ${theoreticalQuantity.toFixed(2)} ${product.unit}\n` +
      `Inserisci la quantità reale misurata:`,
      theoreticalQuantity.toFixed(2)
    );
    
    if (actualQuantityStr === null) return; // User cancelled
    
    const actualQuantity = parseFloat(actualQuantityStr);
    if (isNaN(actualQuantity) || actualQuantity < 0) {
      alert("Quantità non valida");
      return;
    }
    
    const variance = actualQuantity - theoreticalQuantity;
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Create the snapshot with CORRECT semantics
    createInventorySnapshotMutation.mutate({
      productId,
      snapshotDate: currentDate,
      initialQuantity: initialQuantity, // FIXED: Use the baseline we started with
      finalQuantity: actualQuantity,   // User-entered actual measured quantity
      theoreticalQuantity: theoreticalQuantity, // Computed theoretical (baseline + IN - OUT)
      variance: variance // actualQuantity - theoreticalQuantity
    });
    
    console.log("Snapshot creation submitted:", {
      productId,
      theoretical: theoreticalQuantity,
      actual: actualQuantity,
      variance
    });
  };

  const handleExportPDF = () => {
    try {
      switch (activeTab) {
        case "inventory":
          // Get editable inventory data from queryClient
          const editableInventoryData = queryClient.getQueryData(["/api/editable-inventory"]) as any[] || [];
          exportInventoryToPDF(
            products, 
            editableInventoryData,
            stockMovements, 
            waste, 
            personalMeals, 
            dishes
          );
          break;
          
        case "food-cost":
          exportDishesToPDF(dishes, products);
          break;
          
        case "dishes":
          exportDishesToPDF(dishes, products);
          break;
          
        case "orders":
          exportOrdersToPDF(orders);
          break;
          
        case "warehouse":
          // Get editable inventory data for warehouse export
          const warehouseInventoryData = queryClient.getQueryData(["/api/editable-inventory"]) as any[] || [];
          exportInventoryToPDF(
            products, 
            warehouseInventoryData,
            stockMovements, 
            waste, 
            personalMeals, 
            dishes
          );
          break;
          
        case "waste":
          exportWasteToPDF(waste, products);
          break;
          
        case "products":
          exportProductsToPDF(products);
          break;
          
        case "recipes":
          exportRecipesToPDF(recipes, products);
          break;
          
        default:
          // Default to comprehensive inventory export
          const defaultInventoryData = queryClient.getQueryData(["/api/editable-inventory"]) as any[] || [];
          exportInventoryToPDF(
            products, 
            defaultInventoryData,
            stockMovements, 
            waste, 
            personalMeals, 
            dishes
          );
          break;
      }
      
      console.log(`PDF export completed for section: ${activeTab}`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Errore durante l'esportazione PDF. Riprova.");
    }
  };

  // Show loading state while data is being fetched
  const isLoading = isLoadingProducts || isLoadingRecipes || isLoadingDishes || isLoadingWaste || isLoadingPersonalMeals || isLoadingOrders || isLoadingStockMovements || isLoadingInventorySnapshots;

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
                showSalesDetails={false}
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

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="md:flex md:gap-6 space-y-6 md:space-y-0">
              <div className="md:w-1/2">
                <OrderForm 
                  products={products} 
                  onSubmit={editingOrder ? handleUpdateOrder : handleAddOrder}
                  editOrder={editingOrder}
                  onCancel={editingOrder ? handleCancelEditOrder : undefined}
                />
              </div>
              <div className="md:w-1/2">
                <OrderList 
                  orders={orders} 
                  products={products}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                />
              </div>
            </div>
          )}

          {/* Warehouse Tab */}
          {activeTab === "warehouse" && (
            <div className="space-y-6">
              {/* Inventory Overview with 5 columns */}
              <InventoryGrid 
                products={products}
                stockMovements={stockMovements}
                waste={waste}
                personalMeals={personalMeals}
                onViewMovements={handleViewMovements}
              />
              
              {/* Stock Movement Management */}
              <div className="md:flex md:gap-6 space-y-6 md:space-y-0">
                <div className="md:w-1/2">
                  <StockMovementForm 
                    products={products} 
                    onSubmit={editingStockMovement ? handleUpdateStockMovement : handleAddStockMovement}
                    editMovement={editingStockMovement}
                    onCancel={editingStockMovement ? handleCancelEditStockMovement : undefined}
                  />
                </div>
                <div className="md:w-1/2">
                  <StockMovementList 
                    movements={stockMovements} 
                    products={products}
                    onEdit={handleEditStockMovement}
                    onDelete={handleDeleteStockMovement}
                    selectedProductId={selectedProductForMovements}
                    onFilterByProduct={setSelectedProductForMovements}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Waste Tab */}
          {activeTab === "waste" && (
            <div className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <WasteForm 
                  products={products}
                  dishes={dishes}
                  onSubmitWaste={handleAddWaste}
                  onSubmitPersonalMeal={handleAddPersonalMeal}
                />
              </div>
              
              <WasteRegistry 
                waste={waste}
                personalMeals={personalMeals}
                products={products}
                dishes={dishes}
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