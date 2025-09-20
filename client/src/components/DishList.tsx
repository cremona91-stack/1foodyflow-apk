import { type Dish, type Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Edit, Trash2, Utensils } from "lucide-react";
import { useState } from "react";

interface DishListProps {
  dishes: Dish[];
  products: Product[];
  onEdit?: (dish: Dish) => void;
  onDelete?: (dishId: string) => void;
  onUpdateSold?: (dishId: string, sold: number) => void;
  onClearSales?: () => void;
}

export default function DishList({ 
  dishes, 
  products, 
  onEdit, 
  onDelete, 
  onUpdateSold, 
  onClearSales 
}: DishListProps) {
  const [soldQuantities, setSoldQuantities] = useState<Record<string, number>>({});

  const handleEdit = (dish: Dish) => {
    console.log("Edit dish:", dish.id);
    onEdit?.(dish);
  };

  const handleDelete = (dishId: string) => {
    console.log("Delete dish:", dishId);
    onDelete?.(dishId);
  };

  const handleSoldChange = (dishId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setSoldQuantities(prev => ({ ...prev, [dishId]: numValue }));
  };

  const handleUpdateSold = (dishId: string) => {
    const quantity = soldQuantities[dishId] || 0;
    console.log("Update sold quantity:", dishId, quantity);
    onUpdateSold?.(dishId, quantity);
  };

  const handleIncrementSold = (dishId: string) => {
    const currentSold = dishes.find(d => d.id === dishId)?.sold || 0;
    console.log("Increment sold for dish:", dishId);
    onUpdateSold?.(dishId, currentSold + 1);
  };

  const handleDecrementSold = (dishId: string) => {
    const currentSold = dishes.find(d => d.id === dishId)?.sold || 0;
    if (currentSold > 0) {
      console.log("Decrement sold for dish:", dishId);
      onUpdateSold?.(dishId, currentSold - 1);
    }
  };

  const handleClearSales = () => {
    console.log("Clear all sales");
    onClearSales?.();
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || "Prodotto sconosciuto";
  };

  const getProductUnit = (productId: string) => {
    return products.find(p => p.id === productId)?.unit || "";
  };

  if (dishes.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Piatti Esistenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground italic">
              Nessun piatto ancora aggiunto.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Piatti Esistenti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dishes.map((dish) => (
            <Card key={dish.id} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{dish.name}</span>
                      <Badge 
                        variant={dish.foodCost > 30 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        FC: {dish.foodCost.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Ingredienti:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {dish.ingredients.map((ingredient, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getProductName(ingredient.productId)}: {ingredient.quantity} {getProductUnit(ingredient.productId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Costo:</span>{" "}
                        <span className="font-medium font-mono">
                          €{dish.totalCost.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prezzo:</span>{" "}
                        <span className="font-medium font-mono">
                          €{dish.sellingPrice.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Netto:</span>{" "}
                        <span className="font-medium font-mono">
                          €{dish.netPrice.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Venduti:</span>{" "}
                        <span className="font-bold font-mono">
                          {dish.sold}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-sm text-muted-foreground">Vendite:</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDecrementSold(dish.id)}
                        disabled={dish.sold === 0}
                        data-testid={`button-decrement-${dish.id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={soldQuantities[dish.id] ?? ""}
                        onChange={(e) => handleSoldChange(dish.id, e.target.value)}
                        onBlur={() => handleUpdateSold(dish.id)}
                        className="w-20 text-center"
                        placeholder={dish.sold.toString()}
                        data-testid={`input-sold-${dish.id}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleIncrementSold(dish.id)}
                        data-testid={`button-increment-${dish.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(dish)}
                      data-testid={`button-edit-dish-${dish.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(dish.id)}
                      data-testid={`button-delete-dish-${dish.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        onClick={handleClearSales}
        className="w-full"
        data-testid="button-clear-sales"
      >
        Azzera Vendite
      </Button>
    </div>
  );
}