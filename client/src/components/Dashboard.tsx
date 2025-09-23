import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ChefHat, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock,
  Calculator
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Types for dashboard data
import type { Product, Dish, Order, StockMovement, EconomicParameters, BudgetEntry, Sales } from "@shared/schema";
import { useSales } from "@/hooks/useApi";

interface DashboardProps {
  products: Product[];
  dishes: Dish[];
  orders: Order[];
  stockMovements: StockMovement[];
  inventorySnapshots: any[];
  editableInventory: any[];
  waste: any[];
  personalMeals: any[];
  onNavigateToSection: (section: string) => void;
}

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string | React.ReactNode;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  status?: "good" | "warning" | "danger";
  onClick?: () => void;
}

function KPICard({ title, value, change, changeLabel, icon, trend, status = "good", onClick }: KPICardProps) {
  const getBadgeVariant = () => {
    // For change/differential: we'll use custom classes, not variants
    if (change !== undefined) {
      return "outline"; // Use outline as base, then override with custom classes
    }
    // For regular status
    switch (status) {
      case "good": return "default";
      case "warning": return "secondary";
      case "danger": return "destructive";
      default: return "default";
    }
  };

  const getChangeClasses = () => {
    if (change === undefined) return "";
    // Negative = green (good), Positive = red (bad)
    return change < 0 
      ? "!bg-green-100 dark:!bg-green-900 !text-green-800 dark:!text-green-200 !border-green-200 dark:!border-green-700"
      : "!bg-red-100 dark:!bg-red-900 !text-red-800 dark:!text-red-200 !border-red-200 dark:!border-red-700";
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    return trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  return (
    <Card 
      className={`hover-elevate ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick}
      data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {change !== undefined && (
            <Badge variant={getBadgeVariant()} className={`flex items-center gap-1 ${getChangeClasses()}`}>
              {getTrendIcon()}
              <span className="text-xs">
                {changeLabel ? changeLabel : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PillarOverviewProps {
  title: string;
  description: string;
  currentValue: string;
  targetValue: string;
  progress: number;
  status: "good" | "warning" | "danger";
  icon: React.ReactNode;
  onExplore: () => void;
  isComingSoon?: boolean;
}

function PillarOverview({ 
  title, 
  description, 
  currentValue, 
  targetValue, 
  progress, 
  status, 
  icon, 
  onExplore,
  isComingSoon = false
}: PillarOverviewProps) {
  const getStatusColor = () => {
    switch (status) {
      case "good": return "text-green-600 dark:text-green-400";
      case "warning": return "text-yellow-600 dark:text-yellow-400";
      case "danger": return "text-red-600 dark:text-red-400";
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "good": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "danger": return "bg-red-500";
    }
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-muted ${getStatusColor()}`}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {isComingSoon && (
          <Badge variant="secondary" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            In Sviluppo
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{currentValue}</div>
            <div className="text-sm text-muted-foreground">Target: {targetValue}</div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getStatusColor()}`}>
              {progress}% del target
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Attuale</span>
            <span>Target</span>
          </div>
        </div>

        <Button 
          onClick={onExplore} 
          className="w-full" 
          variant={isComingSoon ? "outline" : "default"}
          disabled={isComingSoon}
          data-testid={`button-explore-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isComingSoon ? "Disponibile Presto" : `Esplora ${title}`}
        </Button>
      </CardContent>
    </Card>
  );
}

export function Dashboard({ 
  products, 
  dishes, 
  orders, 
  stockMovements, 
  inventorySnapshots,
  editableInventory,
  waste, 
  personalMeals, 
  onNavigateToSection 
}: DashboardProps) {
  // Fetch sales data
  const { data: salesData = [] } = useSales();
  
  // Current period for budget data (using current month and year)
  // Sync with P&L and Budget localStorage values
  const currentYear = (() => {
    const saved = localStorage.getItem('foodyflow-selected-year');
    return saved ? parseInt(saved) : new Date().getFullYear();
  })();
  const currentMonth = (() => {
    const saved = localStorage.getItem('foodyflow-selected-month');
    return saved ? parseInt(saved) : new Date().getMonth() + 1;
  })();

  // Fetch economic parameters for EBITDA calculation
  const { data: ecoParams } = useQuery({
    queryKey: ['/api/economic-parameters', currentYear, currentMonth],
    queryFn: async () => {
      const response = await fetch(`/api/economic-parameters/${currentYear}/${currentMonth}`);
      if (!response.ok) {
        return null; // Return null if not found instead of throwing
      }
      return response.json() as Promise<EconomicParameters>;
    },
    retry: false
  });

  // Query for food cost metrics (use current date for real-time data)
  const currentDate = new Date();
  const actualYear = currentDate.getFullYear();
  const actualMonth = currentDate.getMonth() + 1;
  
  const { data: foodCostMetrics } = useQuery({
    queryKey: ['/api/metrics/food-cost', actualYear, actualMonth]
  });

  // Fetch budget entries for corrispettivi calculation
  const { data: budgetEntries = [] } = useQuery({
    queryKey: ['/api/budget-entries', currentYear, currentMonth],
    queryFn: () => 
      fetch(`/api/budget-entries/${currentYear}/${currentMonth}`)
        .then(res => res.json()) as Promise<BudgetEntry[]>
  });

  // Create product lookup map for performance
  const productMap = useMemo(() => 
    new Map(products.map(p => [p.id, p])), 
    [products]
  );

  // Create sales map by dish ID for performance
  const salesByDish = useMemo(() => {
    const salesMap = new Map<string, { totalQuantity: number; totalRevenue: number; totalCost: number }>();
    
    salesData.forEach(sale => {
      const existing = salesMap.get(sale.dishId) || { totalQuantity: 0, totalRevenue: 0, totalCost: 0 };
      salesMap.set(sale.dishId, {
        totalQuantity: existing.totalQuantity + sale.quantitySold,
        totalRevenue: existing.totalRevenue + sale.totalRevenue,
        totalCost: existing.totalCost + sale.totalCost
      });
    });
    
    return salesMap;
  }, [salesData]);
  
  // Calculate food cost metrics using the new formula: (totale iniziale + totale IN - totale finale)
  const { totalFoodSales, totalFoodCost, foodCostPercentage, theoreticalFoodCostPercentage, realVsTheoreticalDiff } = useMemo(() => {
    // Use sales data from the new sales table instead of dish.sold
    const sales = Array.from(salesByDish.values()).reduce((sum, dishSales) => sum + dishSales.totalRevenue, 0);
    
    // Calculate THEORETICAL food cost (based on recipes)
    const totalCostOfSales = Array.from(salesByDish.values()).reduce((sum, dishSales) => sum + dishSales.totalCost, 0);
    const theoreticalPercentage = sales > 0 ? (totalCostOfSales / sales) * 100 : 0;
    
    // Calculate REAL food cost according to formula: (totale iniziale magazzino + totale IN magazzino - totale finale magazzino)
    // Using data from sezione magazzino (editableInventory + stockMovements)
    
    // 1. Totale iniziale magazzino (from editableInventory)
    const totaleInizialeM = editableInventory.reduce((sum, inventory) => {
      const product = productMap.get(inventory.productId);
      return sum + (product ? inventory.initialQuantity * product.pricePerUnit : 0);
    }, 0);
    
    // 2. Totale IN magazzino (from stockMovements with movementType = 'in')
    const totaleInM = stockMovements
      .filter(movement => movement.movementType === 'in')
      .reduce((sum, movement) => sum + (movement.totalCost || 0), 0);
    
    // 3. Totale finale magazzino (from editableInventory)
    const totaleFinaleM = editableInventory.reduce((sum, inventory) => {
      const product = productMap.get(inventory.productId);
      return sum + (product ? inventory.finalQuantity * product.pricePerUnit : 0);
    }, 0);
    
    // REAL Food cost calculation
    const foodCostValue = totaleInizialeM + totaleInM - totaleFinaleM;
    const realPercentage = sales > 0 ? (foodCostValue / sales) * 100 : 0;
    
    // Calculate differential: Real - Theoretical
    const differential = realPercentage - theoreticalPercentage;
    
    return {
      totalFoodSales: sales,
      totalFoodCost: foodCostValue,
      foodCostPercentage: realPercentage,
      theoreticalFoodCostPercentage: theoreticalPercentage,
      realVsTheoreticalDiff: differential
    };
  }, [dishes, productMap, editableInventory, stockMovements]);
  
  const wasteValue = useMemo(() => 
    waste.reduce((sum, w) => sum + (w.totalCost || 0), 0), 
    [waste]
  );
  
  const personalMealsCost = useMemo(() => 
    personalMeals.reduce((sum, p) => sum + (p.totalCost || 0), 0), 
    [personalMeals]
  );

  // Labour cost impostato a 0 come richiesto dall'utente
  const labourCostPercentage = 0;

  // Calcolo EBITDA dal budget E consuntivo (using same logic as P&L)
  const { ebitdaBudget, ebitdaPercentageBudget, ebitdaPercentageConsuntivo, ebitdaDifference, totalCorrispettivi } = useMemo(() => {
    if (!ecoParams || !foodCostMetrics) {
      return { ebitdaBudget: 0, ebitdaPercentageBudget: 0, ebitdaPercentageConsuntivo: 0, ebitdaDifference: 0, totalCorrispettivi: 0 };
    }

    // Calculate totals exactly like P&L
    const totals = budgetEntries.reduce((acc, entry) => {
      const calculatedBudgetRevenue = (entry.coperti || 0) * (entry.copertoMedio || 0);
      const consuntivo2026 = calculatedBudgetRevenue + (entry.budgetDelivery || 0);
      const consuntivo2025 = (entry.actualRevenue || 0) + (entry.actualDelivery || 0);

      return {
        totalBudget: acc.totalBudget + consuntivo2026,
        totalActualRevenue: acc.totalActualRevenue + (entry.actualRevenue || 0),
        totalActualDelivery: acc.totalActualDelivery + (entry.actualDelivery || 0)
      };
    }, {
      totalBudget: 0,
      totalActualRevenue: 0,
      totalActualDelivery: 0
    });

    const totalCorrispettivi = totals.totalBudget;
    const totalConsuntivoRevenue = totals.totalActualRevenue + totals.totalActualDelivery;
    
    // Use food cost calculated locally
    const foodCostFromAPI = totalFoodCost || 0;
    const foodCostPercent = totalConsuntivoRevenue > 0 ? (foodCostFromAPI / totalConsuntivoRevenue) : 0;

    // Build cost items exactly like P&L to ensure consistency
    const costItems = [
      {
        percent: (ecoParams?.materieFirsteBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.materieFirsteBudget || 0,
        consuntivoValue: foodCostFromAPI, // Use API value like P&L
        consuntivoPercent: foodCostPercent,
      },
      {
        percent: (ecoParams?.acquistiVarBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.acquistiVarBudget || 0,
        consuntivoValue: ecoParams?.acquistiVarConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.acquistiVarConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      // Add all other cost items like P&L
      {
        percent: (ecoParams?.locazioniBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.locazioniBudget || 0,
        consuntivoValue: ecoParams?.locazioniConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.locazioniConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.personaleBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.personaleBudget || 0,
        consuntivoValue: ecoParams?.personaleConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.personaleConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.utenzeBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.utenzeBudget || 0,
        consuntivoValue: ecoParams?.utenzeConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.utenzeConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.manutenzionibudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.manutenzionibudget || 0,
        consuntivoValue: ecoParams?.manutenzioniConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.manutenzioniConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.noleggibudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.noleggibudget || 0,
        consuntivoValue: ecoParams?.noleggiConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.noleggiConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.prestazioniTerziBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.prestazioniTerziBudget || 0,
        consuntivoValue: ecoParams?.prestazioniTerziConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.prestazioniTerziConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.consulenzeBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.consulenzeBudget || 0,
        consuntivoValue: ecoParams?.consulenzeConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.consulenzeConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.marketingBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.marketingBudget || 0,
        consuntivoValue: ecoParams?.marketingConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.marketingConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.deliveryBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.deliveryBudget || 0,
        consuntivoValue: ecoParams?.deliveryConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.deliveryConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.trasferteBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.trasferteBudget || 0,
        consuntivoValue: ecoParams?.trasferteConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.trasferteConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.assicurazioniBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.assicurazioniBudget || 0,
        consuntivoValue: ecoParams?.assicurazioniConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.assicurazioniConsuntivo || 0) / totalConsuntivoRevenue : 0,
      },
      {
        percent: (ecoParams?.speseBancarieBudget || 0) / totalCorrispettivi,
        budgetValue: ecoParams?.speseBancarieBudget || 0,
        consuntivoValue: ecoParams?.speseBancarieConsuntivo || 0,
        consuntivoPercent: totalConsuntivoRevenue > 0 ? (ecoParams?.speseBancarieConsuntivo || 0) / totalConsuntivoRevenue : 0,
      }
    ];

    // Calculate EBITDA exactly like P&L
    const totalCostPercent = costItems.reduce((sum, item) => sum + item.percent, 0);
    const totalCostPercentConsuntivo = costItems.reduce((sum, item) => sum + item.consuntivoPercent, 0);
    
    const ebitdaPercent = 1 - totalCostPercent;
    const ebitdaPercentConsuntivo = 1 - totalCostPercentConsuntivo;
    
    // Calculate actual EBITDA values in euros exactly like P&L
    const totalCostsBudgetEuros = costItems.reduce((sum, item) => sum + (item.budgetValue || 0), 0);
    const totalCostsConsuntivoEuros = costItems.reduce((sum, item) => sum + (item.consuntivoValue || 0), 0);
    const ebitdaBudgetEuros = totals.totalBudget - totalCostsBudgetEuros;
    const ebitdaConsuntivoEuros = (totals.totalActualRevenue + totals.totalActualDelivery) - totalCostsConsuntivoEuros;

    // Differenza in EURO = EBITDA Consuntivo Euro - EBITDA Budget Euro
    const differenceEuro = ebitdaConsuntivoEuros - ebitdaBudgetEuros;

    return {
      ebitdaBudget: ebitdaBudgetEuros,
      ebitdaPercentageBudget: ebitdaPercent * 100,
      ebitdaPercentageConsuntivo: ebitdaPercentConsuntivo * 100,
      ebitdaDifference: differenceEuro,
      totalCorrispettivi: totalCorrispettivi
    };
  }, [ecoParams, budgetEntries, foodCostMetrics]);

  // Calculate real profit margin using actual costs from economic parameters
  const mockRevenue = totalFoodSales || 42000;
  const otherCosts = ecoParams ? (
    (ecoParams.acquistiVarConsuntivo || 0) +
    (ecoParams.locazioniConsuntivo || 0) +
    (ecoParams.personaleConsuntivo || 0) +
    (ecoParams.utenzeConsuntivo || 0) +
    (ecoParams.manutenzioniConsuntivo || 0) +
    (ecoParams.noleggiConsuntivo || 0) +
    (ecoParams.prestazioniTerziConsuntivo || 0) +
    (ecoParams.consulenzeConsuntivo || 0) +
    (ecoParams.marketingConsuntivo || 0) +
    (ecoParams.deliveryConsuntivo || 0) +
    (ecoParams.trasferteConsuntivo || 0) +
    (ecoParams.assicurazioniConsuntivo || 0) +
    (ecoParams.speseBancarieConsuntivo || 0)
  ) : 0;
  const mockProfit = mockRevenue - totalFoodCost - otherCosts;
  const mockProfitMargin = mockRevenue > 0 ? (mockProfit / mockRevenue) * 100 : 0;

  return (
    <div className="space-y-6" data-testid="dashboard-main">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Dashboard Gestione Ristorante</h1>
        <p className="text-muted-foreground">
          Controllo completo di Food Cost, Labour Cost e Performance Finanziaria
        </p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Food Cost %"
          value={`${foodCostPercentage.toFixed(1)}%`}
          change={realVsTheoreticalDiff}
          changeLabel={
            <div className="flex flex-col text-xs leading-tight">
              <span>cfr FCT {realVsTheoreticalDiff > 0 ? '+' : ''}{realVsTheoreticalDiff.toFixed(1)}%</span>
              <span className={`${ecoParams?.materieFirsteBudget && totalCorrispettivi > 0 && ((ecoParams.materieFirsteBudget / totalCorrispettivi) * 100) > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                cfr FCB {ecoParams?.materieFirsteBudget && totalCorrispettivi > 0 ? ((ecoParams.materieFirsteBudget / totalCorrispettivi) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          }
          trend={realVsTheoreticalDiff > 0 ? "up" : "down"}
          status={foodCostPercentage > 30 ? "danger" : foodCostPercentage > 25 ? "warning" : "good"}
          icon={<ChefHat className="h-4 w-4" />}
          onClick={() => onNavigateToSection("food-cost")}
        />
        
        <KPICard
          title="Labour Cost %"
          value={`${labourCostPercentage.toFixed(1)}%`}
          change={1.2}
          trend="up"
          status={labourCostPercentage > 35 ? "danger" : labourCostPercentage > 30 ? "warning" : "good"}
          icon={<Users className="h-4 w-4" />}
          onClick={() => onNavigateToSection("labour-cost")}
        />
        
        <KPICard
          title="EBITDA"
          value={`${ebitdaPercentageConsuntivo.toFixed(1)}%`}
          change={ebitdaDifference}
          changeLabel={`${ebitdaDifference.toFixed(1).replace('.', ',')}€ vs budget`}
          trend={ebitdaDifference >= 0 ? "up" : "down"}
          status={ebitdaPercentageConsuntivo > 20 ? "good" : ebitdaPercentageConsuntivo > 10 ? "warning" : "danger"}
          icon={<TrendingUp className="h-4 w-4" />}
          onClick={() => onNavigateToSection("profit-loss")}
        />
        
        <KPICard
          title="Fatturato Oggi"
          value={`€${mockRevenue.toLocaleString()}`}
          change={5.3}
          trend="up"
          status="good"
          icon={<DollarSign className="h-4 w-4" />}
          onClick={() => onNavigateToSection("sales-detail")}
        />
      </div>

      {/* Three Pillars Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Food Cost Pillar */}
        <PillarOverview
          title="Food Cost"
          description="Controllo costi ingredienti, ricette e sprechi"
          currentValue={`€${totalFoodCost.toFixed(1)}`}
          targetValue="€10,500"
          progress={Math.min(100, (10500 / totalFoodCost) * 100) || 75}
          status={foodCostPercentage > 30 ? "danger" : foodCostPercentage > 25 ? "warning" : "good"}
          icon={<ChefHat className="h-6 w-6" />}
          onExplore={() => onNavigateToSection("food-cost")}
        />

        {/* Labour Cost Pillar */}
        <PillarOverview
          title="Labour Cost"
          description="Gestione personale, turni e produttività"
          currentValue="€0"
          targetValue="€0"
          progress={100}
          status={labourCostPercentage > 35 ? "danger" : labourCostPercentage > 30 ? "warning" : "good"}
          icon={<Users className="h-6 w-6" />}
          onExplore={() => onNavigateToSection("labour-cost")}
          isComingSoon={true}
        />

        {/* Profit & Loss Pillar */}
        <PillarOverview
          title="Conto Economico"
          description="P&L, margini e performance finanziaria"
          currentValue={`€${mockProfit.toFixed(1)}`}
          targetValue="€8,000"
          progress={Math.min(100, (mockProfit / 8000) * 100) || 92}
          status={mockProfitMargin < 10 ? "danger" : mockProfitMargin < 15 ? "warning" : "good"}
          icon={<Calculator className="h-6 w-6" />}
          onExplore={() => onNavigateToSection("profit-loss")}
          isComingSoon={true}
        />
      </div>

    </div>
  );
}