import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface ProductFormProps {
  onSubmit: (product: InsertProduct) => void;
  editProduct?: Product;
  onCancel?: () => void;
}

export default function ProductForm({ onSubmit, editProduct, onCancel }: ProductFormProps) {
  const isEditing = !!editProduct;

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      code: "",
      name: "",
      supplier: "",
      waste: 0,
      notes: "",
      quantity: 0,
      unit: "kg",
      pricePerUnit: 0,
    },
  });

  // Update form values when editProduct changes
  useEffect(() => {
    if (editProduct) {
      form.reset({
        code: editProduct.code,
        name: editProduct.name,
        supplier: editProduct.supplier || "",
        waste: editProduct.waste,
        notes: editProduct.notes || "",
        quantity: editProduct.quantity,
        unit: editProduct.unit as "kg" | "l" | "pezzo",
        pricePerUnit: editProduct.pricePerUnit,
      });
    } else {
      form.reset({
        code: "",
        name: "",
        supplier: "",
        waste: 0,
        notes: "",
        quantity: 0,
        unit: "kg",
        pricePerUnit: 0,
      });
    }
  }, [editProduct, form]);

  const handleSubmit = (data: InsertProduct) => {
    console.log("Product form submitted:", data);
    onSubmit(data);
    if (!isEditing) {
      form.reset();
    }
  };

  const handleCancel = () => {
    console.log("Product form cancelled");
    form.reset();
    onCancel?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          {isEditing ? "Modifica Prodotto" : "Crea Prodotto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codice Prodotto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Es. FAR-001"
                      data-testid="input-product-code"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Prodotto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Es. Farina Tipo 00"
                      data-testid="input-product-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornitore</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Es. Grano & Co."
                      data-testid="input-supplier"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="waste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sfrido (%)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="100"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pr-8"
                        data-testid="input-waste"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Aggiungi note sul prodotto..."
                      rows={2}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantità</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0.00"
                        data-testid="input-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unità</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-unit">
                          <SelectValue placeholder="Seleziona unità" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="pezzo">pezzo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo/Unità (€)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0.00"
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                data-testid="button-submit-product"
              >
                {isEditing ? "Aggiorna Prodotto" : "Aggiungi Prodotto"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex-1"
                  data-testid="button-cancel-product"
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