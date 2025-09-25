var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/email.ts
var email_exports = {};
__export(email_exports, {
  generateOrderEmailTemplate: () => generateOrderEmailTemplate,
  sendEmail: () => sendEmail,
  sendOrderEmail: () => sendOrderEmail
});
import sgMail from "@sendgrid/mail";
async function sendEmail(params) {
  try {
    const emailData = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || "",
      html: params.html || ""
    };
    if (params.replyTo) {
      emailData.replyTo = params.replyTo;
    }
    await sgMail.send(emailData);
    console.log(`Email inviata con successo a ${params.to}`);
    return true;
  } catch (error) {
    console.error("Errore invio email SendGrid:", error);
    if (error.response && error.response.body && error.response.body.errors) {
      console.error("Dettagli errore SendGrid:", JSON.stringify(error.response.body.errors, null, 2));
    }
    return false;
  }
}
function generateOrderEmailTemplate(order, supplierEmail) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderDate = new Date(order.orderDate).toLocaleDateString("it-IT");
  const itemsHtml = order.items.map((item) => `
    <tr style="border-bottom: 1px solid #e0e0e0;">
      <td style="padding: 12px; border-right: 1px solid #e0e0e0;">${item.productId}</td>
      <td style="padding: 12px; border-right: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-right: 1px solid #e0e0e0; text-align: right;">\u20AC${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 12px; text-align: right; font-weight: bold;">\u20AC${item.totalPrice.toFixed(2)}</td>
    </tr>
  `).join("");
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ordine FoodyFlow - ${order.id}</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">\u{1F37D}\uFE0F FoodyFlow</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Sistema di Gestione Ristorante</p>
        </div>

        <!-- Contenuto principale -->
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Nuovo Ordine</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0; font-size: 18px;">Dettagli Ordine</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6c757d;">Numero Ordine:</td>
                <td style="padding: 8px 0; color: #333;">${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6c757d;">Data Ordine:</td>
                <td style="padding: 8px 0; color: #333;">${orderDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6c757d;">Fornitore:</td>
                <td style="padding: 8px 0; color: #333;">${order.supplier}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6c757d;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: #28a745; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold;">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
              </tr>
              ${order.operatorName ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6c757d;">Operatore:</td>
                <td style="padding: 8px 0; color: #333;">${order.operatorName}</td>
              </tr>
              ` : ""}
            </table>
          </div>

          <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">Prodotti Ordinati</h3>
          
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background-color: #343a40; color: white;">
                <th style="padding: 15px; text-align: left; font-weight: bold;">Prodotto</th>
                <th style="padding: 15px; text-align: center; font-weight: bold;">Quantit\xE0</th>
                <th style="padding: 15px; text-align: right; font-weight: bold;">Prezzo Unitario</th>
                <th style="padding: 15px; text-align: right; font-weight: bold;">Totale</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
              <div style="margin-bottom: 10px;">
                <span style="font-size: 16px; color: #6c757d;">Totale Articoli: </span>
                <span style="font-size: 16px; font-weight: bold; color: #333;">${totalItems}</span>
              </div>
              <div>
                <span style="font-size: 20px; color: #28a745; font-weight: bold;">Totale Ordine: \u20AC${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          ${order.notes ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
            <h4 style="margin-top: 0; color: #856404; font-size: 16px;">\u{1F4DD} Note:</h4>
            <p style="margin-bottom: 0; color: #856404; line-height: 1.4;">${order.notes}</p>
          </div>
          ` : ""}

          <div style="margin-top: 30px; padding: 20px; background-color: #e9f7ef; border-radius: 6px; text-align: center;">
            <p style="margin: 0; color: #27ae60; font-weight: bold; font-size: 16px;">
              Grazie per la collaborazione! \u{1F91D}
            </p>
            <p style="margin: 10px 0 0 0; color: #27ae60; font-size: 14px;">
              Per qualsiasi domanda, non esitate a contattarci.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #343a40; padding: 20px; text-align: center;">
          <p style="color: #adb5bd; margin: 0; font-size: 14px;">
            Questa email \xE8 stata generata automaticamente da FoodyFlow
          </p>
          <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 12px;">
            Sistema di Gestione Ristorante - ${(/* @__PURE__ */ new Date()).getFullYear()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
async function sendOrderEmail(order, supplierEmail, fromEmail = "ordini@foodyflow.it", replyToEmail = "ordini@foodyflow.it") {
  if (!supplierEmail || !supplierEmail.includes("@")) {
    console.error("Email fornitore non valida:", supplierEmail);
    return false;
  }
  const subject = `Nuovo Ordine FoodyFlow #${order.id} - ${order.supplier}`;
  const html = generateOrderEmailTemplate(order, supplierEmail);
  const text2 = `
Nuovo Ordine FoodyFlow

Numero Ordine: ${order.id}
Fornitore: ${order.supplier}
Data: ${new Date(order.orderDate).toLocaleDateString("it-IT")}
Totale: \u20AC${order.totalAmount.toFixed(2)}

Prodotti:
${order.items.map((item) => `- ${item.productId}: ${item.quantity} x \u20AC${item.unitPrice.toFixed(2)} = \u20AC${item.totalPrice.toFixed(2)}`).join("\n")}

${order.notes ? `Note: ${order.notes}` : ""}

Grazie per la collaborazione!
FoodyFlow Team

---
Per rispondere a questo ordine, rispondi a: ${replyToEmail}
  `;
  return await sendEmail({
    to: supplierEmail,
    from: fromEmail,
    replyTo: replyToEmail,
    subject,
    text: text2,
    html
  });
}
var apiKey;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY environment variable must be set");
    }
    sgMail.setApiKey(apiKey);
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, json, timestamp, boolean, uniqueIndex, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var recipeIngredientSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  cost: z.number().min(0),
  weightAdjustment: z.number().min(-100).max(1e3).default(0)
  // Peso +/- percentage for this ingredient
});
var dishIngredientSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("product"),
    productId: z.string(),
    quantity: z.number().min(0),
    cost: z.number().min(0)
  }),
  z.object({
    type: z.literal("recipe"),
    recipeId: z.string(),
    quantity: z.number().min(0),
    cost: z.number().min(0)
  })
]);
var suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  name: text("name").notNull(),
  supplierId: varchar("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  // Keep legacy fields for backward compatibility during migration
  supplier: text("supplier"),
  supplierEmail: text("supplier_email"),
  waste: real("waste").notNull().default(0),
  notes: text("notes"),
  quantity: real("quantity").notNull(),
  unit: varchar("unit").notNull(),
  // kg, l, pezzo
  pricePerUnit: real("price_per_unit").notNull(),
  effectivePricePerUnit: real("effective_price_per_unit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ingredients: json("ingredients").$type().notNull(),
  weightAdjustment: real("weight_adjustment").notNull().default(0),
  // Peso +/- percentage
  totalCost: real("total_cost").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dishes = pgTable("dishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ingredients: json("ingredients").$type().notNull(),
  totalCost: real("total_cost").notNull(),
  sellingPrice: real("selling_price").notNull(),
  netPrice: real("net_price").notNull(),
  foodCost: real("food_cost").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var waste = pgTable("waste", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: real("quantity").notNull(),
  cost: real("cost").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var personalMeals = pgTable("personal_meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dishId: varchar("dish_id").notNull().references(() => dishes.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  cost: real("cost").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dishId: varchar("dish_id").notNull().references(() => dishes.id, { onDelete: "cascade" }),
  dishName: text("dish_name").notNull(),
  quantitySold: integer("quantity_sold").notNull(),
  unitCost: real("unit_cost").notNull(),
  // Costo materie prime per singolo piatto
  unitRevenue: real("unit_revenue").notNull(),
  // Ricavo netto per singolo piatto
  totalCost: real("total_cost").notNull(),
  // unitCost * quantitySold
  totalRevenue: real("total_revenue").notNull(),
  // unitRevenue * quantitySold
  saleDate: text("sale_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0)
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplier: text("supplier").notNull(),
  orderDate: text("order_date").notNull(),
  items: json("items").$type().notNull(),
  totalAmount: real("total_amount").notNull(),
  status: varchar("status").notNull().default("pending"),
  // pending, confirmed, cancelled
  notes: text("notes"),
  operatorName: text("operator_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  movementType: varchar("movement_type").notNull(),
  // 'in' | 'out'
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price"),
  totalCost: real("total_cost"),
  source: varchar("source").notNull(),
  // 'order', 'sale', 'waste', 'adjustment'
  sourceId: varchar("source_id"),
  // ID dell'ordine, vendita, etc.
  movementDate: text("movement_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var inventorySnapshots = pgTable("inventory_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  snapshotDate: text("snapshot_date").notNull(),
  initialQuantity: real("initial_quantity").notNull(),
  finalQuantity: real("final_quantity").notNull(),
  theoreticalQuantity: real("theoretical_quantity"),
  variance: real("variance"),
  // differenza tra teorico e finale
  createdAt: timestamp("created_at").defaultNow()
});
var editableInventory = pgTable("editable_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().unique().references(() => products.id, { onDelete: "cascade" }),
  initialQuantity: real("initial_quantity").notNull().default(0),
  finalQuantity: real("final_quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  name: z.string().min(1, "Nome fornitore richiesto"),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional()
});
var updateSupplierSchema = z.object({
  name: z.string().min(1, "Nome fornitore richiesto").optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional()
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  effectivePricePerUnit: true
  // Calculated automatically by backend
}).extend({
  waste: z.number().min(0).max(100).default(0),
  quantity: z.number().min(0),
  pricePerUnit: z.number().min(0),
  unit: z.enum(["kg", "l", "pezzo"]),
  supplierId: z.string().optional().or(z.literal("")),
  // Keep legacy fields for backward compatibility
  supplierEmail: z.string().email().optional().or(z.literal(""))
});
var insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  ingredients: z.array(recipeIngredientSchema),
  weightAdjustment: z.number().min(-99.9, "Weight adjustment cannot be -100% or lower").max(500, "Weight adjustment cannot exceed 500%").default(0),
  // Peso +/- percentage (-99.9% to +500%)
  totalCost: z.number().min(0)
});
var insertDishSchema = createInsertSchema(dishes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  ingredients: z.array(dishIngredientSchema),
  totalCost: z.number().min(0),
  sellingPrice: z.number().min(0),
  netPrice: z.number().min(0),
  foodCost: z.number().min(0)
});
var insertWasteSchema = createInsertSchema(waste).omit({
  id: true,
  createdAt: true
}).extend({
  quantity: z.number().min(0),
  cost: z.number().min(0)
});
var insertPersonalMealSchema = createInsertSchema(personalMeals).omit({
  id: true,
  createdAt: true
}).extend({
  quantity: z.number().min(0).default(1),
  cost: z.number().min(0)
});
var insertSalesSchema = createInsertSchema(sales).omit({
  id: true,
  totalCost: true,
  // Calculated automatically
  totalRevenue: true,
  // Calculated automatically
  createdAt: true,
  updatedAt: true
}).extend({
  dishName: z.string().min(1),
  quantitySold: z.number().min(1),
  unitCost: z.number().min(0),
  unitRevenue: z.number().min(0),
  saleDate: z.string()
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  items: z.array(orderItemSchema),
  totalAmount: z.number().min(0),
  status: z.enum(["pending", "confirmed", "cancelled", "pendente"]).default("pending")
});
var insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true
}).extend({
  movementType: z.enum(["in", "out"]),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  source: z.enum(["order", "sale", "waste", "personal_meal", "adjustment"])
});
var insertInventorySnapshotSchema = createInsertSchema(inventorySnapshots).omit({
  id: true,
  createdAt: true
}).extend({
  initialQuantity: z.number().min(0),
  finalQuantity: z.number().min(0),
  theoreticalQuantity: z.number().min(0).optional(),
  variance: z.number().optional()
});
var insertEditableInventorySchema = createInsertSchema(editableInventory).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
}).extend({
  initialQuantity: z.number().min(0),
  finalQuantity: z.number().min(0)
});
var updateProductSchema = insertProductSchema.partial().omit({
  // Explicitly omit immutable fields that should never be updated
}).extend({
  // Allow optional updates but maintain validation
  waste: z.number().min(0).max(100).optional(),
  quantity: z.number().min(0).optional(),
  pricePerUnit: z.number().min(0).optional(),
  unit: z.enum(["kg", "l", "pezzo"]).optional(),
  supplierEmail: z.string().email().optional().or(z.literal("")).optional()
});
var updateRecipeSchema = z.object({
  name: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).optional(),
  weightAdjustment: z.number().min(-99.9, "Weight adjustment cannot be -100% or lower").max(500, "Weight adjustment cannot exceed 500%").optional(),
  // Peso +/- percentage
  totalCost: z.number().min(0).optional()
});
var updateDishSchema = z.object({
  name: z.string().optional(),
  ingredients: z.array(dishIngredientSchema).optional(),
  totalCost: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  netPrice: z.number().min(0).optional(),
  foodCost: z.number().min(0).optional()
});
var updateSalesSchema = z.object({
  dishName: z.string().min(1).optional(),
  quantitySold: z.number().min(1).optional(),
  unitCost: z.number().min(0).optional(),
  unitRevenue: z.number().min(0).optional(),
  saleDate: z.string().optional(),
  notes: z.string().optional()
});
var updateOrderSchema = z.object({
  supplier: z.string().optional(),
  orderDate: z.string().optional(),
  items: z.array(orderItemSchema).optional(),
  totalAmount: z.number().min(0).optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "pendente"]).optional(),
  notes: z.string().optional(),
  operatorName: z.string().optional()
});
var updateStockMovementSchema = z.object({
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  movementDate: z.string().optional(),
  notes: z.string().optional()
});
var updateInventorySnapshotSchema = z.object({
  snapshotDate: z.string().optional(),
  initialQuantity: z.number().min(0).optional(),
  finalQuantity: z.number().min(0).optional(),
  theoreticalQuantity: z.number().min(0).optional(),
  variance: z.number().optional()
});
var updateEditableInventorySchema = z.object({
  initialQuantity: z.number().min(0).optional(),
  finalQuantity: z.number().min(0).optional(),
  notes: z.string().optional()
});
var upsertEditableInventorySchema = z.object({
  productId: z.string(),
  initialQuantity: z.number().min(0),
  finalQuantity: z.number().min(0),
  notes: z.string().optional()
});
var budgetEntries = pgTable("budget_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  // Format: YYYY-MM-DD
  year: integer("year").notNull(),
  // 2026, 2025, etc.
  month: integer("month").notNull(),
  // 1-12
  day: integer("day").notNull(),
  // 1-31
  copertoMedio: real("coperto_medio"),
  // Prezzo medio per coperto
  coperti: integer("coperti"),
  // Numero di coperti previsti
  budgetRevenue: real("budget_revenue"),
  // Budget ricavi (calcolato: coperti * copertoMedio)
  budgetDelivery: real("budget_delivery"),
  // Budget delivery
  actualRevenue: real("actual_revenue"),
  // Incasso reale (per confronti)
  actualDelivery: real("actual_delivery"),
  // Delivery reale (per confronti)
  consuntivo: real("consuntivo"),
  // Consuntivo 2026 (budget_revenue + budget_delivery)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertBudgetEntrySchema = createInsertSchema(budgetEntries, {
  date: z.string().min(1),
  year: z.number().min(2020).max(2050),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  copertoMedio: z.number().min(0).optional(),
  coperti: z.number().min(0).optional(),
  budgetRevenue: z.number().min(0).optional(),
  budgetDelivery: z.number().min(0).optional(),
  actualRevenue: z.number().min(0).optional(),
  actualDelivery: z.number().min(0).optional(),
  consuntivo: z.number().min(0).optional(),
  notes: z.string().optional()
}).omit({ id: true, createdAt: true, updatedAt: true });
var updateBudgetEntrySchema = z.object({
  copertoMedio: z.number().min(0).optional(),
  coperti: z.number().min(0).optional(),
  budgetRevenue: z.number().min(0).optional(),
  budgetDelivery: z.number().min(0).optional(),
  actualRevenue: z.number().min(0).optional(),
  actualDelivery: z.number().min(0).optional(),
  consuntivo: z.number().min(0).optional(),
  notes: z.string().optional()
});
var economicParameters = pgTable("economic_parameters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  // 2026, 2025, etc.
  month: integer("month").notNull(),
  // 1-12
  // Target percentages (editable) - DEPRECATED: ora si calcola da budget€ / corrispettivi
  materieFirstePercent: real("materie_prime_percent").default(22.1),
  // Consumi materie prime %
  acquistiVarPercent: real("acquisti_vari_percent").default(3),
  // Acquisti vari %
  // Budget amounts for materie prime and acquisti vari (NEW)
  materieFirsteBudget: real("materie_prime_budget").default(0),
  // Consumi materie prime €
  acquistiVarBudget: real("acquisti_vari_budget").default(0),
  // Acquisti vari €
  // Budget amounts (editable)
  locazioniBudget: real("locazioni_budget").default(0),
  // Locazioni locali €
  personaleBudget: real("personale_budget").default(0),
  // Costi del personale €
  utenzeBudget: real("utenze_budget").default(0),
  // Utenze €
  manutenzionibudget: real("manutenzioni_budget").default(0),
  // Manutenzioni €
  noleggibudget: real("noleggi_budget").default(0),
  // Noleggi e Leasing €
  prestazioniTerziBudget: real("prestazioni_terzi_budget").default(0),
  // Prestazioni di terzi €
  consulenzeBudget: real("consulenze_budget").default(0),
  // Consulenze e compensi a terzi €
  marketingBudget: real("marketing_budget").default(0),
  // Marketing €
  deliveryBudget: real("delivery_budget").default(0),
  // Delivery €
  trasferteBudget: real("trasferte_budget").default(0),
  // Trasferte e viaggi €
  assicurazioniBudget: real("assicurazioni_budget").default(0),
  // Assicurazioni €
  speseBancarieBudget: real("spese_bancarie_budget").default(0),
  // Spese bancarie €
  // Consuntivo amounts (editable)
  materieFirsteConsuntivo: real("materie_prime_consuntivo").default(0),
  // Consumi materie prime consuntivo €
  acquistiVarConsuntivo: real("acquisti_vari_consuntivo").default(0),
  // Acquisti vari consuntivo €
  locazioniConsuntivo: real("locazioni_consuntivo").default(0),
  // Locazioni locali consuntivo €
  personaleConsuntivo: real("personale_consuntivo").default(0),
  // Costi del personale consuntivo €
  utenzeConsuntivo: real("utenze_consuntivo").default(0),
  // Utenze consuntivo €
  manutenzioniConsuntivo: real("manutenzioni_consuntivo").default(0),
  // Manutenzioni consuntivo €
  noleggiConsuntivo: real("noleggi_consuntivo").default(0),
  // Noleggi e Leasing consuntivo €
  prestazioniTerziConsuntivo: real("prestazioni_terzi_consuntivo").default(0),
  // Prestazioni di terzi consuntivo €
  consulenzeConsuntivo: real("consulenze_consuntivo").default(0),
  // Consulenze e compensi a terzi consuntivo €
  marketingConsuntivo: real("marketing_consuntivo").default(0),
  // Marketing consuntivo €
  deliveryConsuntivo: real("delivery_consuntivo").default(0),
  // Delivery consuntivo €
  trasferteConsuntivo: real("trasferte_consuntivo").default(0),
  // Trasferte e viaggi consuntivo €
  assicurazioniConsuntivo: real("assicurazioni_consuntivo").default(0),
  // Assicurazioni consuntivo €
  speseBancarieConsuntivo: real("spese_bancarie_consuntivo").default(0),
  // Spese bancarie consuntivo €
  // Consuntivo percentages (new for bidirectional editing)
  materieFirsteConsuntivoPercent: real("materie_prime_consuntivo_percent").default(0),
  // Consumi materie prime consuntivo %
  acquistiVarConsuntivoPercent: real("acquisti_vari_consuntivo_percent").default(0),
  // Acquisti vari consuntivo %
  locazioniConsuntivoPercent: real("locazioni_consuntivo_percent").default(0),
  // Locazioni locali consuntivo %
  personaleConsuntivoPercent: real("personale_consuntivo_percent").default(0),
  // Costi del personale consuntivo %
  utenzeConsuntivoPercent: real("utenze_consuntivo_percent").default(0),
  // Utenze consuntivo %
  manutenzioniConsuntivoPercent: real("manutenzioni_consuntivo_percent").default(0),
  // Manutenzioni consuntivo %
  noleggiConsuntivoPercent: real("noleggi_consuntivo_percent").default(0),
  // Noleggi e Leasing consuntivo %
  prestazioniTerziConsuntivoPercent: real("prestazioni_terzi_consuntivo_percent").default(0),
  // Prestazioni di terzi consuntivo %
  consulenzeConsuntivoPercent: real("consulenze_consuntivo_percent").default(0),
  // Consulenze e compensi a terzi consuntivo %
  marketingConsuntivoPercent: real("marketing_consuntivo_percent").default(0),
  // Marketing consuntivo %
  deliveryConsuntivoPercent: real("delivery_consuntivo_percent").default(0),
  // Delivery consuntivo %
  trasferteConsuntivoPercent: real("trasferte_consuntivo_percent").default(0),
  // Trasferte e viaggi consuntivo %
  assicurazioniConsuntivoPercent: real("assicurazioni_consuntivo_percent").default(0),
  // Assicurazioni consuntivo %
  speseBancarieConsuntivoPercent: real("spese_bancarie_consuntivo_percent").default(0),
  // Spese bancarie consuntivo %
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    yearMonthIdx: uniqueIndex("economic_parameters_year_month_idx").on(table.year, table.month)
  };
});
var insertEconomicParametersSchema = createInsertSchema(economicParameters, {
  year: z.number().min(2020).max(2050),
  month: z.number().min(1).max(12),
  materieFirstePercent: z.number().min(0).optional(),
  acquistiVarPercent: z.number().min(0).optional(),
  locazioniBudget: z.number().min(0).optional(),
  personaleBudget: z.number().min(0).optional(),
  utenzeBudget: z.number().min(0).optional(),
  manutenzionibudget: z.number().min(0).optional(),
  noleggibudget: z.number().min(0).optional(),
  prestazioniTerziBudget: z.number().min(0).optional(),
  consulenzeBudget: z.number().min(0).optional(),
  marketingBudget: z.number().min(0).optional(),
  deliveryBudget: z.number().min(0).optional(),
  trasferteBudget: z.number().min(0).optional(),
  assicurazioniBudget: z.number().min(0).optional(),
  speseBancarieBudget: z.number().min(0).optional(),
  acquistiVarConsuntivo: z.number().min(0).optional(),
  locazioniConsuntivo: z.number().min(0).optional(),
  personaleConsuntivo: z.number().min(0).optional(),
  utenzeConsuntivo: z.number().min(0).optional(),
  manutenzioniConsuntivo: z.number().min(0).optional(),
  noleggiConsuntivo: z.number().min(0).optional(),
  prestazioniTerziConsuntivo: z.number().min(0).optional(),
  consulenzeConsuntivo: z.number().min(0).optional(),
  marketingConsuntivo: z.number().min(0).optional(),
  deliveryConsuntivo: z.number().min(0).optional(),
  trasferteConsuntivo: z.number().min(0).optional(),
  assicurazioniConsuntivo: z.number().min(0).optional(),
  speseBancarieConsuntivo: z.number().min(0).optional(),
  // Consuntivo percentages
  materieFirsteConsuntivoPercent: z.number().min(0).optional(),
  acquistiVarConsuntivoPercent: z.number().min(0).optional(),
  locazioniConsuntivoPercent: z.number().min(0).optional(),
  personaleConsuntivoPercent: z.number().min(0).optional(),
  utenzeConsuntivoPercent: z.number().min(0).optional(),
  manutenzioniConsuntivoPercent: z.number().min(0).optional(),
  noleggiConsuntivoPercent: z.number().min(0).optional(),
  prestazioniTerziConsuntivoPercent: z.number().min(0).optional(),
  consulenzeConsuntivoPercent: z.number().min(0).optional(),
  marketingConsuntivoPercent: z.number().min(0).optional(),
  deliveryConsuntivoPercent: z.number().min(0).optional(),
  trasferteConsuntivoPercent: z.number().min(0).optional(),
  assicurazioniConsuntivoPercent: z.number().min(0).optional(),
  speseBancarieConsuntivoPercent: z.number().min(0).optional()
}).omit({ id: true, createdAt: true });
var updateEconomicParametersSchema = z.object({
  materieFirstePercent: z.number().min(0).optional(),
  materieFirsteBudget: z.number().min(0).optional(),
  // Consumi materie prime Budget €
  acquistiVarPercent: z.number().min(0).optional(),
  acquistiVarBudget: z.number().min(0).optional(),
  // Acquisti vari Budget €
  locazioniBudget: z.number().min(0).optional(),
  personaleBudget: z.number().min(0).optional(),
  utenzeBudget: z.number().min(0).optional(),
  manutenzionibudget: z.number().min(0).optional(),
  noleggibudget: z.number().min(0).optional(),
  prestazioniTerziBudget: z.number().min(0).optional(),
  consulenzeBudget: z.number().min(0).optional(),
  marketingBudget: z.number().min(0).optional(),
  deliveryBudget: z.number().min(0).optional(),
  trasferteBudget: z.number().min(0).optional(),
  assicurazioniBudget: z.number().min(0).optional(),
  speseBancarieBudget: z.number().min(0).optional(),
  acquistiVarConsuntivo: z.number().min(0).optional(),
  locazioniConsuntivo: z.number().min(0).optional(),
  personaleConsuntivo: z.number().min(0).optional(),
  utenzeConsuntivo: z.number().min(0).optional(),
  manutenzioniConsuntivo: z.number().min(0).optional(),
  noleggiConsuntivo: z.number().min(0).optional(),
  prestazioniTerziConsuntivo: z.number().min(0).optional(),
  consulenzeConsuntivo: z.number().min(0).optional(),
  marketingConsuntivo: z.number().min(0).optional(),
  deliveryConsuntivo: z.number().min(0).optional(),
  trasferteConsuntivo: z.number().min(0).optional(),
  assicurazioniConsuntivo: z.number().min(0).optional(),
  speseBancarieConsuntivo: z.number().min(0).optional(),
  // Consuntivo percentages
  materieFirsteConsuntivo: z.number().min(0).optional(),
  // NEW: materie prime consuntivo €
  materieFirsteConsuntivoPercent: z.number().min(0).optional(),
  acquistiVarConsuntivoPercent: z.number().min(0).optional(),
  locazioniConsuntivoPercent: z.number().min(0).optional(),
  personaleConsuntivoPercent: z.number().min(0).optional(),
  utenzeConsuntivoPercent: z.number().min(0).optional(),
  manutenzioniConsuntivoPercent: z.number().min(0).optional(),
  noleggiConsuntivoPercent: z.number().min(0).optional(),
  prestazioniTerziConsuntivoPercent: z.number().min(0).optional(),
  consulenzeConsuntivoPercent: z.number().min(0).optional(),
  marketingConsuntivoPercent: z.number().min(0).optional(),
  deliveryConsuntivoPercent: z.number().min(0).optional(),
  trasferteConsuntivoPercent: z.number().min(0).optional(),
  assicurazioniConsuntivoPercent: z.number().min(0).optional(),
  speseBancarieConsuntivoPercent: z.number().min(0).optional()
});
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Replit Auth fields
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Legacy auth fields (for backwards compatibility)
  username: varchar("username", { length: 255 }).unique(),
  password: text("password"),
  // hashed password - nullable for Replit Auth users
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var selectUserSchema = createInsertSchema(users).omit({
  password: true
  // Never expose password in responses
});

