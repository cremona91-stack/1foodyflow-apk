import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { 
  Product, Recipe, Dish, Waste, PersonalMeal, Order,
  InsertProduct, InsertRecipe, InsertDish, InsertWaste, InsertPersonalMeal, InsertOrder,
  UpdateProduct, UpdateRecipe, UpdateDish, UpdateOrder
} from "@shared/schema";

// Products hooks
export function useProducts() {
  return useQuery({
    queryKey: ["/api/products"],
    queryFn: api.products.getProducts,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["/api/products", id],
    queryFn: () => api.products.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.products.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Successo",
        description: "Prodotto creato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la creazione del prodotto",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProduct }) =>
      api.products.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Successo",
        description: "Prodotto aggiornato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'aggiornamento del prodotto",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.products.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Successo",
        description: "Prodotto eliminato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'eliminazione del prodotto",
        variant: "destructive",
      });
    },
  });
}

// Recipes hooks
export function useRecipes() {
  return useQuery({
    queryKey: ["/api/recipes"],
    queryFn: api.recipes.getRecipes,
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ["/api/recipes", id],
    queryFn: () => api.recipes.getRecipe(id),
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.recipes.createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Successo",
        description: "Ricetta creata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la creazione della ricetta",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecipe }) =>
      api.recipes.updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Successo",
        description: "Ricetta aggiornata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'aggiornamento della ricetta",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.recipes.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Successo",
        description: "Ricetta eliminata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'eliminazione della ricetta",
        variant: "destructive",
      });
    },
  });
}

// Dishes hooks
export function useDishes() {
  return useQuery({
    queryKey: ["/api/dishes"],
    queryFn: api.dishes.getDishes,
  });
}

export function useDish(id: string) {
  return useQuery({
    queryKey: ["/api/dishes", id],
    queryFn: () => api.dishes.getDish(id),
    enabled: !!id,
  });
}

export function useCreateDish() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.dishes.createDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: "Successo",
        description: "Piatto creato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la creazione del piatto",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDish() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDish }) =>
      api.dishes.updateDish(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: "Successo",
        description: "Piatto aggiornato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'aggiornamento del piatto",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDish() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.dishes.deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: "Successo",
        description: "Piatto eliminato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'eliminazione del piatto",
        variant: "destructive",
      });
    },
  });
}

// Waste hooks
export function useWaste() {
  return useQuery({
    queryKey: ["/api/waste"],
    queryFn: api.waste.getWaste,
  });
}

export function useCreateWaste() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.waste.createWaste,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waste"] });
      toast({
        title: "Successo",
        description: "Scarto registrato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la registrazione dello scarto",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteWaste() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.waste.deleteWaste,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waste"] });
      toast({
        title: "Successo",
        description: "Scarto eliminato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'eliminazione dello scarto",
        variant: "destructive",
      });
    },
  });
}

// Personal Meals hooks
export function usePersonalMeals() {
  return useQuery({
    queryKey: ["/api/personal-meals"],
    queryFn: api.personalMeals.getPersonalMeals,
  });
}

export function useCreatePersonalMeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.personalMeals.createPersonalMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-meals"] });
      toast({
        title: "Successo",
        description: "Pasto personale registrato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la registrazione del pasto personale",
        variant: "destructive",
      });
    },
  });
}

export function useDeletePersonalMeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.personalMeals.deletePersonalMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-meals"] });
      toast({
        title: "Successo",
        description: "Pasto personale eliminato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'eliminazione del pasto personale",
        variant: "destructive",
      });
    },
  });
}

// Orders hooks
export function useOrders() {
  return useQuery({
    queryKey: ["/api/orders"],
    queryFn: api.orders.getOrders,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["/api/orders", id],
    queryFn: () => api.orders.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.orders.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Successo",
        description: "Ordine creato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la creazione dell'ordine",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrder }) =>
      api.orders.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Successo",
        description: "Ordine aggiornato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'aggiornamento dell'ordine",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.orders.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Successo",
        description: "Ordine eliminato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'eliminazione dell'ordine",
        variant: "destructive",
      });
    },
  });
}