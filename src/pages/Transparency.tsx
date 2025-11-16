import { useState } from "react";
import { DollarSign, TrendingUp, PieChart, BarChart3, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchExpensesByCategory, fetchTopSpenders, fetchExpensesByParty } from "@/services/expensesService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAutoSync } from "@/hooks/useAutoSync";
import { PeriodFilter } from "@/components/PeriodFilter";

const Transparency = () => {
  const [viewMode, setViewMode] = useState<"category" | "politician">("category");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const { isSyncing } = useAutoSync();

  const periodFilter = {
    month: selectedMonth !== "all" ? parseInt(selectedMonth) : undefined,
    year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
  };

  // Buscar gastos por categoria
  const { data: categoryData = [], isLoading: loadingCategory } = useQuery({
    queryKey: ["expenses-by-category", selectedMonth, selectedYear],
    queryFn: () => fetchExpensesByCategory(periodFilter),
    staleTime: 1000 * 60 * 5,
  });

  // Buscar top gastadores
  const { data: topSpenders = [], isLoading: loadingSpenders } = useQuery({
    queryKey: ["top-spenders", selectedMonth, selectedYear],
    queryFn: () => fetchTopSpenders(10, periodFilter),
    staleTime: 1000 * 60 * 5,
  });

  // Buscar gastos por partido
  const { data: partyData = [], isLoading: loadingParty } = useQuery({
    queryKey: ["expenses-by-party", selectedMonth, selectedYear],
    queryFn: () => fetchExpensesByParty(periodFilter),
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = loadingCategory || loadingSpenders || loadingParty || isSyncing;

  const totalSpending = categoryData.reduce((sum, item) => sum + item.total, 0);

  // Cores para categorias
  const categoryColors = [
    "bg-primary",
    "bg-accent",
    "bg-success",
    "bg-destructive",
    "bg-muted-foreground",
    "bg-primary/70",
    "bg-accent/70",
  ];

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Transparência</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Acompanhe como o dinheiro público é gasto
        </p>
      </header>

      {/* Period Filter */}
      <PeriodFilter
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      {/* Total Spending Card */}
      <Card className="mb-6 bg-gradient-primary text-primary-foreground border-0 shadow-elevated">
        <CardContent className="pt-6">
          <p className="text-sm opacity-90 mb-2">Gastos Parlamentares Totais</p>
          {isLoading ? (
            <Skeleton className="h-10 w-48 bg-primary-foreground/20" />
          ) : (
            <>
              <p className="text-4xl font-bold mb-1">
                R$ {totalSpending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <TrendingUp className="h-4 w-4" />
                <span>Baseado em dados oficiais</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={viewMode === "category" ? "default" : "secondary"}
          size="sm"
          className="flex-1"
          onClick={() => setViewMode("category")}
        >
          <PieChart className="h-4 w-4 mr-2" />
          Por Categoria
        </Button>
        <Button
          variant={viewMode === "politician" ? "default" : "secondary"}
          size="sm"
          className="flex-1"
          onClick={() => setViewMode("politician")}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Por Político
        </Button>
      </div>

      {/* Category View */}
      {viewMode === "category" && (
        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>Distribuição dos gastos parlamentares</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))
              ) : categoryData.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum dado disponível. Aguarde a sincronização.
                  </AlertDescription>
                </Alert>
              ) : (
                categoryData.slice(0, 7).map((item, index) => (
                  <div key={item.category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.percentage.toFixed(1)}%
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">
                          R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${categoryColors[index % categoryColors.length]} transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50 border-0">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground text-center">
                💡 Os dados são atualizados em tempo real e baseados nos relatórios oficiais da
                Câmara dos Deputados e Senado Federal
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Politician View */}
      {viewMode === "politician" && (
        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Maiores Gastos</CardTitle>
              <CardDescription>Top 10 parlamentares com maiores despesas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : topSpenders.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum dado disponível. Aguarde a sincronização.
                  </AlertDescription>
                </Alert>
              ) : (
                topSpenders.map((politician, index) => (
                  <div
                    key={politician.politician_id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{politician.politician_name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {politician.party}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {politician.state}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        R$ {politician.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Comparison Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Comparação por Partido</CardTitle>
              <CardDescription>Gastos totais agrupados por partido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              ) : partyData.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum dado disponível. Aguarde a sincronização.
                  </AlertDescription>
                </Alert>
              ) : (
                partyData.slice(0, 8).map((item) => (
                  <div key={item.party}>
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary">{item.party}</Badge>
                      <span className="text-sm font-semibold">
                        R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Transparency;
