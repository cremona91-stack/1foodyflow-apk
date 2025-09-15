import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder, type Order, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Plus, Minus, Calendar, User, FileText } from "lucide-react";

interface OrderFormProps {
  onSubmit: (order: InsertOrder) => void;
  editOrder?: Order;
  onCancel?: () => void;
  products: Product[];
}

export default function OrderForm({ onSubmit, editOrder, onCancel, products }: OrderFormProps) {
  const isEditing = !!editOrder;

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      supplier: "",
      orderDate: new Date().toISOString().split('T')[0], // Today's date
      items: [{ productId: "", quantity: 0, unitPrice: 0 }],
      totalAmount: 0,
      status: "pending",
      notes: "",
      operatorName: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Update form values when editOrder changes
  useEffect(() => {
    if (editOrder) {
      form.reset({
        supplier: editOrder.supplier,
        orderDate: editOrder.orderDate.split('T')[0], // Extract date part only
        items: editOrder.items,
        totalAmount: editOrder.totalAmount,
        status: editOrder.status,
        notes: editOrder.notes || "",
        operatorName: editOrder.operatorName || "",
      });
    } else {
      form.reset({
        supplier: "",
        orderDate: new Date().toISOString().split('T')[0],
        items: [{ productId: "", quantity: 0, unitPrice: 0 }],
        totalAmount: 0,
        status: "pending",
        notes: "",
        operatorName: "",
      });
    }
  }, [editOrder, form]);

  // Calculate total amount when items change
  const watchedItems = form.watch("items");
  useEffect(() => {
    const total = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
    form.setValue("totalAmount", total);
  }, [watchedItems, form]);

  const handleSubmit = (data: InsertOrder) => {
    console.log("Order form submitted:", data);
    onSubmit(data);
    if (!isEditing) {
      form.reset({
        supplier: "",
        orderDate: new Date().toISOString().split('T')[0],
        items: [{ productId: "", quantity: 0, unitPrice: 0 }],
        totalAmount: 0,
        status: "pending",
        notes: "",
        operatorName: "",
      });
    }
  };

  const handleCancel = () => {
    console.log("Order form cancelled");
    form.reset();
    onCancel?.();
  };

  const addItem = () => {
    append({ productId: "", quantity: 0, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.code})` : "";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        <CardTitle>
          {isEditing ? "Modifica Ordine" : "Nuovo Ricevimento Merci"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Fornitore
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome fornitore" 
                        data-testid="input-supplier"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data Ordine
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        data-testid="input-order-date"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operatorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Operatore
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome operatore" 
                        data-testid="input-operator-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato Ordine</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      data-testid="select-order-status"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona stato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">In Attesa</SelectItem>
                        <SelectItem value="confirmed">Confermato</SelectItem>
                        <SelectItem value="cancelled">Annullato</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Prodotti Ordinati</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-2"
                  data-testid="button-add-item"
                >
                  <Plus className="h-4 w-4" />
                  Aggiungi Prodotto
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prodotto</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                            data-testid={`select-product-${index}`}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona prodotto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantità</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              data-testid={`input-quantity-${index}`}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prezzo Unitario (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              data-testid={`input-unit-price-${index}`}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        Totale: €{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={fields.length === 1}
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Total Amount Display */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Totale Ordine:</span>
                <span data-testid="text-total-amount">€{form.watch("totalAmount").toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Note
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note aggiuntive sull'ordine..."
                      rows={3}
                      data-testid="input-notes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                data-testid="button-submit-order"
                className="flex-1 md:flex-none"
              >
                {isEditing ? "Aggiorna Ordine" : "Crea Ordine"}
              </Button>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  data-testid="button-cancel-order"
                >
                  Annulla
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}