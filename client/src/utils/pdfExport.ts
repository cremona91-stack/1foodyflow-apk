import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Product, StockMovement, Order, Waste, PersonalMeal, Recipe, Dish, EditableInventory } from '@shared/schema';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Common PDF header setup
const setupPDFHeader = (doc: jsPDF, title: string) => {
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Food Cost Manager", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text(title, 105, 30, { align: "center" });
  
  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const date = new Date().toLocaleString('it-IT');
  doc.text(`Generato il: ${date}`, 105, 40, { align: "center" });
  
  return 50; // Return Y position for content start
};

// Export Inventory/Warehouse as PDF
export const exportInventoryToPDF = (
  products: Product[], 
  editableInventory: EditableInventory[],
  stockMovements: StockMovement[],
  waste: Waste[],
  personalMeals: PersonalMeal[],
  dishes: Dish[]
) => {
  const doc = new jsPDF();
  let yPos = setupPDFHeader(doc, "Report Magazzino Editabile");
  
  // Helper function to calculate OUT movements like in InventoryGrid
  const calculateAggregatedOutMovements = (productId: string): number => {
    // Calculate sales OUT (from stock movements with source = "sale")
    const salesOut = stockMovements
      .filter(m => m.productId === productId && m.movementType === "out" && m.source === "sale")
      .reduce((sum, m) => sum + m.quantity, 0);

    // Calculate waste OUT
    const wasteOut = waste
      .filter(w => w.productId === productId)
      .reduce((sum, w) => sum + w.quantity, 0);

    // Calculate personal meals OUT
    const personalMealsOut = personalMeals.reduce((sum, meal) => {
      const dish = dishes.find(d => d.id === meal.dishId);
      if (!dish) return sum;
      
      const ingredient = dish.ingredients?.find((ing: any) => ing.productId === productId);
      if (!ingredient) return sum;
      
      return sum + (ingredient.quantity * meal.quantity);
    }, 0);

    // Calculate dish sales OUT
    const dishSalesOut = dishes.reduce((sum, dish) => {
      if (!dish.sold || dish.sold <= 0) return sum;
      
      const ingredient = dish.ingredients?.find((ing: any) => ing.productId === productId);
      if (!ingredient) return sum;
      
      return sum + (ingredient.quantity * dish.sold);
    }, 0);

    return salesOut + wasteOut + personalMealsOut + dishSalesOut;
  };

  // Calculate statistics
  const inventoryData = products.map(product => {
    const editableRecord = editableInventory.find(ei => ei.productId === product.id);
    const initialQuantity = editableRecord?.initialQuantity || 0;
    const finalQuantity = editableRecord?.finalQuantity || 0;
    
    const inQuantity = stockMovements
      .filter(m => m.productId === product.id && m.movementType === "in")
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const outQuantity = calculateAggregatedOutMovements(product.id);
    const variance = initialQuantity + inQuantity - outQuantity - finalQuantity;
    
    return {
      name: product.name,
      code: product.code,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit,
      initialQuantity,
      inQuantity,
      outQuantity,
      finalQuantity,
      variance,
      finalValue: finalQuantity * product.pricePerUnit,
      varianceValue: variance * product.pricePerUnit
    };
  });

  // Summary statistics
  const totalFinalValue = inventoryData.reduce((sum, item) => sum + item.finalValue, 0);
  const totalVarianceValue = inventoryData.reduce((sum, item) => sum + item.varianceValue, 0);

  // Summary section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RIEPILOGO", 14, yPos);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Prodotti totali: ${products.length}`, 14, yPos);
  doc.text(`Valore Inventario: €${totalFinalValue.toFixed(2)}`, 14, yPos + 6);
  doc.text(`Valore Varianza: €${totalVarianceValue.toFixed(2)}`, 14, yPos + 12);
  yPos += 25;

  // Table data
  const tableColumns = [
    'Prodotto', 'Codice', 'Iniziale', 'IN', 'OUT', 'Finale', 'Varianza', 'Valore Finale', 'Valore Varianza'
  ];

  const tableRows = inventoryData.map(item => [
    item.name,
    item.code,
    `${item.initialQuantity.toFixed(2)} ${item.unit}`,
    `${item.inQuantity.toFixed(2)} ${item.unit}`,
    `${item.outQuantity.toFixed(2)} ${item.unit}`,
    `${item.finalQuantity.toFixed(2)} ${item.unit}`,
    `${item.variance >= 0 ? '+' : ''}${item.variance.toFixed(2)} ${item.unit}`,
    `€${item.finalValue.toFixed(2)}`,
    `€${item.varianceValue.toFixed(2)}`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [tableColumns],
    body: tableRows,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [74, 144, 226],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      6: { // Varianza column
        cellRenderer: (data: any) => {
          const variance = parseFloat(data.cell.text[0].replace(/[+€]/g, ''));
          return {
            textColor: variance < 0 ? [220, 38, 27] : [107, 114, 126]
          };
        }
      },
      8: { // Valore Varianza column
        cellRenderer: (data: any) => {
          const varianceValue = parseFloat(data.cell.text[0].replace(/[+€]/g, ''));
          return {
            textColor: varianceValue < 0 ? [220, 38, 27] : [107, 114, 126]
          };
        }
      }
    }
  });

  doc.save(`inventario-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Products as PDF
export const exportProductsToPDF = (products: Product[]) => {
  const doc = new jsPDF();
  let yPos = setupPDFHeader(doc, "Lista Prodotti");

  const tableColumns = ['Nome', 'Codice', 'Fornitore', 'Unità', 'Prezzo/Unità', 'Categoria'];
  
  const tableRows = products.map(product => [
    product.name,
    product.code,
    product.supplier || 'N/A',
    product.unit,
    `€${product.pricePerUnit.toFixed(2)}`,
    product.category || 'N/A'
  ]);

  doc.autoTable({
    startY: yPos,
    head: [tableColumns],
    body: tableRows,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [74, 144, 226],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save(`prodotti-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Orders as PDF
export const exportOrdersToPDF = (orders: Order[]) => {
  const doc = new jsPDF();
  let yPos = setupPDFHeader(doc, "Lista Ordini");

  const tableColumns = ['Data', 'Fornitore', 'Stato', 'Totale', 'Note'];
  
  const tableRows = orders.map(order => [
    new Date(order.orderDate).toLocaleDateString('it-IT'),
    order.supplier,
    order.status === 'pending' ? 'In Attesa' : 
    order.status === 'confirmed' ? 'Confermato' : 'Annullato',
    `€${order.totalAmount.toFixed(2)}`,
    order.notes || 'N/A'
  ]);

  doc.autoTable({
    startY: yPos,
    head: [tableColumns],
    body: tableRows,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [74, 144, 226],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      2: { // Status column
        cellRenderer: (data: any) => {
          const status = data.cell.text[0];
          let color = [0, 0, 0]; // default black
          if (status === 'Confermato') color = [34, 139, 34];
          else if (status === 'Annullato') color = [220, 38, 27];
          else if (status === 'In Attesa') color = [255, 140, 0];
          
          return { textColor: color };
        }
      }
    }
  });

  doc.save(`ordini-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Recipes as PDF
export const exportRecipesToPDF = (recipes: Recipe[], products: Product[]) => {
  const doc = new jsPDF();
  let yPos = setupPDFHeader(doc, "Lista Ricette");

  // Create detailed recipe data
  const recipeData = recipes.map(recipe => {
    const totalCost = recipe.ingredients.reduce((sum, ingredient) => {
      const product = products.find(p => p.id === ingredient.productId);
      return sum + (ingredient.quantity * (product?.pricePerUnit || 0));
    }, 0);

    return {
      name: recipe.name,
      ingredientsCount: recipe.ingredients.length,
      totalCost: totalCost,
      ingredients: recipe.ingredients.map(ingredient => {
        const product = products.find(p => p.id === ingredient.productId);
        return {
          name: product?.name || 'Prodotto sconosciuto',
          quantity: ingredient.quantity,
          unit: product?.unit || '',
          cost: ingredient.quantity * (product?.pricePerUnit || 0)
        };
      })
    };
  });

  const tableColumns = ['Nome Ricetta', 'Ingredienti', 'Costo Totale'];
  
  const tableRows = recipeData.map(recipe => [
    recipe.name,
    recipe.ingredientsCount.toString(),
    `€${recipe.totalCost.toFixed(2)}`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [tableColumns],
    body: tableRows,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [74, 144, 226],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save(`ricette-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Dishes as PDF
export const exportDishesToPDF = (dishes: Dish[], products: Product[]) => {
  const doc = new jsPDF();
  let yPos = setupPDFHeader(doc, "Lista Piatti");

  const tableColumns = ['Nome Piatto', 'Prezzo Vendita', 'Costo Ingredienti', 'Food Cost %', 'Venduti'];
  
  const tableRows = dishes.map(dish => [
    dish.name,
    `€${dish.sellingPrice.toFixed(2)}`,
    `€${dish.totalCost.toFixed(2)}`,
    `${dish.foodCost.toFixed(1)}%`,
    (dish.sold || 0).toString()
  ]);

  doc.autoTable({
    startY: yPos,
    head: [tableColumns],
    body: tableRows,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [74, 144, 226],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      3: { // Food Cost % column
        cellRenderer: (data: any) => {
          const foodCost = parseFloat(data.cell.text[0].replace('%', ''));
          let color = [0, 0, 0]; // default black
          if (foodCost > 35) color = [220, 38, 27]; // red if > 35%
          else if (foodCost > 30) color = [255, 140, 0]; // orange if > 30%
          else color = [34, 139, 34]; // green if <= 30%
          
          return { textColor: color };
        }
      }
    }
  });

  doc.save(`piatti-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Waste as PDF
export const exportWasteToPDF = (waste: Waste[], products: Product[]) => {
  const doc = new jsPDF();
  let yPos = setupPDFHeader(doc, "Registro Sprechi");

  // Calculate total waste cost
  const totalWasteCost = waste.reduce((sum, w) => {
    const product = products.find(p => p.id === w.productId);
    return sum + (w.quantity * (product?.pricePerUnit || 0));
  }, 0);

  // Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RIEPILOGO SPRECHI", 14, yPos);
  yPos += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Totale registrazioni: ${waste.length}`, 14, yPos);
  doc.text(`Valore totale sprechi: €${totalWasteCost.toFixed(2)}`, 14, yPos + 6);
  yPos += 20;

  const tableColumns = ['Data', 'Prodotto', 'Quantità', 'Motivo', 'Costo'];
  
  const tableRows = waste.map(w => {
    const product = products.find(p => p.id === w.productId);
    const cost = w.quantity * (product?.pricePerUnit || 0);
    
    return [
      new Date(w.wasteDate).toLocaleDateString('it-IT'),
      product?.name || 'Prodotto sconosciuto',
      `${w.quantity.toFixed(2)} ${product?.unit || ''}`,
      w.reason || 'N/A',
      `€${cost.toFixed(2)}`
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [tableColumns],
    body: tableRows,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [220, 38, 27], // Red theme for waste
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save(`sprechi-${new Date().toISOString().split('T')[0]}.pdf`);
};