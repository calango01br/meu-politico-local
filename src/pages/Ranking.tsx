import { useState } from "react";
import { Trophy, TrendingUp, Award, Star, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { fetchPoliticiansFromDB } from "@/services/politicalDataService";
import { supabase } from "@/integrations/supabase/client";
import { useAutoSync } from "@/hooks/useAutoSync";
import { PeriodFilter } from "@/components/PeriodFilter";

interface PoliticianWithScore {
  id: number;
  name: string;
  party: string;
  state: string;
  initials: string;
  photo?: string;
  score: number;
  votes_count: number;
  expenses_total: number;
}

const Ranking = () => {
  const [filter, setFilter] = useState<string>("Nacional");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const filters = ["Nacional", "SP", "RJ", "MG", "RS", "BA"];

  const { isSyncing } = useAutoSync();

  // Buscar políticos do banco
  const { data: politicians = [], isLoading: loadingPoliticians, error } = useQuery({
    queryKey: ["politicians-ranking"],
    queryFn: fetchPoliticiansFromDB,
    staleTime: 1000 * 60 * 5,
  });

  // Buscar estatísticas (votos e gastos) para calcular scores
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["politicians-stats", selectedMonth, selectedYear],
    queryFn: async () => {
      let votesQuery = supabase
        .from('politician_votes')
        .select('politician_id, date');
      
      let expensesQuery = supabase
        .from('politician_expenses')
        .select('politician_id, value, month, year');

      // Aplicar filtros de período
      if (selectedMonth !== "all") {
        expensesQuery = expensesQuery.eq('month', parseInt(selectedMonth));
      }
      if (selectedYear !== "all") {
        expensesQuery = expensesQuery.eq('year', parseInt(selectedYear));
        // Filtrar votos por ano também
        votesQuery = votesQuery.gte('date', `${selectedYear}-01-01`).lte('date', `${selectedYear}-12-31`);
      }

      const [votesResult, expensesResult] = await Promise.all([
        votesQuery,
        expensesQuery,
      ]);

      // Contar votos por político
      const votesMap = new Map<number, number>();
      votesResult.data?.forEach((vote) => {
        if (vote.politician_id) {
          votesMap.set(vote.politician_id, (votesMap.get(vote.politician_id) || 0) + 1);
        }
      });

      // Calcular gastos por político
      const expensesMap = new Map<number, number>();
      expensesResult.data?.forEach((expense) => {
        if (expense.politician_id) {
          const current = expensesMap.get(expense.politician_id) || 0;
          expensesMap.set(expense.politician_id, current + Number(expense.value));
        }
      });

      return { votesMap, expensesMap };
    },
    enabled: politicians.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = loadingPoliticians || loadingStats || isSyncing;

  // Calcular score para cada político
  const calculateScore = (politician: any): number => {
    const votes = stats?.votesMap.get(politician.id) || 0;
    const expenses = stats?.expensesMap.get(politician.id) || 0;

    // Score baseado em:
    // - Presença: +2 pontos por voto registrado (max 40 pontos)
    // - Gastos: penalidade baseada em gastos (max -20 pontos)
    // - Base: 60 pontos
    
    const presenceScore = Math.min(votes * 2, 40);
    const expensePenalty = Math.min(expenses / 5000, 20); // 5k = 1 ponto de penalidade
    
    return Math.round(60 + presenceScore - expensePenalty);
  };

  // Ranquear políticos com scores
  const rankedPoliticians = politicians
    .map((pol) => ({
      ...pol,
      score: calculateScore(pol),
      votes_count: stats?.votesMap.get(pol.id) || 0,
      expenses_total: stats?.expensesMap.get(pol.id) || 0,
    }))
    .filter((pol) => filter === "Nacional" || pol.state === filter)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((pol, index) => ({
      position: index + 1,
      ...pol,
    }));

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-amber-500" />;
    if (position === 2) return <Award className="h-6 w-6 text-gray-400" />;
    if (position === 3) return <Star className="h-6 w-6 text-amber-700" />;
    return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
  };

  const getChangeIndicator = (position: number) => {
    // Variação baseada na posição (mock por enquanto)
    if (position % 3 === 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (position % 3 === 1) return <div className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Ranking</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Os parlamentares mais bem avaliados do Brasil
        </p>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((item) => (
            <Button
              key={item}
              variant={filter === item ? "default" : "secondary"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </header>

      {/* Period Filter */}
      <PeriodFilter
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      {/* Info Card */}
      <Card className="mb-6 bg-gradient-accent text-accent-foreground border-0 shadow-elevated">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Como funciona a pontuação?</h3>
          <p className="text-sm opacity-90">
            Avaliamos presença em votações (+2 pontos por voto), uso responsável de verba pública
            (penalidade por gastos altos), com base de 60 pontos. Atualizado em tempo real.
          </p>
        </CardContent>
      </Card>

      {/* Top 10 Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top 10 do Ranking
        </h2>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rankings List */}
      {!isLoading && !error && rankedPoliticians.length > 0 && (
        <div className="space-y-3">
          {rankedPoliticians.map((politician) => (
          <Card
            key={politician.id}
            className={`shadow-soft hover:shadow-elevated transition-all duration-200 ${
              politician.position <= 3 ? "border-primary/50" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Position Badge */}
                <div className="flex items-center justify-center w-10">
                  {getPositionBadge(politician.position)}
                </div>

                {/* Avatar */}
                <Avatar className="h-12 w-12">
                  {politician.photo && <AvatarImage src={politician.photo} alt={politician.name} />}
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {politician.initials}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{politician.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {politician.party}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {politician.state}
                    </Badge>
                  </div>
                </div>

                {/* Score and Change */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{politician.score}</span>
                    {getChangeIndicator(politician.position)}
                  </div>
                  <span className="text-xs text-muted-foreground">pontos</span>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && rankedPoliticians.length === 0 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum político encontrado. Os dados estão sendo sincronizados.
          </AlertDescription>
        </Alert>
      )}

      {/* Bottom Info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Dados atualizados em tempo real com base em fontes oficiais do Congresso Nacional
        </p>
      </div>
    </div>
  );
};

export default Ranking;
