import { Button } from "@/components/ui/button";
import { Warehouse, Calculator, Trash2, TrendingUp } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "inventory", label: "Lista Materie Prime", icon: Warehouse },
  { id: "food-cost", label: "Calcolo Food Cost", icon: Calculator },
  { id: "waste", label: "Waste e pasti personali", icon: Trash2 },
  { id: "summary", label: "Riepilogo Vendite", icon: TrendingUp },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex bg-muted border-b border-border">
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
    </nav>
  );
}