import { Button } from "@/components/ui/button";
import { FileText, Utensils, ChefHat } from "lucide-react";

interface AppHeaderProps {
  onExportPDF?: () => void;
}

export default function AppHeader({ onExportPDF }: AppHeaderProps) {
  const handleExportPDF = () => {
    console.log("PDF export triggered");
    onExportPDF?.();
  };

  return (
    <header className="bg-card border-b border-card-border p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            FoodyFlow
          </h1>
          <p className="text-sm italic text-muted-foreground mt-2">
            Evolve Your Eatery
          </p>
        </div>
        <Button 
          onClick={handleExportPDF}
          variant="destructive"
          size="default"
          data-testid="button-export-pdf"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Esporta PDF
        </Button>
      </div>
    </header>
  );
}