import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight 
} from "lucide-react";
import type { Product, StockMovement, InventorySnapshot } from "@shared/schema";

interface InventoryGridProps {
  products: Product[];
  stockMovements: StockMovement[];
  inventorySnapshots: InventorySnapshot[];
  onViewMovements?: (productId: string) => void;
  onCreateSnapshot?: (productId: string) => void;
}

interface InventoryRow {
  product: Product;
  initialQuantity: number;
  inQuantity: number;
  outQuantity: number;
  finalQuantity: number;
  theoreticalQuantity: number;
  variance: number;
  isOpenPeriod: boolean;
  status: "ok" | "warning" | "critical";
}

export default function InventoryGrid({ 
  products, 
  stockMovements, 
  inventorySnapshots, 
  onViewMovements,
  onCreateSnapshot 
}: InventoryGridProps) {
  
  const inventoryRows: InventoryRow[] = useMemo(() => {
    return products.map(product => {
      // Get latest inventory snapshot for this product
      const latestSnapshot = inventorySnapshots
        .filter(s => s.productId === product.id)
        .sort((a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime())[0];

      // FIXED BASELINE LOGIC:
      let initialQuantity: number;
      let relevantMovements: StockMovement[];

      if (latestSnapshot) {
        // BASELINE FIX: Use finalQuantity as the baseline (actual counted stock at snapshot time)
        initialQuantity = latestSnapshot.finalQuantity;
        
        // Filter movements to only those AFTER the latest snapshot date
        const cutoffDate = new Date(latestSnapshot.snapshotDate);
        relevantMovements = stockMovements.filter(m => 
          m.productId === product.id && new Date(m.movementDate) > cutoffDate
        );
      } else {
        // NO-SNAPSHOT FIX: No historic movements, just use current product quantity
        initialQuantity = product.quantity;
        relevantMovements = []; // No movements to consider
      }
      
      // Calculate IN/OUT quantities from relevant movements only
      const inQuantity = relevantMovements
        .filter(m => m.movementType === "in")
        .reduce((sum, m) => sum + m.quantity, 0);
      const outQuantity = relevantMovements
        .filter(m => m.movementType === "out")  
        .reduce((sum, m) => sum + m.quantity, 0);

      // CORRECT SEMANTICS:
      // Teorico = computed theoretical quantity (initial + IN - OUT)
      const theoreticalQuantity = initialQuantity + inQuantity - outQuantity;
      
      // OPEN PERIOD DETECTION: Check if there are movements after the latest snapshot
      const isOpenPeriod = latestSnapshot && relevantMovements.length > 0;
      
      // FINALE CALCULATION:
      let finalQuantity: number;
      let variance: number;
      
      if (isOpenPeriod) {
        // OPEN PERIOD: No physical count after movements, use theoretical
        finalQuantity = theoreticalQuantity;
        variance = 0; // No variance until physical count is taken
      } else if (latestSnapshot) {
        // CLOSED PERIOD: Physical count exists for current period
        finalQuantity = latestSnapshot.finalQuantity;
        variance = finalQuantity - theoreticalQuantity;
      } else {
        // NO SNAPSHOT: Use theoretical as both final and baseline
        finalQuantity = theoreticalQuantity;
        variance = 0;
      }

      // DETERMINE STATUS: Only show warnings for closed periods with actual variance
      let status: "ok" | "warning" | "critical" = "ok";
      if (!isOpenPeriod && theoreticalQuantity > 0) {
        const variancePercentage = Math.abs(variance) / theoreticalQuantity;
        if (variancePercentage > 0.1) {
          status = "critical"; // >10% variance
        } else if (variancePercentage > 0.05) {
          status = "warning"; // >5% variance
        }
      } else if (!isOpenPeriod && Math.abs(variance) > 0.1) {
        // For zero theoretical quantity, use absolute threshold
        status = "warning";
      }

      return {
        product,
        initialQuantity,
        inQuantity,
        outQuantity,
        finalQuantity,
        theoreticalQuantity,
        variance,
        isOpenPeriod: isOpenPeriod || false,
        status
      };
    });
  }, [products, stockMovements, inventorySnapshots]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getTotalValue = () => {
    return inventoryRows.reduce((sum, row) => {
      // For open periods, use theoretical quantity since no physical count exists
      const quantityForValue = row.isOpenPeriod ? row.theoreticalQuantity : row.finalQuantity;
      return sum + (quantityForValue * row.product.pricePerUnit);
    }, 0);
  };

  const getVarianceStats = () => {
    const totalVariance = inventoryRows.reduce((sum, row) => sum + Math.abs(row.variance), 0);
    const criticalCount = inventoryRows.filter(row => row.status === "critical").length;
    const warningCount = inventoryRows.filter(row => row.status === "warning").length;
    
    return { totalVariance, criticalCount, warningCount };
  };

  const stats = getVarianceStats();

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nessun prodotto trovato</p>
          <p className="text-sm text-muted-foreground mt-1">
            Aggiungi dei prodotti per visualizzare l'inventario
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Prodotti</p>
                <p className="text-lg font-semibold" data-testid="stat-total-products">
                  {products.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Valore Inventario</p>
                <p className="text-lg font-semibold" data-testid="stat-total-value">
                  €{getTotalValue().toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avvisi</p>
                <p className="text-lg font-semibold" data-testid="stat-warnings">
                  {stats.warningCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Critici</p>
                <p className="text-lg font-semibold" data-testid="stat-critical">
                  {stats.criticalCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Magazzino In/Out - 5 Colonne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-9 gap-2 p-4 bg-muted/50 rounded-t-lg font-medium text-sm">
                <div className="col-span-2">Prodotto</div>
                <div className="text-center">Iniziale</div>
                <div className="text-center text-green-600">IN</div>
                <div className="text-center text-red-600">OUT</div>
                <div className="text-center">Finale</div>
                <div className="text-center">Teorico</div>
                <div className="text-center">Varianza</div>
                <div className="text-center">Stato</div>
              </div>

              {/* Rows */}
              {inventoryRows.map((row) => (
                <div 
                  key={row.product.id} 
                  className="grid grid-cols-9 gap-2 p-4 border-b hover:bg-muted/25 transition-colors"
                  data-testid={`inventory-row-${row.product.id}`}
                >
                  {/* Product Info */}
                  <div className="col-span-2">
                    <div className="font-medium" data-testid={`product-name-${row.product.id}`}>
                      {row.product.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {row.product.code} • {row.product.unit}
                    </div>
                  </div>

                  {/* Iniziale */}
                  <div className="text-center" data-testid={`initial-${row.product.id}`}>
                    <div className="font-mono">{row.initialQuantity.toFixed(2)}</div>
                  </div>

                  {/* IN */}
                  <div className="text-center" data-testid={`in-${row.product.id}`}>
                    <div className="font-mono text-green-600 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {row.inQuantity.toFixed(2)}
                    </div>
                  </div>

                  {/* OUT */}
                  <div className="text-center" data-testid={`out-${row.product.id}`}>
                    <div className="font-mono text-red-600 flex items-center justify-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {row.outQuantity.toFixed(2)}
                    </div>
                  </div>

                  {/* Finale */}
                  <div className="text-center" data-testid={`final-${row.product.id}`}>
                    <div className="font-mono font-semibold">{row.finalQuantity.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      {row.isOpenPeriod && (
                        <span className="text-blue-600">*</span>
                      )}
                      €{(row.finalQuantity * row.product.pricePerUnit).toFixed(2)}
                    </div>
                    {row.isOpenPeriod && (
                      <div className="text-xs text-blue-600">teorico</div>
                    )}
                  </div>

                  {/* Teorico */}
                  <div className="text-center" data-testid={`theoretical-${row.product.id}`}>
                    <div className="font-mono">{row.theoreticalQuantity.toFixed(2)}</div>
                  </div>

                  {/* Varianza */}
                  <div className="text-center" data-testid={`variance-${row.product.id}`}>
                    {row.isOpenPeriod ? (
                      <div className="font-mono text-blue-600 flex items-center justify-center gap-1">
                        <Package className="h-3 w-3" />
                        <span className="text-xs">Periodo Aperto</span>
                      </div>
                    ) : (
                      <div className={`font-mono flex items-center justify-center gap-1 ${
                        row.variance > 0 ? "text-green-600" : row.variance < 0 ? "text-red-600" : "text-muted-foreground"
                      }`}>
                        {row.variance > 0 ? <TrendingUp className="h-3 w-3" /> : 
                         row.variance < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                        {row.variance >= 0 ? '+' : ''}{row.variance.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Badge 
                        className={getStatusColor(row.status)}
                        data-testid={`status-${row.product.id}`}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(row.status)}
                          <span className="capitalize">{row.status}</span>
                        </div>
                      </Badge>
                      <div className="flex gap-1">
                        {onViewMovements && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewMovements(row.product.id)}
                            data-testid={`button-view-movements-${row.product.id}`}
                            title="Visualizza movimenti"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                        {onCreateSnapshot && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCreateSnapshot(row.product.id)}
                            data-testid={`button-create-snapshot-${row.product.id}`}
                            title="Crea snapshot inventario"
                          >
                            <Package className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}