import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Utensils, Plus } from "lucide-react";
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

  const handleUpdateSold = (dishId: string, sold: number) => {
    const dish = dishes.find(d => d.id === dishId);
    if (dish) {
      updateDishMutation.mutate({
        id: dishId,
        data: { ...dish, sold }
      });
    }
  };

  const handleClearSales = () => {
    dishes.forEach(dish => {
      if (dish.sold > 0) {
        updateDishMutation.mutate({
          id: dish.id,
          data: { ...dish, sold: 0 }
        });
      }
    });
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
          <div className="grid gap-6 lg:grid-cols-2">
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

            {/* Recipe List */}
            <div>
              <RecipeList
                recipes={recipes}
                products={products}
                onEdit={setEditingRecipe}
                onDelete={handleDeleteRecipe}
                data-testid="recipe-list"
              />
            </div>
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
                onUpdateSold={handleUpdateSold}
                onClearSales={handleClearSales}
                data-testid="dish-list"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}