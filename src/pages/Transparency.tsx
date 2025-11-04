import { useState } from "react";
import { DollarSign, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockSpending = [
  { category: "Gabinete", amount: 45000, percent: 30, color: "bg-primary" },
  { category: "Divulgação", amount: 38000, percent: 25, color: "bg-accent" },
  { category: "Viagens", amount: 30000, percent: 20, color: "bg-success" },
  { category: "Combustível", amount: 22500, percent: 15, color: "bg-destructive" },
  { category: "Outros", amount: 15000, percent: 10, color: "bg-muted-foreground" },
];

const topSpenders = [
  { name: "Dep. João Oliveira", party: "PL", amount: "R$ 89.500", change: "+15%" },
  { name: "Sen. Paula Costa", party: "PSDB", amount: "R$ 78.200", change: "+8%" },
  { name: "Dep. Ricardo Nunes", party: "PT", amount: "R$ 72.100", change: "+12%" },
];

const Transparency = () => {
  const [viewMode, setViewMode] = useState<"category" | "politician">("category");

  const totalSpending = mockSpending.reduce((sum, item) => sum + item.amount, 0);

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

      {/* Total Spending Card */}
      <Card className="mb-6 bg-gradient-primary text-primary-foreground border-0 shadow-elevated">
        <CardContent className="pt-6">
          <p className="text-sm opacity-90 mb-2">Gastos Parlamentares Este Mês</p>
          <p className="text-4xl font-bold mb-1">
            R$ {totalSpending.toLocaleString("pt-BR")}
          </p>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <TrendingUp className="h-4 w-4" />
            <span>+8,5% em relação ao mês anterior</span>
          </div>
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
              {mockSpending.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.percent}%
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        R$ {item.amount.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50 border-0">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground text-center">
                💡 Os dados são atualizados mensalmente e baseados nos relatórios oficiais do
                Portal da Transparência
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
              <CardTitle>Maiores Gastos do Mês</CardTitle>
              <CardDescription>Top 3 parlamentares com maiores despesas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topSpenders.map((politician, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{politician.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {politician.party}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{politician.amount}</p>
                    <p className="text-xs text-destructive">{politician.change}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comparison Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Comparação por Partido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { party: "PT", amount: "R$ 245.000", bar: 85 },
                { party: "PL", amount: "R$ 198.000", bar: 70 },
                { party: "PSDB", amount: "R$ 167.000", bar: 60 },
                { party: "PSOL", amount: "R$ 123.000", bar: 45 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary">{item.party}</Badge>
                    <span className="text-sm font-semibold">{item.amount}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary transition-all duration-500"
                      style={{ width: `${item.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Transparency;
