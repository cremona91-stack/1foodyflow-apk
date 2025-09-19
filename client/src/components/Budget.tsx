import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Download, TrendingUp, TrendingDown, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { BudgetEntry, InsertBudgetEntry, UpdateBudgetEntry, EconomicParameters, UpdateEconomicParameters } from "@shared/schema";

interface BudgetProps {}

export default function Budget({}: BudgetProps) {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UpdateBudgetEntry>>({});
  const [ecoEditingField, setEcoEditingField] = useState<keyof UpdateEconomicParameters | null>(null);
  const [ecoTempValue, setEcoTempValue] = useState<string>("");

  // Fetch budget entries for selected month/year
  const { data: budgetEntries = [], isLoading } = useQuery({
    queryKey: ['/api/budget-entries', selectedYear, selectedMonth],
    queryFn: () => 
      fetch(`/api/budget-entries/${selectedYear}/${selectedMonth}`)
        .then(res => res.json()) as Promise<BudgetEntry[]>
  });

  // Create economic parameters mutation (for defaults)
  const createEcoParamsMutation = useMutation({
    mutationFn: async (params: UpdateEconomicParameters & { year: number; month: number }) => {
      const response = await apiRequest('POST', '/api/economic-parameters', params);
      return response as unknown as EconomicParameters;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/economic-parameters', selectedYear, selectedMonth] });
    },
  });

  // Fetch economic parameters for selected month/year (no side-effects)
  const { data: ecoParams, error: ecoParamsError } = useQuery({
    queryKey: ['/api/economic-parameters', selectedYear, selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/economic-parameters/${selectedYear}/${selectedMonth}`);
      if (!response.ok) {
        const error = new Error(`Failed to fetch: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }
      return response.json() as Promise<EconomicParameters>;
    },
    retry: false, // Don't retry on 404
  });

  // Fetch food cost metrics from dashboard for integration
  const { data: foodCostMetrics } = useQuery({
    queryKey: ['/api/metrics/food-cost', selectedYear, selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/metrics/food-cost/${selectedYear}/${selectedMonth}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch food cost metrics: ${response.status}`);
      }
      return response.json() as Promise<{
        year: number;
        month: number;
        totalFoodSales: number;
        totalFoodCost: number;
        foodCostPercentage: number;
        theoreticalFoodCostPercentage: number;
        realVsTheoreticalDiff: number;
        calculatedAt: string;
      }>;
    },
    retry: 1,
  });

  // Handle 404 errors by creating default parameters (side-effect free)
  const [defaultsCreated, setDefaultsCreated] = useState(false);
  
  // Reset defaultsCreated when period changes
  useEffect(() => {
    setDefaultsCreated(false);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if ((ecoParamsError as any)?.status === 404 && !defaultsCreated) {
      const defaultParams: UpdateEconomicParameters = {
        materieFirstePercent: 22.10,
        acquistiVarPercent: 3.00,
        locazioniBudget: 0,
        personaleBudget: 0,
        utenzeBudget: 0,
        manutenzionibudget: 0,
        noleggibudget: 0,
        prestazioniTerziBudget: 0,
        consulenzeBudget: 0,
        marketingBudget: 0,
        deliveryBudget: 0,
        trasferteBudget: 0,
        assicurazioniBudget: 0,
        speseBancarieBudget: 0,
      };
      createEcoParamsMutation.mutate({ ...defaultParams, year: selectedYear, month: selectedMonth });
      setDefaultsCreated(true);
    }
  }, [ecoParamsError, selectedYear, selectedMonth, defaultsCreated, createEcoParamsMutation]);

  // Create/update mutations
  const createMutation = useMutation({
    mutationFn: (data: InsertBudgetEntry) => apiRequest('POST', '/api/budget-entries', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-entries', selectedYear, selectedMonth] });
    },
  });

  // Economic parameters update mutation
  const updateEcoParamsMutation = useMutation({
    mutationFn: (data: UpdateEconomicParameters) => 
      apiRequest('PUT', `/api/economic-parameters/${selectedYear}/${selectedMonth}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/economic-parameters', selectedYear, selectedMonth] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetEntry }) => 
      apiRequest('PUT', `/api/budget-entries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-entries', selectedYear, selectedMonth] });
      setEditingEntry(null);
      setEditForm({});
    },
  });

  // Handle editing economic parameters with bidirectional logic
  const handleEcoEdit = (field: keyof UpdateEconomicParameters, currentValue: number, isPercentageField: boolean = false, isBudgetEuroField: boolean = false) => {
    setEcoEditingField(field);
    if (isPercentageField) {
      // For percentage fields (materie prime, acquisti vari), edit as percentage
      setEcoTempValue(currentValue.toString().replace('.', ','));
    } else if (isBudgetEuroField) {
      // For budget euro fields - allow editing as euro values that will convert to percentages
      setEcoTempValue(currentValue.toString().replace('.', ','));
    } else {
      // For regular budget and consuntivo fields, edit as absolute euro value
      setEcoTempValue(currentValue.toString().replace('.', ','));
    }
  };

  const handleEcoSave = (field: keyof UpdateEconomicParameters, isPercentageField: boolean = false, isBudgetEuroField: boolean = false) => {
    if (!ecoParams) return;
    
    const numValue = parseFloat(ecoTempValue.replace(',', '.'));
    if (isNaN(numValue)) return;
    
    let updateData: Partial<UpdateEconomicParameters> = {};
    
    // Calculate total revenue for bidirectional calculations
    const totalRevenue = totals.totalActualRevenue + totals.totalActualDelivery || totals.totalBudget || 1;
    
    if (isPercentageField) {
      // Editing percentage: save percentage directly
      updateData[field] = numValue;
    } else if (isBudgetEuroField) {
      // Editing euro value: convert to percentage and save
      const percentageValue = (numValue / totalRevenue) * 100;
      updateData[field] = percentageValue;
    } else {
      // Regular fields (budget amounts, consuntivo amounts): save euro value directly
      updateData[field] = numValue;
    }
    
    updateEcoParamsMutation.mutate(updateData);
    setEcoEditingField(null);
    setEcoTempValue("");
  };

  const handleEcoCancel = () => {
    setEcoEditingField(null);
    setEcoTempValue("");
  };

  // Generate all days for the month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Convert budget entries to map for easier lookup
  const budgetMap = useMemo(() => {
    const map = new Map<number, BudgetEntry>();
    if (budgetEntries && Array.isArray(budgetEntries)) {
      budgetEntries.forEach(entry => {
        map.set(entry.day, entry);
      });
    }
    return map;
  }, [budgetEntries]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalCopertoMedio = 0;
    let totalCoperti = 0;
    let totalBudgetRevenue = 0;
    let totalBudgetDelivery = 0;
    let totalActualRevenue = 0;
    let totalActualDelivery = 0;
    let validEntries = 0;

    if (budgetEntries && Array.isArray(budgetEntries)) {
      budgetEntries.forEach(entry => {
        totalCoperti += entry.coperti || 0;
        totalBudgetDelivery += entry.budgetDelivery || 0;
        totalActualRevenue += entry.actualRevenue || 0;
        totalActualDelivery += entry.actualDelivery || 0;
        
        if (entry.copertoMedio && entry.copertoMedio > 0) {
          totalCopertoMedio += entry.copertoMedio;
          validEntries++;
        }
        
        // Budget Revenue calcolato = Coperti * Coperto Medio
        const calculatedRevenue = (entry.coperti || 0) * (entry.copertoMedio || 0);
        totalBudgetRevenue += calculatedRevenue;
      });
    }

    // Media coperto medio
    const avgCopertoMedio = validEntries > 0 ? totalCopertoMedio / validEntries : 0;
    
    // Consuntivo 2026 = Budget Revenue + Budget Delivery
    const totalConsuntivo2026 = totalBudgetRevenue + totalBudgetDelivery;
    
    // Consuntivo 2025 = Incasso 2025 + Delivery 2025
    const totalConsuntivo2025 = totalActualRevenue + totalActualDelivery;
    
    // Delta % tra Consuntivo 2026 e 2025
    const deltaPercentage = totalConsuntivo2025 > 0 ? 
      (((totalConsuntivo2026 - totalConsuntivo2025) / totalConsuntivo2025) * 100) : 0;

    return {
      avgCopertoMedio,
      totalCoperti,
      totalBudgetRevenue,
      totalBudgetDelivery,
      totalBudget: totalBudgetRevenue + totalBudgetDelivery,
      totalActualRevenue,
      totalActualDelivery,
      totalActual: totalActualRevenue + totalActualDelivery,
      totalConsuntivo2026,
      totalConsuntivo2025,
      deltaPercentage
    };
  }, [budgetEntries]);

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const dayNames = [
    "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"
  ];

  const getDayOfWeek = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    return dayNames[date.getDay()];
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "€ 0,00";
    return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "0%";
    return `${value.toFixed(1)}%`;
  };

  const getPercentageColor = (value: number | null | undefined) => {
    if (!value) return "";
    if (value > 0) return "text-green-600"; // Positivo = verde
    if (value < 0) return "text-red-600"; // Negativo = rosso  
    return "text-gray-600";
  };

  const handleCellEdit = (day: number, field: keyof UpdateBudgetEntry, value: string) => {
    const entry = budgetMap.get(day);
    
    // Handle empty values and convert italian decimal format (comma to dot)
    let numericValue: number;
    if (value === '' || value === null || value === undefined) {
      numericValue = 0;
    } else {
      // Support both comma and dot as decimal separator
      const cleanValue = value.replace(',', '.');
      numericValue = parseFloat(cleanValue);
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      
      // Special handling for integer fields (coperti should be integer)
      if (field === 'coperti') {
        numericValue = Math.round(numericValue); // Convert decimals to integers for coperti
      }
    }

    if (entry) {
      // Update existing entry
      updateMutation.mutate({
        id: entry.id,
        data: { [field]: numericValue }
      });
    } else {
      // Create new entry
      const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      createMutation.mutate({
        date: dateStr,
        year: selectedYear,
        month: selectedMonth,
        day: day,
        [field]: numericValue
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6" data-testid="budget-main">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Budget {monthNames[selectedMonth - 1]} {selectedYear}</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-24" data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-32" data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Budget Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-red-600 text-white hover:bg-red-600">
                  <TableHead className="text-white font-semibold min-w-[120px]">Data</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[100px]">Coperto Medio €</TableHead>
                  <TableHead className="text-white font-semibold text-center min-w-[80px]">Coperti</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[120px]">Budget {selectedYear} €</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[120px]">Delivery {selectedYear} €</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[120px]">Incasso {selectedYear - 1} €</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[120px]">Delivery {selectedYear - 1} €</TableHead>
                  <TableHead className="text-white font-semibold text-center min-w-[110px]">Consuntivo {selectedYear}</TableHead>
                  <TableHead className="text-white font-semibold text-center min-w-[110px]">Consuntivo {selectedYear - 1}</TableHead>
                  <TableHead className="text-white font-semibold text-center min-w-[80px]">Delta %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthDays.map(day => {
                  const entry = budgetMap.get(day);
                  
                  // Calcolo automatico Budget 2026 = Coperti * Coperto Medio
                  const calculatedBudgetRevenue = (entry?.coperti || 0) * (entry?.copertoMedio || 0);
                  
                  // Consuntivo 2026 = Budget 2026 + Delivery 2026
                  const consuntivo2026 = calculatedBudgetRevenue + (entry?.budgetDelivery || 0);
                  
                  // Consuntivo 2025 = Incasso 2025 + Delivery 2025
                  const consuntivo2025 = (entry?.actualRevenue || 0) + (entry?.actualDelivery || 0);
                  
                  // Delta % tra Consuntivo 2026 e Consuntivo 2025
                  const deltaPercentage = consuntivo2025 > 0 ? (((consuntivo2026 - consuntivo2025) / consuntivo2025) * 100) : 0;

                  return (
                    <TableRow 
                      key={day}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {`${getDayOfWeek(selectedYear, selectedMonth, day)} ${day.toString().padStart(2, '0')} ${monthNames[selectedMonth - 1].slice(0, 3)} ${selectedYear}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="text"
                          value={entry?.copertoMedio ? entry.copertoMedio.toString() : ''}
                          placeholder="0,00"
                          className="w-20 text-right border-0 p-1 h-8"
                          onChange={(e) => handleCellEdit(day, 'copertoMedio', e.target.value)}
                          data-testid={`input-coperto-medio-${day}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="text"
                          value={entry?.coperti ? entry.coperti.toString() : ''}
                          placeholder="0"
                          className="w-16 text-center border-0 p-1 h-8"
                          onChange={(e) => handleCellEdit(day, 'coperti', e.target.value)}
                          data-testid={`input-coperti-${day}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono" data-testid={`calculated-budget-revenue-${day}`}>
                          {formatCurrency(calculatedBudgetRevenue)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="text"
                          value={entry?.budgetDelivery ? entry.budgetDelivery.toString() : ''}
                          placeholder="0,00"
                          className="w-24 text-right border-0 p-1 h-8"
                          onChange={(e) => handleCellEdit(day, 'budgetDelivery', e.target.value)}
                          data-testid={`input-budget-delivery-${day}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="text"
                          value={entry?.actualRevenue ? entry.actualRevenue.toString() : ''}
                          placeholder="0,00"
                          className="w-24 text-right border-0 p-1 h-8"
                          onChange={(e) => handleCellEdit(day, 'actualRevenue', e.target.value)}
                          data-testid={`input-actual-revenue-${day}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="text"
                          value={entry?.actualDelivery ? entry.actualDelivery.toString() : ''}
                          placeholder="0,00"
                          className="w-24 text-right border-0 p-1 h-8"
                          onChange={(e) => handleCellEdit(day, 'actualDelivery', e.target.value)}
                          data-testid={`input-actual-delivery-${day}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-mono" data-testid={`consuntivo-2026-${day}`}>
                          {formatCurrency(consuntivo2026)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-mono" data-testid={`consuntivo-2025-${day}`}>
                          {formatCurrency(consuntivo2025)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary"
                          className={`font-mono text-xs ${getPercentageColor(deltaPercentage)}`}
                          data-testid={`badge-delta-${day}`}
                        >
                          {deltaPercentage > 0 ? '+' : ''}{deltaPercentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Totals Row */}
                <TableRow className="bg-gray-100 dark:bg-gray-800 font-semibold border-t-2">
                  <TableCell className="font-bold">Totale {monthNames[selectedMonth - 1]}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-coperto-medio">{formatCurrency(totals.avgCopertoMedio)}</TableCell>
                  <TableCell className="text-center font-bold" data-testid="total-coperti">{totals.totalCoperti}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-budget-revenue">{formatCurrency(totals.totalBudgetRevenue)}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-budget-delivery">{formatCurrency(totals.totalBudgetDelivery)}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-actual-revenue">{formatCurrency(totals.totalActualRevenue)}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-actual-delivery">{formatCurrency(totals.totalActualDelivery)}</TableCell>
                  <TableCell className="text-center font-bold" data-testid="total-consuntivo-2026">{formatCurrency(totals.totalConsuntivo2026)}</TableCell>
                  <TableCell className="text-center font-bold" data-testid="total-consuntivo-2025">{formatCurrency(totals.totalConsuntivo2025)}</TableCell>
                  <TableCell className="text-center font-bold">
                    <Badge 
                      variant="secondary"
                      className={`font-mono ${getPercentageColor(totals.deltaPercentage)}`}
                      data-testid="total-delta-percentage"
                    >
                      {totals.deltaPercentage > 0 ? '+' : ''}{totals.deltaPercentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consuntivo {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="summary-card-consuntivo-2026">
              {formatCurrency(totals.totalConsuntivo2026)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sala: {formatCurrency(totals.totalBudgetRevenue)} | Delivery: {formatCurrency(totals.totalBudgetDelivery)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consuntivo {selectedYear - 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="summary-card-consuntivo-2025">
              {formatCurrency(totals.totalConsuntivo2025)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sala: {formatCurrency(totals.totalActualRevenue)} | Delivery: {formatCurrency(totals.totalActualDelivery)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPercentageColor(totals.deltaPercentage)}`} data-testid="summary-card-performance">
              {totals.deltaPercentage > 0 ? '+' : ''}{totals.deltaPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedYear} vs {selectedYear - 1}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conto Economico Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Conto Economico - {monthNames[selectedMonth - 1]} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {(() => {
              // Helper function for Italian percentage formatting
              const formatPercent = (value: number) => `${value.toFixed(2).replace('.', ',')}%`;
              
              // Centralized cost items array (with editable parameters)
              const totalRevenue = totals.totalActualRevenue + totals.totalActualDelivery || totals.totalBudget || 1;
              
              const costItems = [
                { 
                  code: '0110', 
                  name: 'Consumi materie prime', 
                  percent: (ecoParams?.materieFirstePercent || 22.10) / 100, 
                  budgetValue: totalRevenue * ((ecoParams?.materieFirstePercent || 22.10) / 100),
                  consuntivoValue: foodCostMetrics?.totalFoodCost || 0, // Integrazione reale food cost dalla dashboard
                  foodCostPercent: foodCostMetrics?.foodCostPercentage || null, // Integrazione food cost dalla dashboard
                  dataTestId: 'eco-materie', 
                  highlight: false,
                  editable: true,
                  field: 'materieFirstePercent',
                  consuntivoField: null, // Non editabile - viene dal food cost della dashboard
                  isBidirectional: true,
                  isFromDashboard: true // Flag per indicare che viene dalla dashboard
                },
                { 
                  code: '0120', 
                  name: 'Acquisti vari', 
                  percent: (ecoParams?.acquistiVarPercent || 3.00) / 100, 
                  budgetValue: totalRevenue * ((ecoParams?.acquistiVarPercent || 3.00) / 100),
                  consuntivoValue: ecoParams?.acquistiVarConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'acquistiVarPercent',
                  consuntivoField: 'acquistiVarConsuntivo',
                  isBidirectional: true
                },
                { 
                  code: '0210', 
                  name: 'Locazioni locali', 
                  percent: (ecoParams?.locazioniBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.locazioniBudget || 0,
                  consuntivoValue: ecoParams?.locazioniConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'locazioniBudget',
                  consuntivoField: 'locazioniConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0220', 
                  name: 'Costi del personale', 
                  percent: (ecoParams?.personaleBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.personaleBudget || 0,
                  consuntivoValue: ecoParams?.personaleConsuntivo || 0,
                  dataTestId: 'eco-personale', 
                  highlight: true,
                  editable: true,
                  field: 'personaleBudget',
                  consuntivoField: 'personaleConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0240', 
                  name: 'Utenze', 
                  percent: (ecoParams?.utenzeBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.utenzeBudget || 0,
                  consuntivoValue: ecoParams?.utenzeConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'utenzeBudget',
                  consuntivoField: 'utenzeConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0250', 
                  name: 'Manutenzioni', 
                  percent: (ecoParams?.manutenzionibudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.manutenzionibudget || 0,
                  consuntivoValue: ecoParams?.manutenzioniConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'manutenzionibudget',
                  consuntivoField: 'manutenzioniConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0260', 
                  name: 'Noleggi e Leasing', 
                  percent: (ecoParams?.noleggibudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.noleggibudget || 0,
                  consuntivoValue: ecoParams?.noleggiConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'noleggibudget',
                  consuntivoField: 'noleggiConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0310', 
                  name: 'Prestazioni di terzi', 
                  percent: (ecoParams?.prestazioniTerziBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.prestazioniTerziBudget || 0,
                  consuntivoValue: ecoParams?.prestazioniTerziConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'prestazioniTerziBudget',
                  consuntivoField: 'prestazioniTerziConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0320', 
                  name: 'Consulenze e compensi a terzi', 
                  percent: (ecoParams?.consulenzeBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.consulenzeBudget || 0,
                  consuntivoValue: ecoParams?.consulenzeConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'consulenzeBudget',
                  consuntivoField: 'consulenzeConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0330', 
                  name: 'Marketing', 
                  percent: (ecoParams?.marketingBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.marketingBudget || 0,
                  consuntivoValue: ecoParams?.marketingConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'marketingBudget',
                  consuntivoField: 'marketingConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0340', 
                  name: 'Delivery', 
                  percent: (ecoParams?.deliveryBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.deliveryBudget || 0,
                  consuntivoValue: ecoParams?.deliveryConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'deliveryBudget',
                  consuntivoField: 'deliveryConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0410', 
                  name: 'Trasferte e viaggi', 
                  percent: (ecoParams?.trasferteBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.trasferteBudget || 0,
                  consuntivoValue: ecoParams?.trasferteConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'trasferteBudget',
                  consuntivoField: 'trasferteConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0520', 
                  name: 'Assicurazioni', 
                  percent: (ecoParams?.assicurazioniBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.assicurazioniBudget || 0,
                  consuntivoValue: ecoParams?.assicurazioniConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'assicurazioniBudget',
                  consuntivoField: 'assicurazioniConsuntivo',
                  isBidirectional: false
                },
                { 
                  code: '0530', 
                  name: 'Spese bancarie', 
                  percent: (ecoParams?.speseBancarieBudget || 0) / totalRevenue, 
                  budgetValue: ecoParams?.speseBancarieBudget || 0,
                  consuntivoValue: ecoParams?.speseBancarieConsuntivo || 0,
                  dataTestId: null, 
                  highlight: false,
                  editable: true,
                  field: 'speseBancarieBudget',
                  consuntivoField: 'speseBancarieConsuntivo',
                  isBidirectional: false
                }
              ];
              
              // Calculate total cost percentage and EBITDA
              const totalCostPercent = costItems.reduce((sum, item) => sum + item.percent, 0);
              const ebitdaPercent = 1 - totalCostPercent;
              
              return (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-80">Voce</TableHead>
                      <TableHead className="text-center w-20">Target %</TableHead>
                      <TableHead className="text-right w-32">Budget €</TableHead>
                      <TableHead className="text-right w-32">Consuntivo €</TableHead>
                      <TableHead className="text-center w-20">Consuntivo %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Revenue Row */}
                    <TableRow className="bg-blue-50 dark:bg-blue-950/20 font-semibold">
                      <TableCell>0010 - Corrispettivi</TableCell>
                      <TableCell className="text-center">100,00%</TableCell>
                      <TableCell className="text-right" data-testid="eco-corrispettivi-budget">{formatCurrency(totals.totalBudget)}</TableCell>
                      <TableCell className="text-right" data-testid="eco-corrispettivi-consuntivo">{formatCurrency(totals.totalActualRevenue + totals.totalActualDelivery)}</TableCell>
                      <TableCell className="text-center">100,00%</TableCell>
                    </TableRow>
                    
                    {/* Cost Items */}
                    {costItems.map((item) => (
                      <TableRow key={item.code} className={item.highlight ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                        <TableCell className={item.highlight ? "font-medium" : ""}>{item.code} - {item.name}</TableCell>
                        <TableCell className={`text-center ${item.highlight ? "font-medium" : ""} ${item.editable && (item.field === 'materieFirstePercent' || item.field === 'acquistiVarPercent') ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                          data-testid={item.dataTestId ? `${item.dataTestId}-percent` : undefined}
                          onClick={item.editable && item.field && (item.field === 'materieFirstePercent' || item.field === 'acquistiVarPercent') ? () => {
                            const currentValue = item.percent * 100;
                            handleEcoEdit(item.field as keyof UpdateEconomicParameters, currentValue, true);
                          } : undefined}
                        >
                          {ecoEditingField === item.field && item.editable ? (
                            <Input
                              value={ecoTempValue}
                              onChange={(e) => setEcoTempValue(e.target.value)}
                              onBlur={() => {
                                handleEcoSave(item.field as keyof UpdateEconomicParameters);
                                setEcoEditingField(null);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEcoSave(item.field as keyof UpdateEconomicParameters);
                                  setEcoEditingField(null);
                                }
                              }}
                              className="h-6 text-center"
                              autoFocus
                            />
                          ) : (
                            formatPercent(item.percent * 100)
                          )}
                        </TableCell>
                        <TableCell 
                          className={`text-right ${item.highlight ? "font-medium" : ""} ${item.editable && item.field && item.field !== 'materieFirstePercent' && item.field !== 'acquistiVarPercent' ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                          data-testid={item.dataTestId ? `${item.dataTestId}-budget` : undefined}
                          onClick={item.editable && item.field && item.field !== 'materieFirstePercent' && item.field !== 'acquistiVarPercent' ? () => {
                            const currentValue = item.budgetValue || 0;
                            handleEcoEdit(item.field as keyof UpdateEconomicParameters, currentValue, false);
                          } : undefined}
                        >
                          {ecoEditingField === item.field && item.editable && item.field !== 'materieFirstePercent' && item.field !== 'acquistiVarPercent' ? (
                            <Input
                              value={ecoTempValue}
                              onChange={(e) => setEcoTempValue(e.target.value)}
                              onBlur={() => {
                                handleEcoSave(item.field as keyof UpdateEconomicParameters);
                                setEcoEditingField(null);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEcoSave(item.field as keyof UpdateEconomicParameters);
                                  setEcoEditingField(null);
                                }
                              }}
                              className="h-6 text-right"
                              autoFocus
                            />
                          ) : (
                            formatCurrency(item.budgetValue || 0)
                          )}
                        </TableCell>
                        <TableCell 
                          className={`text-right ${item.highlight ? "font-medium" : ""} ${item.editable && item.consuntivoField ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                          data-testid={item.dataTestId ? `${item.dataTestId}-consuntivo` : undefined}
                          onClick={item.editable && item.consuntivoField ? () => {
                            const currentValue = item.consuntivoValue || 0;
                            handleEcoEdit(item.consuntivoField as keyof UpdateEconomicParameters, currentValue, false, false);
                          } : undefined}
                        >
                          {ecoEditingField === item.consuntivoField && item.editable && item.consuntivoField ? (
                            <Input
                              value={ecoTempValue}
                              onChange={(e) => setEcoTempValue(e.target.value)}
                              onBlur={() => {
                                handleEcoSave(item.consuntivoField as keyof UpdateEconomicParameters, false, false);
                                setEcoEditingField(null);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEcoSave(item.consuntivoField as keyof UpdateEconomicParameters, false, false);
                                  setEcoEditingField(null);
                                }
                              }}
                              className="h-6 text-right"
                              autoFocus
                            />
                          ) : (
                            formatCurrency(item.consuntivoValue || 0)
                          )}
                        </TableCell>
                        <TableCell className={`text-center ${item.highlight ? "font-medium" : ""}`}>
                          {item.isFromDashboard && item.foodCostPercent !== null ? 
                            formatPercent(item.foodCostPercent) : 
                            formatPercent(((item.consuntivoValue || 0) / (totals.totalActualRevenue + totals.totalActualDelivery || 1)) * 100)
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* EBITDA Row */}
                    <TableRow className="bg-green-50 dark:bg-green-950/20 border-t-2 font-bold">
                      <TableCell className="font-bold">10 - EBITDA</TableCell>
                      <TableCell className="text-center font-bold">{formatPercent(ebitdaPercent * 100)}</TableCell>
                      <TableCell className="text-right font-bold" data-testid="eco-ebitda-budget">
                        {formatCurrency(totals.totalBudget * ebitdaPercent)}
                      </TableCell>
                      <TableCell className="text-right font-bold" data-testid="eco-ebitda-consuntivo">
                        {formatCurrency((totals.totalActualRevenue + totals.totalActualDelivery) * ebitdaPercent)}
                      </TableCell>
                      <TableCell className="text-center font-bold" data-testid="eco-ebitda-percent">
                        {formatPercent(ebitdaPercent * 100)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}