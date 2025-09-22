import { 
  LayoutDashboard, 
  Calendar, 
  Calculator, 
  Users, 
  BarChart3, 
  Warehouse, 
  ChefHat, 
  Truck, 
  ArrowUpDown, 
  Trash2,
  Utensils,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader
} from "@/components/ui/sidebar";

// Primary operational tabs
const primaryTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "budget", label: "Budget", icon: Calendar, href: "/" },
  { id: "profit-loss", label: "P&L", icon: TrendingUp, href: "/pl" },
  { id: "food-cost", label: "Food Cost", icon: Calculator, href: "/food-cost" },
  { id: "labour-cost", label: "Labour Cost", icon: Users, href: "/labour-cost" },
  { id: "sales-detail", label: "Vendite", icon: BarChart3, href: "/sales-detail" },
];

// Management section tabs
const managementTabs = [
  { id: "inventory", label: "Inventario", icon: Warehouse, href: "/inventory" },
  { id: "recipes", label: "Ricette", icon: ChefHat, href: "/ricette" },
  { id: "suppliers", label: "Fornitori", icon: Users, href: "/fornitori" },
  { id: "orders", label: "Ordini", icon: Truck, href: "/orders" },
  { id: "warehouse", label: "Magazzino", icon: ArrowUpDown, href: "/warehouse" },
  { id: "waste", label: "Sprechi/Staff Food", icon: Trash2, href: "/waste" },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const [location, navigate] = useLocation();
  
  const handleNavigation = (item: any) => {
    if (item.href) {
      navigate(item.href);
      // Update activeTab for items that stay in the same route structure
      if (item.id === "budget") {
        onTabChange("budget");
      } else if (item.id === "dashboard") {
        onTabChange("dashboard");
      } else if (item.id === "food-cost") {
        onTabChange("food-cost");
      } else if (item.id === "labour-cost") {
        onTabChange("labour-cost");
      } else if (item.id === "sales-detail") {
        onTabChange("sales-detail");
      } else if (item.id === "inventory") {
        onTabChange("inventory");
      } else if (item.id === "orders") {
        onTabChange("orders");
      } else if (item.id === "warehouse") {
        onTabChange("warehouse");
      } else if (item.id === "waste") {
        onTabChange("waste");
      }
    } else {
      onTabChange(item.id);
    }
  };

  const isActive = (item: any) => {
    // Check if current location matches the item's href
    if (item.href === "/") {
      return location === "/" || activeTab === "budget";
    }
    if (item.href) {
      return location === item.href;
    }
    return activeTab === item.id;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <Utensils className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">FoodyFlow</h1>
            <p className="text-xs text-muted-foreground italic">Evolve Your Eatery</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operazioni</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryTabs.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => handleNavigation(item)}
                      isActive={isActive(item)}
                      data-testid={`sidebar-${item.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Gestione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementTabs.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => handleNavigation(item)}
                      isActive={isActive(item)}
                      data-testid={`sidebar-${item.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}