// server/storage.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, and } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import session from "express-session";
import connectPg from "connect-pg-simple";
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool);
var DatabaseStorage = class {
  // Suppliers
  async getSuppliers() {
    return await db.select().from(suppliers);
  }
  async getSupplier(id) {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return result[0];
  }
  async createSupplier(insertSupplier) {
    const result = await db.insert(suppliers).values({
      ...insertSupplier,
      email: insertSupplier.email || null,
      notes: insertSupplier.notes || null
    }).returning();
    return result[0];
  }
  async updateSupplier(id, updates) {
    const sanitizedUpdates = {};
    if (updates.name !== void 0) sanitizedUpdates.name = updates.name;
    if (updates.email !== void 0) sanitizedUpdates.email = updates.email || null;
    if (updates.notes !== void 0) sanitizedUpdates.notes = updates.notes || null;
    sanitizedUpdates.updatedAt = /* @__PURE__ */ new Date();
    const result = await db.update(suppliers).set(sanitizedUpdates).where(eq(suppliers.id, id)).returning();
    return result[0];
  }
  async deleteSupplier(id) {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Products
  async getProducts() {
    return await db.select().from(products);
  }
  async getProduct(id) {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }
  async createProduct(insertProduct) {
    const wastePercentage = insertProduct.waste || 0;
    const effectivePricePerUnit = insertProduct.pricePerUnit / (1 - wastePercentage / 100);
    const result = await db.insert(products).values({
      ...insertProduct,
      supplier: insertProduct.supplier || null,
      notes: insertProduct.notes || null,
      effectivePricePerUnit
    }).returning();
    return result[0];
  }
  async updateProduct(id, updates) {
    const sanitizedUpdates = {};
    if (updates.code !== void 0) sanitizedUpdates.code = updates.code;
    if (updates.name !== void 0) sanitizedUpdates.name = updates.name;
    if (updates.supplier !== void 0) sanitizedUpdates.supplier = updates.supplier;
    if (updates.supplierEmail !== void 0) sanitizedUpdates.supplierEmail = updates.supplierEmail;
    if (updates.waste !== void 0) sanitizedUpdates.waste = updates.waste;
    if (updates.notes !== void 0) sanitizedUpdates.notes = updates.notes;
    if (updates.quantity !== void 0) sanitizedUpdates.quantity = updates.quantity;
    if (updates.unit !== void 0) sanitizedUpdates.unit = updates.unit;
    if (updates.pricePerUnit !== void 0) sanitizedUpdates.pricePerUnit = updates.pricePerUnit;
    if (updates.pricePerUnit !== void 0 || updates.waste !== void 0) {
      const currentProduct = await this.getProduct(id);
      if (!currentProduct) return void 0;
      const newPricePerUnit = updates.pricePerUnit ?? currentProduct.pricePerUnit;
      const newWaste = updates.waste ?? currentProduct.waste;
      sanitizedUpdates.effectivePricePerUnit = newPricePerUnit / (1 - newWaste / 100);
    }
    sanitizedUpdates.updatedAt = /* @__PURE__ */ new Date();
    const result = await db.update(products).set(sanitizedUpdates).where(eq(products.id, id)).returning();
    return result[0];
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Recipes
  async getRecipes() {
    return await db.select().from(recipes);
  }
  async getRecipe(id) {
    const result = await db.select().from(recipes).where(eq(recipes.id, id));
    return result[0];
  }
  async createRecipe(insertRecipe) {
    const result = await db.insert(recipes).values(insertRecipe).returning();
    return result[0];
  }
  async updateRecipe(id, updates) {
    const sanitizedUpdates = {};
    if (updates.name !== void 0) sanitizedUpdates.name = updates.name;
    if (updates.ingredients !== void 0) sanitizedUpdates.ingredients = updates.ingredients;
    if (updates.weightAdjustment !== void 0) sanitizedUpdates.weightAdjustment = updates.weightAdjustment;
    if (updates.totalCost !== void 0) sanitizedUpdates.totalCost = updates.totalCost;
    sanitizedUpdates.updatedAt = /* @__PURE__ */ new Date();
    const result = await db.update(recipes).set(sanitizedUpdates).where(eq(recipes.id, id)).returning();
    return result[0];
  }
  async deleteRecipe(id) {
    const result = await db.delete(recipes).where(eq(recipes.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Dishes
  async getDishes() {
    return await db.select().from(dishes);
  }
  async getDish(id) {
    const result = await db.select().from(dishes).where(eq(dishes.id, id));
    return result[0];
  }
  async createDish(insertDish) {
    const result = await db.insert(dishes).values({
      ...insertDish
    }).returning();
    return result[0];
  }
  async updateDish(id, updates) {
    const sanitizedUpdates = {};
    if (updates.name !== void 0) sanitizedUpdates.name = updates.name;
    if (updates.ingredients !== void 0) sanitizedUpdates.ingredients = updates.ingredients;
    if (updates.totalCost !== void 0) sanitizedUpdates.totalCost = updates.totalCost;
    if (updates.sellingPrice !== void 0) sanitizedUpdates.sellingPrice = updates.sellingPrice;
    if (updates.netPrice !== void 0) sanitizedUpdates.netPrice = updates.netPrice;
    if (updates.foodCost !== void 0) sanitizedUpdates.foodCost = updates.foodCost;
    sanitizedUpdates.updatedAt = /* @__PURE__ */ new Date();
    const result = await db.update(dishes).set(sanitizedUpdates).where(eq(dishes.id, id)).returning();
    return result[0];
  }
  async deleteDish(id) {
    const result = await db.delete(dishes).where(eq(dishes.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Sales (Vendite)
  async getSales() {
    return await db.select().from(sales);
  }
  async getSale(id) {
    const result = await db.select().from(sales).where(eq(sales.id, id));
    return result[0];
  }
  async getSalesByDish(dishId) {
    return await db.select().from(sales).where(eq(sales.dishId, dishId));
  }
  async createSale(insertSale) {
    const result = await db.insert(sales).values({
      ...insertSale,
      totalCost: insertSale.quantitySold * insertSale.unitCost,
      totalRevenue: insertSale.quantitySold * insertSale.unitRevenue,
      notes: insertSale.notes || null
    }).returning();
    return result[0];
  }
  async updateSale(id, updates) {
    const sanitizedUpdates = {};
    if (updates.dishName !== void 0) sanitizedUpdates.dishName = updates.dishName;
    if (updates.quantitySold !== void 0) sanitizedUpdates.quantitySold = updates.quantitySold;
    if (updates.unitCost !== void 0) sanitizedUpdates.unitCost = updates.unitCost;
    if (updates.unitRevenue !== void 0) sanitizedUpdates.unitRevenue = updates.unitRevenue;
    if (updates.saleDate !== void 0) sanitizedUpdates.saleDate = updates.saleDate;
    if (updates.notes !== void 0) sanitizedUpdates.notes = updates.notes;
    if (updates.quantitySold !== void 0 || updates.unitCost !== void 0 || updates.unitRevenue !== void 0) {
      const currentSale = await this.getSale(id);
      if (currentSale) {
        const quantity = updates.quantitySold ?? currentSale.quantitySold;
        const unitCost = updates.unitCost ?? currentSale.unitCost;
        const unitRevenue = updates.unitRevenue ?? currentSale.unitRevenue;
        sanitizedUpdates.totalCost = quantity * unitCost;
        sanitizedUpdates.totalRevenue = quantity * unitRevenue;
      }
    }
    sanitizedUpdates.updatedAt = /* @__PURE__ */ new Date();
    const result = await db.update(sales).set(sanitizedUpdates).where(eq(sales.id, id)).returning();
    return result[0];
  }
  async deleteSale(id) {
    const result = await db.delete(sales).where(eq(sales.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Waste
  async getWaste() {
    return await db.select().from(waste);
  }
  async createWaste(insertWaste) {
    const result = await db.insert(waste).values({
      ...insertWaste,
      notes: insertWaste.notes || null
    }).returning();
    return result[0];
  }
  async deleteWaste(id) {
    const result = await db.delete(waste).where(eq(waste.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Personal Meals
  async getPersonalMeals() {
    return await db.select().from(personalMeals);
  }
  async createPersonalMeal(insertMeal) {
    const result = await db.insert(personalMeals).values({
      ...insertMeal,
      notes: insertMeal.notes || null
    }).returning();
    return result[0];
  }
  async deletePersonalMeal(id) {
    const result = await db.delete(personalMeals).where(eq(personalMeals.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Orders (Ricevimento Merci)
  async getOrders() {
    return await db.select().from(orders);
  }
  async getOrder(id) {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }
  async createOrder(insertOrder) {
    const result = await db.insert(orders).values({
      ...insertOrder,
      notes: insertOrder.notes || null,
      operatorName: insertOrder.operatorName || null
    }).returning();
    return result[0];
  }
  async updateOrder(id, updates) {
    return await db.transaction(async (tx) => {
      const currentOrderResult = await tx.select().from(orders).where(eq(orders.id, id));
      const currentOrder = currentOrderResult[0];
      if (!currentOrder) {
        console.log(`[AUTOMATISMO] Ordine ${id} non trovato`);
        return void 0;
      }
      const sanitizedUpdates = {};
      if (updates.supplier !== void 0) sanitizedUpdates.supplier = updates.supplier;
      if (updates.orderDate !== void 0) sanitizedUpdates.orderDate = updates.orderDate;
      if (updates.items !== void 0) sanitizedUpdates.items = updates.items;
      if (updates.totalAmount !== void 0) sanitizedUpdates.totalAmount = updates.totalAmount;
      if (updates.status !== void 0) sanitizedUpdates.status = updates.status;
      if (updates.notes !== void 0) sanitizedUpdates.notes = updates.notes;
      if (updates.operatorName !== void 0) sanitizedUpdates.operatorName = updates.operatorName;
      sanitizedUpdates.updatedAt = /* @__PURE__ */ new Date();
      const isTransitionToConfirmed = updates.status === "confirmed" && currentOrder.status !== "confirmed";
      if (isTransitionToConfirmed) {
        console.log(`[TRANSAZIONE] Rilevata transizione di stato per ordine ${id}: "${currentOrder.status}" \u2192 "confirmed"`);
        const existingMovements = await tx.select().from(stockMovements).where(and(
          eq(stockMovements.source, "order"),
          eq(stockMovements.sourceId, id)
        ));
        if (existingMovements.length > 0) {
          console.log(`[TRANSAZIONE] \u26A0\uFE0F  SKIP - Esistono gi\xE0 ${existingMovements.length} movimenti per ordine ${id}:`);
          existingMovements.forEach((mov) => {
            console.log(`[TRANSAZIONE]    - ${mov.movementType.toUpperCase()}: ${mov.quantity} x ${mov.productId} (ID: ${mov.id})`);
          });
          const result2 = await tx.update(orders).set(sanitizedUpdates).where(eq(orders.id, id)).returning();
          return result2[0];
        }
        console.log(`[TRANSAZIONE] \u2705 Nessun movimento esistente trovato - procedo con creazione automatica atomica`);
      }
      const result = await tx.update(orders).set(sanitizedUpdates).where(eq(orders.id, id)).returning();
      const updatedOrder = result[0];
      if (isTransitionToConfirmed && updatedOrder) {
        console.log(`[TRANSAZIONE] \u{1F680} Iniziando creazione movimenti IN atomica per ordine ${id}`);
        console.log(`[TRANSAZIONE]    Supplier: ${updatedOrder.supplier}`);
        console.log(`[TRANSAZIONE]    Items: ${updatedOrder.items.length}`);
        console.log(`[TRANSAZIONE]    Totale: \u20AC${updatedOrder.totalAmount}`);
        const createdMovements = [];
        for (let i = 0; i < updatedOrder.items.length; i++) {
          const item = updatedOrder.items[i];
          console.log(`[TRANSAZIONE]    Processando item ${i + 1}/${updatedOrder.items.length}: ${item.quantity} x ${item.productId}`);
          const stockMovementResult = await tx.insert(stockMovements).values({
            productId: item.productId,
            movementType: "in",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalCost: item.totalPrice,
            source: "order",
            sourceId: updatedOrder.id,
            movementDate: updatedOrder.orderDate,
            notes: `Ricevimento automatico da ordine ${updatedOrder.supplier} - ${updatedOrder.operatorName || "Sistema"}`
          }).returning();
          const created = stockMovementResult[0];
          createdMovements.push(created);
          console.log(`[TRANSAZIONE]    \u2705 Creato movimento IN #${i + 1}: ${item.quantity} x ${item.productId} (ID: ${created.id})`);
        }
        console.log(`[TRANSAZIONE] \u{1F389} COMMIT: creati ${createdMovements.length} movimenti atomici per ordine ${id}`);
        console.log(`[TRANSAZIONE]    Riepilogo movimenti:`);
        createdMovements.forEach((mov, idx) => {
          console.log(`[TRANSAZIONE]      ${idx + 1}. ${mov.movementType.toUpperCase()}: ${mov.quantity} x ${mov.productId} = \u20AC${mov.totalCost || "N/A"} (${mov.id})`);
        });
      }
      return updatedOrder;
    });
  }
  async deleteOrder(id) {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Stock Movements (Magazzino In/Out)
  async getStockMovements() {
    return await db.select().from(stockMovements);
  }
  async getStockMovement(id) {
    const result = await db.select().from(stockMovements).where(eq(stockMovements.id, id));
    return result[0];
  }
  async getStockMovementsByProduct(productId) {
    return await db.select().from(stockMovements).where(eq(stockMovements.productId, productId));
  }
  async createStockMovement(insertMovement) {
    const result = await db.insert(stockMovements).values({
      ...insertMovement,
      unitPrice: insertMovement.unitPrice || null,
      totalCost: insertMovement.totalCost || null,
      sourceId: insertMovement.sourceId || null,
      notes: insertMovement.notes || null
    }).returning();
    return result[0];
  }
  async updateStockMovement(id, updates) {
    const sanitizedUpdates = {};
    if (updates.quantity !== void 0) sanitizedUpdates.quantity = updates.quantity;
    if (updates.unitPrice !== void 0) sanitizedUpdates.unitPrice = updates.unitPrice;
    if (updates.totalCost !== void 0) sanitizedUpdates.totalCost = updates.totalCost;
    if (updates.movementDate !== void 0) sanitizedUpdates.movementDate = updates.movementDate;
    if (updates.notes !== void 0) sanitizedUpdates.notes = updates.notes;
    const result = await db.update(stockMovements).set(sanitizedUpdates).where(eq(stockMovements.id, id)).returning();
    return result[0];
  }
  async deleteStockMovement(id) {
    const result = await db.delete(stockMovements).where(eq(stockMovements.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Inventory Snapshots
  async getInventorySnapshots() {
    return await db.select().from(inventorySnapshots);
  }
  async getInventorySnapshot(id) {
    const result = await db.select().from(inventorySnapshots).where(eq(inventorySnapshots.id, id));
    return result[0];
  }
  async getInventorySnapshotsByProduct(productId) {
    return await db.select().from(inventorySnapshots).where(eq(inventorySnapshots.productId, productId));
  }
  async createInventorySnapshot(insertSnapshot) {
    const result = await db.insert(inventorySnapshots).values({
      ...insertSnapshot,
      theoreticalQuantity: insertSnapshot.theoreticalQuantity || null,
      variance: insertSnapshot.variance || null
    }).returning();
    return result[0];
  }
  async updateInventorySnapshot(id, updates) {
    const sanitizedUpdates = {};
    if (updates.snapshotDate !== void 0) sanitizedUpdates.snapshotDate = updates.snapshotDate;
    if (updates.initialQuantity !== void 0) sanitizedUpdates.initialQuantity = updates.initialQuantity;
    if (updates.finalQuantity !== void 0) sanitizedUpdates.finalQuantity = updates.finalQuantity;
    if (updates.theoreticalQuantity !== void 0) sanitizedUpdates.theoreticalQuantity = updates.theoreticalQuantity;
    if (updates.variance !== void 0) sanitizedUpdates.variance = updates.variance;
    const result = await db.update(inventorySnapshots).set(sanitizedUpdates).where(eq(inventorySnapshots.id, id)).returning();
    return result[0];
  }
  async deleteInventorySnapshot(id) {
    const result = await db.delete(inventorySnapshots).where(eq(inventorySnapshots.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Editable Inventory methods
  async getEditableInventory() {
    return await db.select().from(editableInventory);
  }
  async getEditableInventoryByProduct(productId) {
    const result = await db.select().from(editableInventory).where(eq(editableInventory.productId, productId));
    return result[0];
  }
  async createEditableInventory(inventory) {
    const result = await db.insert(editableInventory).values({
      ...inventory,
      notes: inventory.notes || null
    }).returning();
    return result[0];
  }
  async updateEditableInventory(id, updates) {
    const sanitizedUpdates = {};
    if (updates.initialQuantity !== void 0) sanitizedUpdates.initialQuantity = updates.initialQuantity;
    if (updates.finalQuantity !== void 0) sanitizedUpdates.finalQuantity = updates.finalQuantity;
    if (updates.notes !== void 0) sanitizedUpdates.notes = updates.notes;
    sanitizedUpdates.lastUpdated = /* @__PURE__ */ new Date();
    const result = await db.update(editableInventory).set(sanitizedUpdates).where(eq(editableInventory.id, id)).returning();
    return result[0];
  }
  async upsertEditableInventory(inventory) {
    const existingRecord = await this.getEditableInventoryByProduct(inventory.productId);
    if (existingRecord) {
      const updateData = {
        initialQuantity: inventory.initialQuantity,
        finalQuantity: inventory.finalQuantity,
        notes: inventory.notes || `Aggiornato il ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`
      };
      const result = await this.updateEditableInventory(existingRecord.id, updateData);
      if (!result) {
        throw new Error("Failed to update editable inventory record");
      }
      return result;
    } else {
      const insertData = {
        productId: inventory.productId,
        initialQuantity: inventory.initialQuantity,
        finalQuantity: inventory.finalQuantity,
        notes: inventory.notes || `Creato il ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`
      };
      return await this.createEditableInventory(insertData);
    }
  }
  async deleteEditableInventory(id) {
    const result = await db.delete(editableInventory).where(eq(editableInventory.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Budget Entries implementation
  async getBudgetEntries() {
    return await db.select().from(budgetEntries);
  }
  async getBudgetEntry(id) {
    const result = await db.select().from(budgetEntries).where(eq(budgetEntries.id, id));
    return result[0];
  }
  async getBudgetEntriesByMonth(year, month) {
    return await db.select().from(budgetEntries).where(and(eq(budgetEntries.year, year), eq(budgetEntries.month, month)));
  }
  async createBudgetEntry(insertBudgetEntry) {
    const result = await db.insert(budgetEntries).values({
      ...insertBudgetEntry,
      notes: insertBudgetEntry.notes || null
    }).returning();
    return result[0];
  }
  async updateBudgetEntry(id, updates) {
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== void 0)
    );
    if (Object.keys(filteredUpdates).length === 0) {
      return await this.getBudgetEntry(id);
    }
    const result = await db.update(budgetEntries).set({ ...filteredUpdates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(budgetEntries.id, id)).returning();
    return result[0];
  }
  async deleteBudgetEntry(id) {
    const result = await db.delete(budgetEntries).where(eq(budgetEntries.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Economic Parameters implementation
  async getEconomicParameters() {
    return await db.select().from(economicParameters);
  }
  async getEconomicParameter(id) {
    const result = await db.select().from(economicParameters).where(eq(economicParameters.id, id));
    return result[0];
  }
  async getEconomicParametersByMonth(year, month) {
    const result = await db.select().from(economicParameters).where(and(eq(economicParameters.year, year), eq(economicParameters.month, month)));
    return result[0];
  }
  async createEconomicParameters(insertParameters) {
    const result = await db.insert(economicParameters).values({
      ...insertParameters
    }).returning();
    return result[0];
  }
  async updateEconomicParameters(id, updates) {
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== void 0)
    );
    if (Object.keys(filteredUpdates).length === 0) {
      return await this.getEconomicParameter(id);
    }
    const result = await db.update(economicParameters).set(filteredUpdates).where(eq(economicParameters.id, id)).returning();
    return result[0];
  }
  async upsertEconomicParametersByMonth(year, month, updates) {
    const existing = await this.getEconomicParametersByMonth(year, month);
    if (existing) {
      const updated = await this.updateEconomicParameters(existing.id, updates);
      return updated;
    } else {
      const insertData = {
        year,
        month,
        ...updates
      };
      return await this.createEconomicParameters(insertData);
    }
  }
  async deleteEconomicParameters(id) {
    const result = await db.delete(economicParameters).where(eq(economicParameters.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Users authentication methods
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  // (IMPORTANT) upsertUser method is mandatory for Replit Auth  
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Session store initialized in constructor
  sessionStore;
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session2 from "express-session";
import memoize from "memoizee";
import connectPg2 from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg2(session2);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session2({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  const username = claims["email"] ? claims["email"].split("@")[0] : `user_${claims["sub"]?.slice(-8)}`;
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    username
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const claims = tokens.claims();
    await upsertUser(claims);
    const user = claims?.sub ? await storage.getUser(claims.sub) : null;
    if (user) {
      const { password: _, ...safeUser } = user;
      updateUserSession(safeUser, tokens);
      verified(null, safeUser);
    } else {
      verified(new Error("Failed to create/retrieve user"), null);
    }
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}

// server/auth.ts
import passport2 from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session3 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { z as z2 } from "zod";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupTraditionalAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session3(sessionSettings));
  app2.use(passport2.initialize());
  app2.use(passport2.session());
  passport2.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password || !await comparePasswords(password, user.password)) {
        return done(null, false);
      } else {
        const { password: _, ...safeUser } = user;
        return done(null, safeUser);
      }
    })
  );
  passport2.serializeUser((user, done) => done(null, user.id));
  passport2.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    if (user) {
      const { password: _, ...safeUser } = user;
      done(null, safeUser);
    } else {
      done(null, null);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });
      if (validatedData.username) {
        const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
        if (existingUserByUsername) {
          return res.status(400).json({ error: "Username already exists" });
        }
      }
      if (validatedData.email) {
        const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
        if (existingUserByEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      const user = await storage.createUser({
        username: validatedData.username || void 0,
        email: validatedData.email || void 0,
        password: validatedData.password ? await hashPassword(validatedData.password) : void 0,
        isAdmin: false
        // SECURITY: Force false, never trust client
      });
      const { password: _, ...safeUser } = user;
      req.session.regenerate((regenErr) => {
        if (regenErr) return next(regenErr);
        req.login(safeUser, (err) => {
          if (err) return next(err);
          res.status(201).json(safeUser);
        });
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport2.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      req.session.regenerate((regenErr) => {
        if (regenErr) return next(regenErr);
        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          res.status(200).json(user);
        });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/gemini.ts
import { GoogleGenAI } from "@google/genai";
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
async function analyzeRestaurantData(data, query) {
  const prompt = `Sei un esperto consulente di food cost per ristoranti. 
Analizza i seguenti dati del ristorante e rispondi alla domanda in modo pratico e specifico.

Dati del ristorante:
${JSON.stringify(data, null, 2)}

Domanda: ${query}

Fornisci una risposta dettagliata e consigli pratici per migliorare la gestione del ristorante, concentrandoti su food cost, margini e ottimizzazione operativa. Rispondi sempre in italiano.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });
  return response.text || "Mi dispiace, non riesco a elaborare la richiesta al momento.";
}
async function analyzeFoodCostOptimization(foodCostData) {
  try {
    const systemPrompt = `Sei un esperto di food cost management per ristoranti.
Analizza i dati di food cost e fornisci suggerimenti per l'ottimizzazione.
Rispondi con JSON nel formato esatto:
{
  "currentPercentage": numero,
  "targetPercentage": numero, 
  "suggestions": ["suggerimento1", "suggerimento2", "suggerimento3"],
  "priority": "high" | "medium" | "low"
}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            currentPercentage: { type: "number" },
            targetPercentage: { type: "number" },
            suggestions: {
              type: "array",
              items: { type: "string" }
            },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"]
            }
          },
          required: ["currentPercentage", "targetPercentage", "suggestions", "priority"]
        }
      },
      contents: `Analizza questi dati di food cost: ${JSON.stringify(foodCostData)}`
    });
    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Errore analisi food cost:", error);
    return {
      currentPercentage: 0,
      targetPercentage: 30,
      suggestions: ["Verifica i prezzi dei fornitori", "Monitora gli sprechi", "Ottimizza le porzioni"],
      priority: "medium"
    };
  }
}
async function generateMenuSuggestions(dishData, marketTrends = "") {
  const prompt = `Sei un esperto chef e consulente di menu engineering per ristoranti.
    
Basandoti sui seguenti dati dei piatti:
${JSON.stringify(dishData, null, 2)}

E considerando questi trend di mercato: ${marketTrends}

Genera suggerimenti per:
1. Ottimizzazione del menu esistente
2. Nuovi piatti da introdurre
3. Strategie di pricing
4. Combinazioni ingredienti per ridurre i costi

Fornisci una risposta dettagliata e pratica in italiano.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });
  return response.text || "Non riesco a generare suggerimenti al momento.";
}

// server/routes.ts
import { z as z3 } from "zod";
var requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
async function registerRoutes(app2) {
  await setupAuth(app2);
  setupTraditionalAuth(app2);
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app2.get("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const suppliers2 = await storage.getSuppliers();
      res.json(suppliers2);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });
  app2.get("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ error: "Failed to fetch supplier" });
    }
  });
  app2.post("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create supplier" });
    }
  });
  app2.put("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = updateSupplierSchema.parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, validatedData);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update supplier" });
    }
  });
  app2.delete("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteSupplier(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ error: "Failed to delete supplier" });
    }
  });
  app2.get("/api/recipes", async (req, res) => {
    try {
      const recipes2 = await storage.getRecipes();
      res.json(recipes2);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });
  app2.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ error: "Failed to fetch recipe" });
    }
  });
  app2.post("/api/recipes", async (req, res) => {
    try {
      const validatedData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(validatedData);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create recipe" });
    }
  });
  app2.put("/api/recipes/:id", async (req, res) => {
    try {
      const validatedData = updateRecipeSchema.parse(req.body);
      const recipe = await storage.updateRecipe(req.params.id, validatedData);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update recipe" });
    }
  });
  app2.delete("/api/recipes/:id", async (req, res) => {
    try {
      const success = await storage.deleteRecipe(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  });
  app2.get("/api/dishes", async (req, res) => {
    try {
      const dishes2 = await storage.getDishes();
      res.json(dishes2);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      res.status(500).json({ error: "Failed to fetch dishes" });
    }
  });
  app2.get("/api/dishes/:id", async (req, res) => {
    try {
      const dish = await storage.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      console.error("Error fetching dish:", error);
      res.status(500).json({ error: "Failed to fetch dish" });
    }
  });
  app2.post("/api/dishes", async (req, res) => {
    try {
      const validatedData = insertDishSchema.parse(req.body);
      const dish = await storage.createDish(validatedData);
      res.status(201).json(dish);
    } catch (error) {
      console.error("Error creating dish:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create dish" });
    }
  });
  app2.put("/api/dishes/:id", async (req, res) => {
    try {
      const validatedData = updateDishSchema.parse(req.body);
      const dish = await storage.updateDish(req.params.id, validatedData);
      if (!dish) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      console.error("Error updating dish:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update dish" });
    }
  });
  app2.delete("/api/dishes/:id", async (req, res) => {
    try {
      const success = await storage.deleteDish(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting dish:", error);
      res.status(500).json({ error: "Failed to delete dish" });
    }
  });
  app2.get("/api/sales", async (req, res) => {
    try {
      const sales2 = await storage.getSales();
      res.json(sales2);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });
  app2.get("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.getSale(req.params.id);
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      console.error("Error fetching sale:", error);
      res.status(500).json({ error: "Failed to fetch sale" });
    }
  });
  app2.get("/api/sales/dish/:dishId", async (req, res) => {
    try {
      const sales2 = await storage.getSalesByDish(req.params.dishId);
      res.json(sales2);
    } catch (error) {
      console.error("Error fetching sales by dish:", error);
      res.status(500).json({ error: "Failed to fetch sales by dish" });
    }
  });
  app2.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSalesSchema.parse(req.body);
      const saleData = {
        ...validatedData,
        totalCost: validatedData.unitCost * validatedData.quantitySold,
        totalRevenue: validatedData.unitRevenue * validatedData.quantitySold
      };
      const sale = await storage.createSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create sale" });
    }
  });
  app2.put("/api/sales/:id", async (req, res) => {
    try {
      const validatedData = updateSalesSchema.parse(req.body);
      const updateData = { ...validatedData };
      if (validatedData.unitCost !== void 0 && validatedData.quantitySold !== void 0) {
        updateData.totalCost = validatedData.unitCost * validatedData.quantitySold;
      }
      if (validatedData.unitRevenue !== void 0 && validatedData.quantitySold !== void 0) {
        updateData.totalRevenue = validatedData.unitRevenue * validatedData.quantitySold;
      }
      const sale = await storage.updateSale(req.params.id, updateData);
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      console.error("Error updating sale:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update sale" });
    }
  });
  app2.delete("/api/sales/:id", async (req, res) => {
    try {
      const success = await storage.deleteSale(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sale:", error);
      res.status(500).json({ error: "Failed to delete sale" });
    }
  });
  app2.get("/api/waste", async (req, res) => {
    try {
      const waste2 = await storage.getWaste();
      res.json(waste2);
    } catch (error) {
      console.error("Error fetching waste:", error);
      res.status(500).json({ error: "Failed to fetch waste" });
    }
  });
  app2.post("/api/waste", async (req, res) => {
    try {
      const validatedData = insertWasteSchema.parse(req.body);
      const waste2 = await storage.createWaste(validatedData);
      res.status(201).json(waste2);
    } catch (error) {
      console.error("Error creating waste:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create waste" });
    }
  });
  app2.delete("/api/waste/:id", async (req, res) => {
    try {
      const success = await storage.deleteWaste(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Waste record not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting waste:", error);
      res.status(500).json({ error: "Failed to delete waste" });
    }
  });
  app2.get("/api/personal-meals", async (req, res) => {
    try {
      const meals = await storage.getPersonalMeals();
      res.json(meals);
    } catch (error) {
      console.error("Error fetching personal meals:", error);
      res.status(500).json({ error: "Failed to fetch personal meals" });
    }
  });
  app2.post("/api/personal-meals", async (req, res) => {
    try {
      const validatedData = insertPersonalMealSchema.parse(req.body);
      const meal = await storage.createPersonalMeal(validatedData);
      res.status(201).json(meal);
    } catch (error) {
      console.error("Error creating personal meal:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create personal meal" });
    }
  });
  app2.delete("/api/personal-meals/:id", async (req, res) => {
    try {
      const success = await storage.deletePersonalMeal(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Personal meal not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting personal meal:", error);
      res.status(500).json({ error: "Failed to delete personal meal" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const orders2 = await storage.getOrders();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  app2.put("/api/orders/:id", async (req, res) => {
    try {
      const validatedData = updateOrderSchema.parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update order" });
    }
  });
  app2.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const statusSchema = z3.object({
        status: z3.enum(["pending", "confirmed", "cancelled", "pendente"])
      });
      const validatedData = statusSchema.parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  app2.delete("/api/orders/:id", async (req, res) => {
    try {
      const success = await storage.deleteOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });
  app2.post("/api/orders/:id/send-email", async (req, res) => {
    try {
      const { sendOrderEmail: sendOrderEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const products2 = await storage.getProducts();
      const productMap = new Map(products2.map((p) => [p.id, p]));
      const supplierEmails = /* @__PURE__ */ new Set();
      for (const item of order.items) {
        const product = productMap.get(item.productId);
        if (product?.supplierEmail && product.supplierEmail.includes("@")) {
          supplierEmails.add(product.supplierEmail);
        }
      }
      if (supplierEmails.size === 0) {
        return res.status(400).json({
          error: "Nessuna email fornitore trovata",
          message: "Nessuno dei prodotti in questo ordine ha un'email fornitore valida configurata."
        });
      }
      const emailResults = [];
      for (const supplierEmail of supplierEmails) {
        const success = await sendOrderEmail2(order, supplierEmail);
        emailResults.push({
          email: supplierEmail,
          success,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const successCount = emailResults.filter((r) => r.success).length;
      const totalCount = emailResults.length;
      if (successCount === totalCount) {
        res.json({
          success: true,
          message: `Email inviata con successo a ${successCount} fornitore${successCount > 1 ? "i" : ""}`,
          results: emailResults
        });
      } else {
        res.status(207).json({
          success: false,
          message: `${successCount}/${totalCount} email inviate con successo`,
          results: emailResults
        });
      }
    } catch (error) {
      console.error("Error sending order email:", error);
      res.status(500).json({ error: "Failed to send order email" });
    }
  });
  app2.get("/api/stock-movements", async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.json(movements);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      res.status(500).json({ error: "Failed to fetch stock movements" });
    }
  });
  app2.get("/api/stock-movements/product/:productId", async (req, res) => {
    try {
      const movements = await storage.getStockMovementsByProduct(req.params.productId);
      res.json(movements);
    } catch (error) {
      console.error("Error fetching stock movements by product:", error);
      res.status(500).json({ error: "Failed to fetch stock movements by product" });
    }
  });
  app2.get("/api/stock-movements/:id", async (req, res) => {
    try {
      const movement = await storage.getStockMovement(req.params.id);
      if (!movement) {
        return res.status(404).json({ error: "Stock movement not found" });
      }
      res.json(movement);
    } catch (error) {
      console.error("Error fetching stock movement:", error);
      res.status(500).json({ error: "Failed to fetch stock movement" });
    }
  });
  app2.post("/api/stock-movements", async (req, res) => {
    try {
      const validatedData = insertStockMovementSchema.parse(req.body);
      const movement = await storage.createStockMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      console.error("Error creating stock movement:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create stock movement" });
    }
  });
  app2.put("/api/stock-movements/:id", async (req, res) => {
    try {
      const validatedData = updateStockMovementSchema.parse(req.body);
      const movement = await storage.updateStockMovement(req.params.id, validatedData);
      if (!movement) {
        return res.status(404).json({ error: "Stock movement not found" });
      }
      res.json(movement);
    } catch (error) {
      console.error("Error updating stock movement:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update stock movement" });
    }
  });
  app2.delete("/api/stock-movements/:id", async (req, res) => {
    try {
      const success = await storage.deleteStockMovement(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Stock movement not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting stock movement:", error);
      res.status(500).json({ error: "Failed to delete stock movement" });
    }
  });
  app2.get("/api/inventory-snapshots", async (req, res) => {
    try {
      const snapshots = await storage.getInventorySnapshots();
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching inventory snapshots:", error);
      res.status(500).json({ error: "Failed to fetch inventory snapshots" });
    }
  });
  app2.get("/api/inventory-snapshots/product/:productId", async (req, res) => {
    try {
      const snapshots = await storage.getInventorySnapshotsByProduct(req.params.productId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching inventory snapshots by product:", error);
      res.status(500).json({ error: "Failed to fetch inventory snapshots by product" });
    }
  });
  app2.get("/api/inventory-snapshots/:id", async (req, res) => {
    try {
      const snapshot = await storage.getInventorySnapshot(req.params.id);
      if (!snapshot) {
        return res.status(404).json({ error: "Inventory snapshot not found" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error fetching inventory snapshot:", error);
      res.status(500).json({ error: "Failed to fetch inventory snapshot" });
    }
  });
  app2.post("/api/inventory-snapshots", async (req, res) => {
    try {
      const validatedData = insertInventorySnapshotSchema.parse(req.body);
      const snapshot = await storage.createInventorySnapshot(validatedData);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating inventory snapshot:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create inventory snapshot" });
    }
  });
  app2.put("/api/inventory-snapshots/:id", async (req, res) => {
    try {
      const validatedData = updateInventorySnapshotSchema.parse(req.body);
      const snapshot = await storage.updateInventorySnapshot(req.params.id, validatedData);
      if (!snapshot) {
        return res.status(404).json({ error: "Inventory snapshot not found" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error updating inventory snapshot:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update inventory snapshot" });
    }
  });
  app2.delete("/api/inventory-snapshots/:id", async (req, res) => {
    try {
      const success = await storage.deleteInventorySnapshot(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Inventory snapshot not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory snapshot:", error);
      res.status(500).json({ error: "Failed to delete inventory snapshot" });
    }
  });
  app2.get("/api/editable-inventory", async (req, res) => {
    try {
      const inventory = await storage.getEditableInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching editable inventory:", error);
      res.status(500).json({ error: "Failed to fetch editable inventory" });
    }
  });
  app2.get("/api/editable-inventory/product/:productId", async (req, res) => {
    try {
      const inventory = await storage.getEditableInventoryByProduct(req.params.productId);
      if (!inventory) {
        return res.status(404).json({ error: "Editable inventory not found" });
      }
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching editable inventory by product:", error);
      res.status(500).json({ error: "Failed to fetch editable inventory by product" });
    }
  });
  app2.post("/api/editable-inventory", async (req, res) => {
    try {
      const validatedData = insertEditableInventorySchema.parse(req.body);
      const inventory = await storage.createEditableInventory(validatedData);
      res.status(201).json(inventory);
    } catch (error) {
      console.error("Error creating editable inventory:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create editable inventory" });
    }
  });
  app2.put("/api/editable-inventory/:id", async (req, res) => {
    try {
      const validatedData = updateEditableInventorySchema.parse(req.body);
      const inventory = await storage.updateEditableInventory(req.params.id, validatedData);
      if (!inventory) {
        return res.status(404).json({ error: "Editable inventory record not found" });
      }
      res.json(inventory);
    } catch (error) {
      console.error("Error updating editable inventory:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update editable inventory" });
    }
  });
  app2.delete("/api/editable-inventory/:id", async (req, res) => {
    try {
      const success = await storage.deleteEditableInventory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Editable inventory record not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting editable inventory:", error);
      res.status(500).json({ error: "Failed to delete editable inventory" });
    }
  });
  app2.post("/api/editable-inventory/upsert", async (req, res) => {
    try {
      const validatedData = upsertEditableInventorySchema.parse(req.body);
      const inventory = await storage.upsertEditableInventory(validatedData);
      res.json(inventory);
    } catch (error) {
      console.error("Error upserting editable inventory:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to upsert editable inventory" });
    }
  });
  app2.get("/api/budget-entries", async (req, res) => {
    try {
      const budgetEntries2 = await storage.getBudgetEntries();
      res.json(budgetEntries2);
    } catch (error) {
      console.error("Error fetching budget entries:", error);
      res.status(500).json({ error: "Failed to fetch budget entries" });
    }
  });
  app2.get("/api/budget-entries/:id", async (req, res) => {
    try {
      const budgetEntry = await storage.getBudgetEntry(req.params.id);
      if (!budgetEntry) {
        return res.status(404).json({ error: "Budget entry not found" });
      }
      res.json(budgetEntry);
    } catch (error) {
      console.error("Error fetching budget entry:", error);
      res.status(500).json({ error: "Failed to fetch budget entry" });
    }
  });
  app2.get("/api/budget-entries/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const budgetEntries2 = await storage.getBudgetEntriesByMonth(year, month);
      res.json(budgetEntries2);
    } catch (error) {
      console.error("Error fetching budget entries by month:", error);
      res.status(500).json({ error: "Failed to fetch budget entries" });
    }
  });
  app2.post("/api/budget-entries", async (req, res) => {
    try {
      const validatedData = insertBudgetEntrySchema.parse(req.body);
      const budgetEntry = await storage.createBudgetEntry(validatedData);
      res.status(201).json(budgetEntry);
    } catch (error) {
      console.error("Error creating budget entry:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create budget entry" });
    }
  });
  app2.put("/api/budget-entries/:id", async (req, res) => {
    try {
      const validatedData = updateBudgetEntrySchema.parse(req.body);
      const budgetEntry = await storage.updateBudgetEntry(req.params.id, validatedData);
      if (!budgetEntry) {
        return res.status(404).json({ error: "Budget entry not found" });
      }
      res.json(budgetEntry);
    } catch (error) {
      console.error("Error updating budget entry:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update budget entry" });
    }
  });
  app2.delete("/api/budget-entries/:id", async (req, res) => {
    try {
      const success = await storage.deleteBudgetEntry(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Budget entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting budget entry:", error);
      res.status(500).json({ error: "Failed to delete budget entry" });
    }
  });
  app2.get("/api/economic-parameters", async (req, res) => {
    try {
      const parameters = await storage.getEconomicParameters();
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching economic parameters:", error);
      res.status(500).json({ error: "Failed to fetch economic parameters" });
    }
  });
  app2.get("/api/economic-parameters/:id", async (req, res) => {
    try {
      const parameters = await storage.getEconomicParameter(req.params.id);
      if (!parameters) {
        return res.status(404).json({ error: "Economic parameters not found" });
      }
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching economic parameters:", error);
      res.status(500).json({ error: "Failed to fetch economic parameters" });
    }
  });
  app2.get("/api/economic-parameters/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const parameters = await storage.getEconomicParametersByMonth(year, month);
      if (!parameters) {
        return res.status(404).json({ error: "Economic parameters not found for this month" });
      }
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching economic parameters by month:", error);
      res.status(500).json({ error: "Failed to fetch economic parameters" });
    }
  });
  app2.post("/api/economic-parameters", async (req, res) => {
    try {
      const validatedData = insertEconomicParametersSchema.parse(req.body);
      const parameters = await storage.createEconomicParameters(validatedData);
      res.status(201).json(parameters);
    } catch (error) {
      console.error("Error creating economic parameters:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create economic parameters" });
    }
  });
  app2.put("/api/economic-parameters/:id", async (req, res) => {
    try {
      const validatedData = updateEconomicParametersSchema.parse(req.body);
      const parameters = await storage.updateEconomicParameters(req.params.id, validatedData);
      if (!parameters) {
        return res.status(404).json({ error: "Economic parameters not found" });
      }
      res.json(parameters);
    } catch (error) {
      console.error("Error updating economic parameters:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update economic parameters" });
    }
  });
  app2.put("/api/economic-parameters/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const validatedData = updateEconomicParametersSchema.parse(req.body);
      const parameters = await storage.upsertEconomicParametersByMonth(year, month, validatedData);
      res.json(parameters);
    } catch (error) {
      console.error("Error upserting economic parameters:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to upsert economic parameters" });
    }
  });
  app2.delete("/api/economic-parameters/:id", async (req, res) => {
    try {
      const success = await storage.deleteEconomicParameters(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Economic parameters not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting economic parameters:", error);
      res.status(500).json({ error: "Failed to delete economic parameters" });
    }
  });
  app2.get("/api/metrics/food-cost/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const [dishes2, sales2, products2, editableInventory2, stockMovements2] = await Promise.all([
        storage.getDishes(),
        storage.getSales(),
        storage.getProducts(),
        storage.getEditableInventory(),
        storage.getStockMovements()
      ]);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const monthlyStockMovements = stockMovements2.filter((movement) => {
        const movementDate = new Date(movement.movementDate);
        return movementDate >= startDate && movementDate <= endDate;
      });
      const productMap = new Map(products2.map((p) => [p.id, p]));
      const monthlySales = sales2.filter((sale) => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= startDate && saleDate <= endDate;
      });
      const totalFoodSales = monthlySales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
      const totalCostOfSales = monthlySales.reduce((sum, sale) => sum + sale.totalCost, 0);
      const theoreticalFoodCostPercentage = totalFoodSales > 0 ? totalCostOfSales / totalFoodSales * 100 : 0;
      const totaleInizialeM = editableInventory2.reduce((sum, inventory) => {
        const product = productMap.get(inventory.productId);
        return sum + (product ? inventory.initialQuantity * product.pricePerUnit : 0);
      }, 0);
      const totaleInM = monthlyStockMovements.filter((movement) => movement.movementType === "in").reduce((sum, movement) => sum + (movement.totalCost || 0), 0);
      const totaleFinaleM = editableInventory2.reduce((sum, inventory) => {
        const product = productMap.get(inventory.productId);
        return sum + (product ? inventory.finalQuantity * product.pricePerUnit : 0);
      }, 0);
      const totalFoodCost = totaleInizialeM + totaleInM - totaleFinaleM;
      const realFoodCostPercentage = totalFoodSales > 0 ? totalFoodCost / totalFoodSales * 100 : 0;
      const realVsTheoreticalDiff = realFoodCostPercentage - theoreticalFoodCostPercentage;
      res.json({
        year,
        month,
        totalFoodSales,
        totalFoodCost,
        foodCostPercentage: realFoodCostPercentage,
        theoreticalFoodCostPercentage,
        realVsTheoreticalDiff,
        calculatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error calculating food cost metrics:", error);
      res.status(500).json({ error: "Failed to calculate food cost metrics" });
    }
  });
  app2.post("/api/setup-admin", async (req, res) => {
    try {
      const existingAdmin = await storage.getUserByUsername("admin");
      if (existingAdmin) {
        return res.status(409).json({
          error: "Admin user already exists",
          message: "Admin user has already been created"
        });
      }
      const adminData = {
        username: "admin",
        email: "admin@foodyflow.com",
        password: "admin",
        // Will be hashed by auth system
        isAdmin: true
      };
      const validatedData = insertUserSchema.parse(adminData);
      const adminUser = await storage.createUser(validatedData);
      const { password, ...safeUser } = adminUser;
      res.status(201).json({
        success: true,
        message: "Admin user created successfully",
        user: safeUser
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });
  app2.post("/api/ai/analyze", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      const [products2, dishes2, waste2, orders2, budgetEntries2] = await Promise.all([
        storage.getProducts(),
        storage.getDishes(),
        storage.getWaste(),
        storage.getOrders(),
        storage.getBudgetEntries()
        // Anno e mese correnti
      ]);
      const restaurantData = {
        products: products2.slice(0, 10),
        // Limita i dati per non superare i token
        dishes: dishes2.slice(0, 10),
        waste: waste2.slice(0, 5),
        orders: orders2.slice(0, 5),
        budgetEntries: budgetEntries2.slice(0, 5)
      };
      const analysis = await analyzeRestaurantData(restaurantData, query);
      res.json({
        success: true,
        analysis,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Errore analisi AI:", error);
      res.status(500).json({
        error: "Errore nell'analisi AI",
        message: "Riprova pi\xF9 tardi"
      });
    }
  });
  app2.post("/api/ai/food-cost-optimization", async (req, res) => {
    try {
      const [products2, dishes2, waste2] = await Promise.all([
        storage.getProducts(),
        storage.getDishes(),
        storage.getWaste()
      ]);
      const foodCostData = {
        totalProducts: products2.length,
        totalDishes: dishes2.length,
        totalWaste: waste2.length,
        averageProductPrice: products2.reduce((sum, p) => sum + (p.pricePerUnit || 0), 0) / products2.length || 0,
        products: products2.slice(0, 5),
        dishes: dishes2.slice(0, 5),
        waste: waste2.slice(0, 3)
      };
      const optimization = await analyzeFoodCostOptimization(foodCostData);
      res.json({
        success: true,
        optimization,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Errore ottimizzazione food cost:", error);
      res.status(500).json({
        error: "Errore nell'ottimizzazione food cost",
        message: "Riprova pi\xF9 tardi"
      });
    }
  });
  app2.post("/api/ai/menu-suggestions", async (req, res) => {
    try {
      const { marketTrends } = req.body;
      const dishes2 = await storage.getDishes();
      const dishData = dishes2.slice(0, 10);
      const suggestions = await generateMenuSuggestions(dishData, marketTrends || "");
      res.json({
        success: true,
        suggestions,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Errore suggerimenti menu:", error);
      res.status(500).json({
        error: "Errore nei suggerimenti menu",
        message: "Riprova pi\xF9 tardi"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
