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

// Types for dashboard data
import type { Product, Dish, Order, StockMovement } from "@shared/schema";

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
  changeLabel?: string;
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
  // Create product lookup map for performance
  const productMap = useMemo(() => 
    new Map(products.map(p => [p.id, p])), 
    [products]
  );
  
  // Calculate food cost metrics using the new formula: (totale iniziale + totale IN - totale finale)
  const { totalFoodSales, totalFoodCost, foodCostPercentage, theoreticalFoodCostPercentage, realVsTheoreticalDiff } = useMemo(() => {
    // Use NET REVENUE (netPrice) instead of gross revenue (sellingPrice) for Food Cost calculation
    const sales = dishes.reduce((sum, dish) => sum + (dish.netPrice * dish.sold), 0);
    
    // Calculate THEORETICAL food cost (based on recipes)
    const totalCostOfSales = dishes.reduce((sum, dish) => sum + (dish.totalCost * dish.sold), 0);
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

  // Mock labour cost data (to be implemented)
  const mockLabourCost = 12500; // €12,500 mensile
  const mockLabourTarget = 15000;
  const labourCostPercentage = totalFoodSales > 0 ? (mockLabourCost / totalFoodSales) * 100 : 28;

  // Mock P&L data (to be implemented)
  const mockRevenue = totalFoodSales || 42000;
  const mockProfit = mockRevenue - totalFoodCost - mockLabourCost - 8000; // 8000 = altri costi
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
          changeLabel={`cfr FCT ${realVsTheoreticalDiff > 0 ? '+' : ''}${realVsTheoreticalDiff.toFixed(1)}%`}
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
          title="Margine Netto"
          value={`${mockProfitMargin.toFixed(1)}%`}
          change={0.8}
          trend="up"
          status={mockProfitMargin < 10 ? "danger" : mockProfitMargin < 15 ? "warning" : "good"}
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
          currentValue={`€${totalFoodCost.toFixed(0)}`}
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
          currentValue={`€${mockLabourCost.toLocaleString()}`}
          targetValue={`€${mockLabourTarget.toLocaleString()}`}
          progress={Math.min(100, (mockLabourTarget / mockLabourCost) * 100) || 83}
          status={labourCostPercentage > 35 ? "danger" : labourCostPercentage > 30 ? "warning" : "good"}
          icon={<Users className="h-6 w-6" />}
          onExplore={() => onNavigateToSection("labour-cost")}
          isComingSoon={true}
        />

        {/* Profit & Loss Pillar */}
        <PillarOverview
          title="Conto Economico"
          description="P&L, margini e performance finanziaria"
          currentValue={`€${mockProfit.toFixed(0)}`}
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