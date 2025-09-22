import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AIResponse {
  success: boolean;
  analysis?: string;
  optimization?: {
    currentPercentage: number;
    targetPercentage: number;
    suggestions: string[];
    priority: 'high' | 'medium' | 'low';
  };
  timestamp: string;
}

export function FloatingAIBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [optimization, setOptimization] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast({
        title: "Domanda richiesta",
        description: "Inserisci una domanda per l'assistente IA",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result: any = await apiRequest("POST", "/api/ai/analyze", { query });
      const response = await result.json();

      if (response.success && response.analysis) {
        setResponse(response.analysis);
        setOptimization(null); // Reset optimization quando si fa una domanda generale
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'analisi IA. Riprova più tardi.",
        variant: "destructive",
      });
      console.error("Errore analisi IA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodCostOptimization = async () => {
    setIsLoading(true);
    try {
      const result: any = await apiRequest("POST", "/api/ai/food-cost-optimization", {});
      const response = await result.json();

      if (response.success && response.optimization) {
        setOptimization(response.optimization);
        setResponse(""); // Reset response quando si fa ottimizzazione
        toast({
          title: "Ottimizzazione completata",
          description: "Analisi food cost generata con successo",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'ottimizzazione food cost. Riprova più tardi.",
        variant: "destructive",
      });
      console.error("Errore ottimizzazione:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Pulsante flottante per aprire il bot
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          data-testid="button-open-ai-bot"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  // Chat bot popup
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card 
        className={`w-80 shadow-2xl border-primary/20 transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-96'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Assistente IA</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
                data-testid="button-minimize-ai-bot"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-ai-bot"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <CardDescription className="text-xs">
              Fai domande sui tuoi dati del ristorante
            </CardDescription>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-full">
            {/* Bottoni rapidi */}
            <div className="flex gap-1 mb-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleFoodCostOptimization}
                disabled={isLoading}
                data-testid="button-quick-foodcost"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Food Cost
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setQuery("Quali sono i miei piatti più redditizi?");
                  handleAnalyze();
                }}
                disabled={isLoading}
                data-testid="button-quick-profitable"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Redditività
              </Button>
            </div>

            {/* Area messaggi */}
            <div className="flex-1 overflow-y-auto mb-3 text-xs">
              {response && (
                <div className="bg-muted/50 p-2 rounded text-xs mb-2">
                  <div className="whitespace-pre-wrap">{response}</div>
                </div>
              )}
              
              {optimization && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card p-2 rounded text-center">
                      <div className="text-lg font-bold text-red-600">
                        {optimization.currentPercentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Attuale</div>
                    </div>
                    <div className="bg-card p-2 rounded text-center">
                      <div className="text-lg font-bold text-green-600">
                        {optimization.targetPercentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Obiettivo</div>
                    </div>
                  </div>
                  
                  <Badge className={`${getPriorityColor(optimization.priority)} text-xs`}>
                    Priorità {optimization.priority}
                  </Badge>
                  
                  <div className="text-xs">
                    {optimization.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start gap-1 mb-1">
                        <span className="text-primary">•</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input domanda */}
            <div className="flex gap-2">
              <Input
                placeholder="Fai una domanda..."
                value={query}
                onChange={(e) => {
                  console.log("Input change:", e.target.value);
                  setQuery(e.target.value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                disabled={false}
                className="text-xs h-8 bg-background border-input"
                data-testid="input-ai-bot-query"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading || !query.trim()}
                size="icon"
                className="h-8 w-8"
                data-testid="button-send-ai-bot"
              >
                {isLoading ? "..." : <Send className="h-3 w-3" />}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}