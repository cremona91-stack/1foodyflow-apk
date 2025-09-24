import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChefHat, Utensils, Plus, Calculator, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import RecipeForm from "@/components/RecipeForm";
import RecipeList from "@/components/RecipeList";
import DishForm from "@/components/DishForm";
import DishList from "@/components/DishList";
import {
  useRecipes,
  useDishes,
  useProducts,
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
  useCreateDish,
  useUpdateDish,
  useDeleteDish,
} from "@/hooks/useApi";
import type { Recipe, Dish, Product, InsertRecipe, InsertDish } from "@shared/schema";

export default function Recipes() {
  const [activeTab, setActiveTab] = useState("recipes");
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [editingDish, setEditingDish] = useState<Dish | undefined>();
  
  // Recipe calculator state
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [targetKg, setTargetKg] = useState<string>("");
  const [calculatedIngredients, setCalculatedIngredients] = useState<{product: Product, quantity: number, cost: number}[]>([]);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Data fetching
  const { data: products = [] } = useProducts();
  const { data: recipes = [] } = useRecipes();
  const { data: dishes = [] } = useDishes();

  // Mutations
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const deleteRecipeMutation = useDeleteRecipe();
  
  const createDishMutation = useCreateDish();
  const updateDishMutation = useUpdateDish();
  const deleteDishMutation = useDeleteDish();

  // Recipe handlers
  const handleCreateRecipe = (data: InsertRecipe) => {
    createRecipeMutation.mutate(data);
  };

  const handleUpdateRecipe = (id: string, data: InsertRecipe) => {
    updateRecipeMutation.mutate({ id, data });
    setEditingRecipe(undefined);
  };

  const handleDeleteRecipe = (id: string) => {
    deleteRecipeMutation.mutate(id);
  };

  // Dish handlers
  const handleCreateDish = (data: InsertDish) => {
    createDishMutation.mutate(data);
  };

  const handleUpdateDish = (id: string, data: InsertDish) => {
    updateDishMutation.mutate({ id, data });
    setEditingDish(undefined);
  };

  const handleDeleteDish = (id: string) => {
    deleteDishMutation.mutate(id);
  };

  // Recipe calculator handlers
  const handleCalculateIngredients = () => {
    if (!selectedRecipeId || !targetKg || parseFloat(targetKg) <= 0) {
      setCalculatedIngredients([]);
      return;
    }

    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) {
      setCalculatedIngredients([]);
      return;
    }

    const multiplier = parseFloat(targetKg);
    const ingredients = recipe.ingredients.map(ingredient => {
      const product = products.find(p => p.id === ingredient.productId);
      if (!product) return null;
      
      return {
        product,
        quantity: ingredient.quantity * multiplier,
        cost: ingredient.cost * multiplier
      };
    }).filter(Boolean) as {product: Product, quantity: number, cost: number}[];

    setCalculatedIngredients(ingredients);
  };

  const getTotalCost = () => {
    return calculatedIngredients.reduce((sum, ing) => sum + ing.cost, 0);
  };

  const getCalculationSummary = () => {
    if (calculatedIngredients.length === 0) return "Seleziona ricetta e quantità";
    
    const totalCost = getTotalCost();
    const ingredientCount = calculatedIngredients.length;
    return `${targetKg} kg • ${ingredientCount} ingredienti • €${totalCost.toFixed(2)}`;
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Gestione Ricette e Piatti</CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Ricette
          </TabsTrigger>
          <TabsTrigger value="dishes" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Piatti
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recipe Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingRecipe ? "Modifica Ricetta" : "Nuova Ricetta"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecipeForm
                  products={products}
                  editRecipe={editingRecipe}
                  onSubmit={editingRecipe 
                    ? (data) => handleUpdateRecipe(editingRecipe.id, data)
                    : handleCreateRecipe
                  }
                  onCancel={() => setEditingRecipe(undefined)}
                  data-testid="recipe-form"
                />
              </CardContent>
            </Card>

            {/* Recipe Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calcolatrice Ricette
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-select">Ricetta</Label>
                  <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                    <SelectTrigger data-testid="select-recipe">
                      <SelectValue placeholder="Seleziona una ricetta" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-kg">Kg di semilavorato</Label>
                  <Input
                    id="target-kg"
                    type="number"
                    min="0"
                    step="0.1"
                    value={targetKg}
                    onChange={(e) => {
                      setTargetKg(e.target.value);
                      // Auto-calculate when both fields are filled
                      if (selectedRecipeId && e.target.value) {
                        setTimeout(handleCalculateIngredients, 100);
                      }
                    }}
                    placeholder="es. 3"
                    data-testid="input-target-kg"
                  />
                </div>
                
                <Button 
                  onClick={handleCalculateIngredients} 
                  className="w-full"
                  disabled={!selectedRecipeId || !targetKg}
                  data-testid="button-calculate"
                >
                  Calcola Ingredienti
                </Button>
                
                {calculatedIngredients.length > 0 && (
                  <Collapsible open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        data-testid="button-toggle-ingredients"
                      >
                        <span>{getCalculationSummary()}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isCalculatorOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      <div className="bg-muted p-3 rounded-md space-y-2">
                        <h4 className="font-semibold text-sm">Ingredienti necessari:</h4>
                        {calculatedIngredients.map((ingredient, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{ingredient.product.name}</span>
                            <span className="font-mono">
                              {ingredient.quantity.toFixed(2)} {ingredient.product.unit} • €{ingredient.cost.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold text-sm">
                          <span>Totale</span>
                          <span className="font-mono">€{getTotalCost().toFixed(2)}</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Recipe List */}
            <RecipeList
              recipes={recipes}
              products={products}
              onEdit={setEditingRecipe}
              onDelete={handleDeleteRecipe}
              data-testid="recipe-list"
            />
          </div>
        </TabsContent>

        <TabsContent value="dishes" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Dish Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingDish ? "Modifica Piatto" : "Nuovo Piatto"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DishForm
                  products={products}
                  recipes={recipes}
                  editDish={editingDish}
                  onSubmit={editingDish
                    ? (data) => handleUpdateDish(editingDish.id, data)
                    : handleCreateDish
                  }
                  onCancel={() => setEditingDish(undefined)}
                  data-testid="dish-form"
                />
              </CardContent>
            </Card>

            {/* Dish List */}
            <div>
              <DishList
                dishes={dishes}
                products={products}
                onEdit={setEditingDish}
                onDelete={handleDeleteDish}
                data-testid="dish-list"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}