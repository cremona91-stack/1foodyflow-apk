import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { 
  Product, 
  StockMovement, 
  EditableInventory, 
  Waste, 
  PersonalMeal,
  InsertEditableInventory,
  UpdateEditableInventory 
} from "@shared/schema";

interface InventoryGridProps {
  products: Product[];
  stockMovements: StockMovement[];
  waste: Waste[];
  personalMeals: PersonalMeal[];
  onViewMovements?: (productId: string) => void;
}

interface InventoryRowData {
  product: Product;
  editableInventory: EditableInventory | undefined;
  initialQuantity: number;
  inQuantity: number;
  outQuantity: number;
  finalQuantity: number;
  variance: number;
  isEditing: boolean;
  editValues: {
    initialQuantity: string;
    finalQuantity: string;
  };
}

export default function InventoryGrid({ 
  products, 
  stockMovements, 
  waste,
  personalMeals,
  onViewMovements
}: InventoryGridProps) {
  const { toast } = useToast();
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editValues, setEditValues] = useState<Record<string, { initialQuantity: string; finalQuantity: string }>>({});

  // Fetch editable inventory data
  const { data: editableInventoryData = [] } = useQuery({
    queryKey: ["/api/editable-inventory"],
    enabled: products.length > 0
  });

  // Create editable inventory mutation
  const createEditableInventoryMutation = useMutation({
    mutationFn: (data: InsertEditableInventory) => apiRequest("/api/editable-inventory", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editable-inventory"] });
      toast({ title: "Inventario creato", description: "Record di inventario editabile creato con successo" });
    },
    onError: (error) => {
      console.error("Error creating editable inventory:", error);
      toast({ 
        title: "Errore", 
        description: "Impossibile creare il record di inventario", 
        variant: "destructive" 
      });
    }
  });

  // Update editable inventory mutation  
  const updateEditableInventoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEditableInventory }) => 
      apiRequest(`/api/editable-inventory/${id}`, {
        method: "PUT", 
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editable-inventory"] });
      toast({ title: "Inventario aggiornato", description: "Quantità salvate con successo" });
    },
    onError: (error) => {
      console.error("Error updating editable inventory:", error);
      toast({ 
        title: "Errore", 
        description: "Impossibile salvare le quantità", 
        variant: "destructive" 
      });
    }
  });

  // Calculate aggregated OUT movements for each product
  const calculateAggregatedOutMovements = (productId: string): number => {
    // Get all dishes that use this product
    const dishesQuery = queryClient.getQueryData(["/api/dishes"]) as any[];
    const dishes = dishesQuery || [];
    
    // Calculate sales OUT (from stock movements with source = "sale")
    const salesOut = stockMovements
      .filter(m => m.productId === productId && m.movementType === "out" && m.source === "sale")
      .reduce((sum, m) => sum + m.quantity, 0);

    // Calculate waste OUT (sum all waste for this product)
    const wasteOut = waste
      .filter(w => w.productId === productId)
      .reduce((sum, w) => sum + w.quantity, 0);

    // Calculate personal meals OUT (dishes using this product * personal meal quantities)
    const personalMealsOut = personalMeals.reduce((sum, meal) => {
      const dish = dishes.find(d => d.id === meal.dishId);
      if (!dish) return sum;
      
      // Find ingredient quantity of this product in the dish
      const ingredient = dish.ingredients?.find((ing: any) => ing.productId === productId);
      if (!ingredient) return sum;
      
      return sum + (ingredient.quantity * meal.quantity);
    }, 0);

    return salesOut + wasteOut + personalMealsOut;
  };

  const inventoryRows: InventoryRowData[] = useMemo(() => {
    return products.map(product => {
      // Find existing editable inventory record for this product
      const editableInventory = editableInventoryData.find(
        (ei: EditableInventory) => ei.productId === product.id
      );

      // Calculate IN movements (from stock movements)
      const inQuantity = stockMovements
        .filter(m => m.productId === product.id && m.movementType === "in")
        .reduce((sum, m) => sum + m.quantity, 0);

      // Calculate aggregated OUT movements (sales + waste + personal meals)
      const outQuantity = calculateAggregatedOutMovements(product.id);

      // Get current values (either from editable inventory or defaults)
      const initialQuantity = editableInventory?.initialQuantity || 0;
      const finalQuantity = editableInventory?.finalQuantity || 0;

      // Calculate VARIANCE = INICIAL + IN - OUT - FINAL
      const variance = initialQuantity + inQuantity - outQuantity - finalQuantity;

      const isEditing = editingRows.has(product.id);
      const productEditValues = editValues[product.id] || {
        initialQuantity: initialQuantity.toString(),
        finalQuantity: finalQuantity.toString()
      };

      return {
        product,
        editableInventory,
        initialQuantity,
        inQuantity,
        outQuantity,
        finalQuantity,
        variance,
        isEditing,
        editValues: productEditValues
      };
    });
  }, [products, editableInventoryData, stockMovements, waste, personalMeals, editingRows, editValues]);

  const startEditing = (productId: string, row: InventoryRowData) => {
    setEditingRows(prev => new Set([...prev, productId]));
    setEditValues(prev => ({
      ...prev,
      [productId]: {
        initialQuantity: row.initialQuantity.toString(),
        finalQuantity: row.finalQuantity.toString()
      }
    }));
  };

  const cancelEditing = (productId: string) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[productId];
      return newValues;
    });
  };

  const saveEditing = async (productId: string, row: InventoryRowData) => {
    const values = editValues[productId];
    if (!values) return;

    const initialQuantity = parseFloat(values.initialQuantity) || 0;
    const finalQuantity = parseFloat(values.finalQuantity) || 0;

    const updateData: UpdateEditableInventory = {
      initialQuantity,
      finalQuantity,
      notes: `Aggiornato manualmente il ${new Date().toLocaleDateString()}`
    };

    try {
      if (row.editableInventory) {
        // Update existing record
        await updateEditableInventoryMutation.mutateAsync({
          id: row.editableInventory.id,
          data: updateData
        });
      } else {
        // Create new record
        const createData: InsertEditableInventory = {
          productId,
          initialQuantity,
          finalQuantity,
          notes: `Creato manualmente il ${new Date().toLocaleDateString()}`
        };
        await createEditableInventoryMutation.mutateAsync(createData);
      }

      // Exit editing mode
      cancelEditing(productId);
    } catch (error) {
      console.error("Error saving inventory:", error);
    }
  };

  const updateEditValue = (productId: string, field: 'initialQuantity' | 'finalQuantity', value: string) => {
    setEditValues(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const getVarianceColor = (variance: number): string => {
    if (variance > 0) {
      return "text-gray-600 dark:text-gray-400"; // Grigio per positivo
    } else if (variance < 0) {
      return "text-red-600 dark:text-red-400"; // Rosso per negativo
    }
    return "text-muted-foreground"; // Neutro per zero
  };

  const getTotalValue = () => {
    return inventoryRows.reduce((sum, row) => {
      return sum + (row.finalQuantity * row.product.pricePerUnit);
    }, 0);
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nessun prodotto trovato</p>
          <p className="text-sm text-muted-foreground mt-1">
            Aggiungi dei prodotti per visualizzare l'inventario editabile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Prodotti</p>
                <p className="text-lg font-semibold" data-testid="stat-total-products">
                  {products.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Valore Inventario</p>
                <p className="text-lg font-semibold" data-testid="stat-total-value">
                  €{getTotalValue().toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Editabili</p>
                <p className="text-lg font-semibold" data-testid="stat-editable">
                  {editableInventoryData.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Magazzino Editabile - VARIANZA = INIZIALE + IN - OUT - FINALE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-7 gap-2 p-4 bg-muted/50 rounded-t-lg font-medium text-sm">
                <div className="col-span-2">Prodotto</div>
                <div className="text-center">Iniziale</div>
                <div className="text-center text-green-600">IN</div>
                <div className="text-center text-red-600">OUT</div>
                <div className="text-center">Finale</div>
                <div className="text-center">Varianza</div>
              </div>

              {/* Rows */}
              {inventoryRows.map((row) => (
                <div 
                  key={row.product.id} 
                  className="grid grid-cols-7 gap-2 p-4 border-b hover:bg-muted/25 transition-colors"
                  data-testid={`inventory-row-${row.product.id}`}
                >
                  {/* Product Info */}
                  <div className="col-span-2">
                    <div className="font-medium" data-testid={`product-name-${row.product.id}`}>
                      {row.product.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {row.product.code} • {row.product.unit}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {!row.isEditing ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(row.product.id, row)}
                          data-testid={`button-edit-${row.product.id}`}
                          className="h-6 text-xs"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Modifica
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveEditing(row.product.id, row)}
                            data-testid={`button-save-${row.product.id}`}
                            className="h-6 text-xs text-green-600"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Salva
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelEditing(row.product.id)}
                            data-testid={`button-cancel-${row.product.id}`}
                            className="h-6 text-xs text-red-600"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Annulla
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Iniziale (Editable) */}
                  <div className="text-center" data-testid={`initial-${row.product.id}`}>
                    {row.isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={row.editValues.initialQuantity}
                        onChange={(e) => updateEditValue(row.product.id, 'initialQuantity', e.target.value)}
                        className="w-20 text-center font-mono text-sm"
                      />
                    ) : (
                      <div className="font-mono">{row.initialQuantity.toFixed(2)}</div>
                    )}
                  </div>

                  {/* IN (Calculated) */}
                  <div className="text-center" data-testid={`in-${row.product.id}`}>
                    <div className="font-mono text-green-600 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {row.inQuantity.toFixed(2)}
                    </div>
                  </div>

                  {/* OUT (Calculated - Aggregated) */}
                  <div className="text-center" data-testid={`out-${row.product.id}`}>
                    <div className="font-mono text-red-600 flex items-center justify-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {row.outQuantity.toFixed(2)}
                    </div>
                  </div>

                  {/* Finale (Editable) */}
                  <div className="text-center" data-testid={`final-${row.product.id}`}>
                    {row.isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={row.editValues.finalQuantity}
                        onChange={(e) => updateEditValue(row.product.id, 'finalQuantity', e.target.value)}
                        className="w-20 text-center font-mono text-sm"
                      />
                    ) : (
                      <div>
                        <div className="font-mono font-semibold">{row.finalQuantity.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          €{(row.finalQuantity * row.product.pricePerUnit).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Varianza (Calculated) */}
                  <div className="text-center" data-testid={`variance-${row.product.id}`}>
                    <div className={`font-mono flex items-center justify-center gap-1 ${getVarianceColor(row.variance)}`}>
                      {row.variance > 0 ? <TrendingUp className="h-3 w-3" /> : 
                       row.variance < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                      {row.variance >= 0 ? '+' : ''}{row.variance.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}