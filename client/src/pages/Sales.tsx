import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrendingUp, ShoppingCart, Plus, Edit, Trash2, Euro, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useSales,
  useDishes,
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
} from "@/hooks/useApi";
import type { Sales, InsertSales } from "@shared/schema";
import { insertSalesSchema } from "@shared/schema";

export default function Sales() {
  const [editingSale, setEditingSale] = useState<Sales | undefined>();
  const [showForm, setShowForm] = useState(false);

  // Data fetching
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: dishes = [] } = useDishes();

  // Mutations
  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();

  // Form setup
  const form = useForm<InsertSales>({
    resolver: zodResolver(insertSalesSchema),
    defaultValues: {
      dishId: "",
      dishName: "",
      quantitySold: 1,
      unitCost: 0,
      unitRevenue: 0,
      saleDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  // Form handlers
  const handleCreateSale = (data: InsertSales) => {
    createSaleMutation.mutate(data);
    setShowForm(false);
    form.reset();
  };

  const handleUpdateSale = (data: InsertSales) => {
    if (editingSale) {
      updateSaleMutation.mutate({ id: editingSale.id, data });
      setEditingSale(undefined);
      setShowForm(false);
      form.reset();
    }
  };

  const handleDeleteSale = (id: string) => {
    deleteSaleMutation.mutate(id);
  };

  const handleEdit = (sale: Sales) => {
    setEditingSale(sale);
    setShowForm(true);
    form.reset({
      dishId: sale.dishId,
      dishName: sale.dishName,
      quantitySold: sale.quantitySold,
      unitCost: sale.unitCost,
      unitRevenue: sale.unitRevenue,
      saleDate: sale.saleDate,
      notes: sale.notes || "",
    });
  };

  const handleDishSelect = (dishId: string) => {
    const selectedDish = dishes.find(d => d.id === dishId);
    if (selectedDish) {
      form.setValue("dishName", selectedDish.name);
      form.setValue("unitCost", selectedDish.totalCost);
      form.setValue("unitRevenue", selectedDish.netPrice);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSale(undefined);
    form.reset();
  };

  // Calculate totals
  const totalQuantitySold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const totalCostOfSales = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
  const totalProfit = totalRevenue - totalCostOfSales;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header and Summary */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            Vendite
          </h1>
          <p className="text-muted-foreground">
            Gestisci le vendite dei piatti e monitora le performance
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          data-testid="button-add-sale"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova Vendita
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unità Vendute
                </p>
                <p className="text-2xl font-bold font-mono">{totalQuantitySold}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Costo Totale
                </p>
                <p className="text-2xl font-bold font-mono">€{totalCostOfSales.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ricavo Totale
                </p>
                <p className="text-2xl font-bold font-mono">€{totalRevenue.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Profitto Totale
                </p>
                <p className={`text-2xl font-bold font-mono ${totalProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  €{totalProfit.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSale ? "Modifica Vendita" : "Nuova Vendita"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(editingSale ? handleUpdateSale : handleCreateSale)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dishId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Piatto</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleDishSelect(value);
                            }}
                            data-testid="select-dish"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona piatto" />
                            </SelectTrigger>
                            <SelectContent>
                              {dishes.map((dish) => (
                                <SelectItem key={dish.id} value={dish.id}>
                                  {dish.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dishName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Piatto</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-dish-name" readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantitySold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantità Venduta</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-quantity-sold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="saleDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Vendita</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-sale-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Unitario (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-unit-cost"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ricavo Unitario (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-unit-revenue"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (opzionale)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ""}
                          data-testid="textarea-notes" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createSaleMutation.isPending || updateSaleMutation.isPending}
                    data-testid="button-submit-sale"
                  >
                    {editingSale ? "Aggiorna" : "Crea"} Vendita
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    data-testid="button-cancel-sale"
                  >
                    Annulla
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Vendite Registrate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <p className="text-center text-muted-foreground">Caricamento vendite...</p>
          ) : sales.length === 0 ? (
            <p className="text-center text-muted-foreground italic">
              Nessuna vendita ancora registrata.
            </p>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center p-4 bg-muted rounded-lg hover-elevate"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{sale.dishName}</span>
                      <Badge variant="outline">x{sale.quantitySold}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {sale.saleDate}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Costo Tot:</span>{" "}
                        <span className="font-mono">€{sale.totalCost.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ricavo Tot:</span>{" "}
                        <span className="font-mono">€{sale.totalRevenue.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profitto:</span>{" "}
                        <span className={`font-mono ${(sale.totalRevenue - sale.totalCost) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                          €{(sale.totalRevenue - sale.totalCost).toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margine:</span>{" "}
                        <span className="font-mono">
                          {sale.totalRevenue > 0 ? ((sale.totalRevenue - sale.totalCost) / sale.totalRevenue * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                    {sale.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {sale.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(sale)}
                      data-testid={`button-edit-sale-${sale.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteSale(sale.id)}
                      data-testid={`button-delete-sale-${sale.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}