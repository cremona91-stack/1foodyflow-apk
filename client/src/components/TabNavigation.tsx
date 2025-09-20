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
  ChefHat
} from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "budget", label: "Budget", icon: Calendar },
  { id: "food-cost", label: "Food Cost", icon: Calculator },
  { id: "labour-cost", label: "Labour Cost", icon: Users },
  { id: "inventory", label: "Inventario", icon: Warehouse },
  { id: "orders", label: "Ordini", icon: Truck },
  { id: "warehouse", label: "Magazzino", icon: ArrowUpDown },
  { id: "waste", label: "Sprechi", icon: Trash2 },
  { id: "sales-detail", label: "Vendite", icon: BarChart3 },
];

const externalLinks = [
  { path: "/ricette", label: "Ricette", icon: ChefHat },
  { path: "/pl", label: "P&L", icon: ProfitIcon },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const [location] = useLocation();
  
  return (
    <nav className="flex bg-muted border-b border-border">
      {/* Internal tabs */}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="default"
            onClick={() => onTabChange(tab.id)}
            data-testid={`tab-${tab.id}`}
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
      })}
      
      {/* External links */}
      {externalLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location === link.path;
        
        return (
          <Link key={link.path} href={link.path}>
            <Button
              variant="ghost"
              size="default"
              data-testid={`link-${link.path.replace('/', '')}`}
              className={`flex-1 rounded-none py-3 px-4 text-sm hover-elevate transition-colors flex items-center justify-center gap-2 ${
                isActive 
                  ? "bg-background border-b-2 border-primary text-primary font-medium" 
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{link.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}