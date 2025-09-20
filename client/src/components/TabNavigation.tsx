import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard,
  Warehouse, 
  Calculator, 
  Trash2, 
  TrendingUp, 
  Truck, 
  ArrowUpDown, 
  BarChart3,
  Users,
  TrendingUp as ProfitIcon,
  Calendar,
  ChefHat,
  Utensils
} from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Primary operational tabs
const primaryTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "budget", label: "Budget", icon: Calendar },
  { path: "/pl", label: "P&L", icon: ProfitIcon, external: true },
  { id: "food-cost", label: "Food Cost", icon: Calculator },
  { id: "labour-cost", label: "Labour Cost", icon: Users },
  { id: "sales-detail", label: "Vendite", icon: BarChart3 },
];

// Management section tabs (after separator)
const managementTabs = [
  { id: "inventory", label: "Inventario", icon: Warehouse },
  { path: "/ricette", label: "Ricette", icon: ChefHat, external: true },
  { id: "orders", label: "Ordini", icon: Truck },
  { id: "warehouse", label: "Magazzino", icon: ArrowUpDown },
  { id: "waste", label: "Sprechi/Staff Food", icon: Trash2 },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const [location] = useLocation();
  
  const renderTab = (tab: any, key: string) => {
    const Icon = tab.icon;
    const isActive = tab.external ? location === tab.path : activeTab === tab.id;
    
    const buttonContent = (
      <Button
        variant="ghost"
        size="default"
        onClick={tab.external ? undefined : () => onTabChange(tab.id)}
        data-testid={tab.external ? `link-${tab.path.replace('/', '')}` : `tab-${tab.id}`}
        className={`flex-1 rounded-none py-3 px-4 text-sm hover-elevate transition-colors flex items-center justify-center gap-2 ${
          isActive 
            ? "bg-background border-b-2 border-primary text-primary font-medium" 
            : "text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{tab.label}</span>
      </Button>
    );
    
    if (tab.external) {
      return (
        <Link key={key} href={tab.path}>
          {buttonContent}
        </Link>
      );
    }
    
    return <div key={key}>{buttonContent}</div>;
  };
  
  return (
    <nav className="flex bg-muted border-b border-border">
      {/* Primary operational tabs */}
      {primaryTabs.map((tab, index) => renderTab(tab, `primary-${index}`))}
      
      {/* Visual separator with fork icon */}
      <div className="flex items-center justify-center px-2 text-muted-foreground/50">
        <Utensils className="h-4 w-4" />
      </div>
      
      {/* Management section tabs */}
      {managementTabs.map((tab, index) => renderTab(tab, `management-${index}`))}
    </nav>
  );
}