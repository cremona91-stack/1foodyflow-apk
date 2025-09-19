import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDishSchema, type InsertDish, type Dish, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Plus, X } from "lucide-react";
import { z } from "zod";

interface DishFormProps {
  onSubmit: (dish: InsertDish) => void;
  products: Product[];
  editDish?: Dish;
  onCancel?: () => void;
}

export default function DishForm({ onSubmit, products, editDish, onCancel }: DishFormProps) {
  const [isEditing] = useState(!!editDish);
  const [ingredients, setIngredients] = useState(editDish?.ingredients || []);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const form = useForm<{ name: string; sellingPrice: number }>({
    resolver: zodResolver(z.object({ 
      name: z.string().min(1, "Nome piatto richiesto"),
      sellingPrice: z.number().min(0.01, "Prezzo di vendita richiesto")
    })),
    defaultValues: {
      name: editDish?.name || "",
      sellingPrice: editDish?.sellingPrice || 0,
    },
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const totalCost = ingredients.reduce((sum, ing) => sum + ing.cost, 0);
  const sellingPrice = form.watch("sellingPrice") || 0;
  const netPrice = sellingPrice / 1.10; // Remove 10% IVA
  const foodCost = netPrice > 0 ? (totalCost / netPrice) * 100 : 0;

  const addIngredient = () => {
    if (!selectedProductId || !quantity) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const parsedQuantity = parseFloat(quantity);
    if (parsedQuantity <= 0) return;

    const cost = parsedQuantity * product.effectivePricePerUnit;
    const ingredient = {
      productId: selectedProductId,
      quantity: parsedQuantity,
      cost,
    };

    console.log("Adding ingredient:", ingredient);
    setIngredients([...ingredients, ingredient]);
    setSelectedProductId("");
    setQuantity("");
  };

  const removeIngredient = (index: number) => {
    console.log("Removing ingredient at index:", index);
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: { name: string; sellingPrice: number }) => {
    if (ingredients.length === 0) return;

    const dish: InsertDish = {
      name: data.name,
      ingredients,
      totalCost,
      sellingPrice: data.sellingPrice,
      netPrice,
      foodCost,
    };

    console.log("Dish form submitted:", dish);
    onSubmit(dish);
    
    if (!isEditing) {
      form.reset();
      setIngredients([]);
    }
  };

  const handleCancel = () => {
    console.log("Dish form cancelled");
    form.reset();
    setIngredients([]);
    onCancel?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          {isEditing ? "Modifica Piatto" : "Nuovo Piatto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Piatto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Es. Spaghetti alla Carbonara"
                      className="bg-yellow-100 dark:bg-yellow-900/30"
                      data-testid="input-dish-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              <h3 className="font-semibold text-foreground mb-4">Ingredienti</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger data-testid="select-dish-ingredient">
                      <SelectValue placeholder="Seleziona un ingrediente" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Quantità"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-yellow-100 dark:bg-yellow-900/30"
                    data-testid="input-dish-ingredient-quantity"
                  />
                </div>
                
                {selectedProduct && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      readOnly
                      value={selectedProduct.unit}
                      className="bg-muted text-muted-foreground"
                    />
                    <Input
                      readOnly
                      value={`€${selectedProduct.effectivePricePerUnit.toFixed(2)}`}
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                )}
                
                <Button
                  type="button"
                  onClick={addIngredient}
                  disabled={!selectedProductId || !quantity}
                  className="w-full"
                  data-testid="button-add-dish-ingredient"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi ingrediente
                </Button>
              </div>

              {ingredients.length > 0 && (
                <div className="mt-4 space-y-2">
                  {ingredients.map((ingredient, index) => {
                    const product = products.find(p => p.id === ingredient.productId);
                    return (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product?.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {ingredient.quantity} {product?.unit}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              €{ingredient.cost.toFixed(2)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeIngredient(index)}
                            data-testid={`button-remove-dish-ingredient-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              <Card className="p-3 mt-4 bg-muted">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Costo Totale Ingredienti:</span>
                  <span className="font-bold font-mono text-lg">
                    €{totalCost.toFixed(2)}
                  </span>
                </div>
              </Card>
            </div>

            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prezzo di vendita (€, IVA inclusa)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="bg-yellow-100 dark:bg-yellow-900/30"
                      placeholder="0.00"
                      data-testid="input-selling-price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="p-3 bg-muted">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prezzo netto:</span>
                  <span className="font-mono font-medium text-primary">
                    €{netPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Food Cost:</span>
                  <span className={`font-mono font-bold ${foodCost > 30 ? 'text-destructive' : 'text-chart-2'}`}>
                    {foodCost.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={ingredients.length === 0}
                className="flex-1"
                data-testid="button-submit-dish"
              >
                {isEditing ? "Aggiorna Piatto" : "Aggiungi Piatto"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex-1"
                  data-testid="button-cancel-dish"
                >
                  Annulla Modifiche
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}