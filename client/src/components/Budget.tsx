import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { BudgetEntry, InsertBudgetEntry, UpdateBudgetEntry } from "@shared/schema";

interface BudgetProps {}

export default function Budget({}: BudgetProps) {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UpdateBudgetEntry>>({});

  // Fetch budget entries for selected month/year
  const { data: budgetEntries = [], isLoading } = useQuery({
    queryKey: ['/api/budget-entries', selectedYear, selectedMonth],
    queryFn: () => 
      fetch(`/api/budget-entries/${selectedYear}/${selectedMonth}`)
        .then(res => res.json()) as Promise<BudgetEntry[]>
  });

  // Create/update mutations
  const createMutation = useMutation({
    mutationFn: (data: InsertBudgetEntry) => apiRequest('POST', '/api/budget-entries', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-entries', selectedYear, selectedMonth] });
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

  // Generate all days for the month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Convert budget entries to map for easier lookup
  const budgetMap = useMemo(() => {
    const map = new Map<number, BudgetEntry>();
    budgetEntries.forEach(entry => {
      map.set(entry.day, entry);
    });
    return map;
  }, [budgetEntries]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalCoperti = 0;
    let totalBudgetRevenue = 0;
    let totalBudgetDelivery = 0;
    let totalActualRevenue = 0;
    let totalActualDelivery = 0;
    let totalConsuntivo = 0;

    budgetEntries.forEach(entry => {
      totalCoperti += entry.coperti || 0;
      totalBudgetRevenue += entry.budgetRevenue || 0;
      totalBudgetDelivery += entry.budgetDelivery || 0;
      totalActualRevenue += entry.actualRevenue || 0;
      totalActualDelivery += entry.actualDelivery || 0;
      totalConsuntivo += entry.consuntivo || 0;
    });

    const totalBudget = totalBudgetRevenue + totalBudgetDelivery;
    const totalActual = totalActualRevenue + totalActualDelivery;
    const budgetPercentage = totalBudget > 0 ? ((totalBudget / totalBudget) * 100) : 0; // 100% by definition
    const actualPercentage = totalBudget > 0 ? ((totalActual / totalBudget) * 100) : 0;
    const deltaPercentage = actualPercentage - budgetPercentage;

    return {
      totalCoperti,
      totalBudgetRevenue,
      totalBudgetDelivery,
      totalBudget,
      totalActualRevenue,
      totalActualDelivery,
      totalActual,
      totalConsuntivo,
      budgetPercentage,
      actualPercentage,
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
    if (value < 0) return "text-green-600"; // Below budget is good
    if (value > 0) return "text-red-600"; // Above budget is warning
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
                  <TableHead className="text-white font-semibold text-center min-w-[80px]">Coperti</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[120px]">Budget {selectedYear} €</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[120px]">Delivery {selectedYear} €</TableHead>
                  <TableHead className="text-white font-semibold text-center min-w-[80px]">A Bdg</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[120px]">Incasso {selectedYear - 1} €</TableHead>
                  <TableHead className="text-white font-semibold text-right min-w-[120px]">Delivery {selectedYear - 1} €</TableHead>
                  <TableHead className="text-white font-semibold text-center min-w-[80px]">A A Reale</TableHead>
                  <TableHead className="text-white font-semibold text-center min-w-[100px]">Consuntivo</TableHead>
                  <TableHead className="text-white font-semibold text-center min-w-[80px]">Delta %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthDays.map(day => {
                  const entry = budgetMap.get(day);
                  const totalBudget = (entry?.budgetRevenue || 0) + (entry?.budgetDelivery || 0);
                  const totalActual = (entry?.actualRevenue || 0) + (entry?.actualDelivery || 0);
                  const budgetPercentage = totalBudget > 0 ? 100 : 0; // Always 100% vs budget by definition
                  const actualPercentage = totalBudget > 0 ? ((totalActual / totalBudget) * 100) : 0;
                  const deltaPercentage = actualPercentage - budgetPercentage;

                  return (
                    <TableRow 
                      key={day}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {`${getDayOfWeek(selectedYear, selectedMonth, day)} ${day.toString().padStart(2, '0')} ${monthNames[selectedMonth - 1].slice(0, 3)} ${selectedYear}`}
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
                        <Input
                          type="text"
                          value={entry?.budgetRevenue ? entry.budgetRevenue.toString() : ''}
                          placeholder="0,00"
                          className="w-24 text-right border-0 p-1 h-8"
                          onChange={(e) => handleCellEdit(day, 'budgetRevenue', e.target.value)}
                          data-testid={`input-budget-revenue-${day}`}
                        />
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
                      <TableCell className="text-center">
                        <span className="text-sm font-mono" data-testid={`text-budget-percentage-${day}`}>
                          {formatPercentage(budgetPercentage)}
                        </span>
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
                        <span className={`text-sm font-mono ${getPercentageColor(actualPercentage)}`} data-testid={`text-actual-percentage-${day}`}>
                          {formatPercentage(actualPercentage)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="text"
                          value={entry?.consuntivo ? entry.consuntivo.toString() : ''}
                          placeholder="0,00"
                          className="w-20 text-center border-0 p-1 h-8"
                          onChange={(e) => handleCellEdit(day, 'consuntivo', e.target.value)}
                          data-testid={`input-consuntivo-${day}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={deltaPercentage < 0 ? "default" : deltaPercentage > 5 ? "destructive" : "secondary"}
                          className="font-mono text-xs"
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
                  <TableCell className="text-center font-bold" data-testid="total-coperti">{totals.totalCoperti}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-budget-revenue">{formatCurrency(totals.totalBudgetRevenue)}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-budget-delivery">{formatCurrency(totals.totalBudgetDelivery)}</TableCell>
                  <TableCell className="text-center font-bold" data-testid="total-budget-percentage">{formatPercentage(totals.budgetPercentage)}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-actual-revenue">{formatCurrency(totals.totalActualRevenue)}</TableCell>
                  <TableCell className="text-right font-bold" data-testid="total-actual-delivery">{formatCurrency(totals.totalActualDelivery)}</TableCell>
                  <TableCell className="text-center font-bold" data-testid="total-actual-percentage">
                    <span className={getPercentageColor(totals.actualPercentage)}>
                      {formatPercentage(totals.actualPercentage)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold" data-testid="total-consuntivo">{formatCurrency(totals.totalConsuntivo)}</TableCell>
                  <TableCell className="text-center font-bold">
                    <Badge 
                      variant={totals.deltaPercentage < 0 ? "default" : totals.deltaPercentage > 5 ? "destructive" : "secondary"}
                      className="font-mono"
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="summary-total-budget">
              {formatCurrency(totals.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sala: {formatCurrency(totals.totalBudgetRevenue)} | Delivery: {formatCurrency(totals.totalBudgetDelivery)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incasso Reale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="summary-total-actual">
              {formatCurrency(totals.totalActual)}
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
            <div className={`text-2xl font-bold ${getPercentageColor(totals.deltaPercentage)}`} data-testid="summary-performance">
              {totals.deltaPercentage > 0 ? '+' : ''}{totals.deltaPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs Budget {selectedYear}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}