import { Button } from "@/components/ui/button";
import { FileText, Utensils, ChefHat, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";

interface AppHeaderProps {
  onExportPDF?: () => void;
}

export default function AppHeader({ onExportPDF }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  
  const handleExportPDF = () => {
    console.log("PDF export triggered");
    onExportPDF?.();
  };
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-card border-b border-card-border p-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={handleExportPDF}
          variant="destructive"
          size="sm"
          data-testid="button-export-pdf"
          className="flex items-center gap-1"
        >
          <FileText className="h-3 w-3" />
          Esporta PDF
        </Button>
        
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            FoodyFlow
          </h1>
          <p className="text-sm italic text-muted-foreground mt-2">
            Evolve Your Eatery
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
            <span>Benvenuto</span>
            <span className="font-medium">{user?.username}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="flex items-center gap-1"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="button-logout"
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </Button>
        </div>
      </div>
    </header>
  );
}