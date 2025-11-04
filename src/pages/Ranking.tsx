import { useState } from "react";
import { Trophy, TrendingUp, Award, Star, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPoliticians } from "@/services/congressApi";

const Ranking = () => {
  const [filter, setFilter] = useState<string>("Nacional");
  const filters = ["Nacional", "SP", "RJ", "MG", "RS", "BA"];

  const { data: politicians = [], isLoading, error } = useQuery({
    queryKey: ["politicians"],
    queryFn: fetchAllPoliticians,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Filter and rank politicians
  const rankedPoliticians = politicians
    .filter((pol) => filter === "Nacional" || pol.state === filter)
    .slice(0, 10)
    .map((pol, index) => ({
      position: index + 1,
      name: pol.name,
      party: pol.party,
      state: pol.state,
      score: Math.floor(Math.random() * 30) + 70, // Mock score for now
      initials: pol.initials,
      photo: pol.photo,
      change: index % 3 === 0 ? "up" : index % 3 === 1 ? "same" : "down",
    }));

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-amber-500" />;
    if (position === 2) return <Award className="h-6 w-6 text-gray-400" />;
    if (position === 3) return <Star className="h-6 w-6 text-amber-700" />;
    return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
  };

  const getChangeIndicator = (change: string) => {
    if (change === "up") return <TrendingUp className="h-4 w-4 text-success" />;
    if (change === "down") return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
    return <div className="h-4 w-4" />;
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

      {/* Info Card */}
      <Card className="mb-6 bg-gradient-accent text-accent-foreground border-0 shadow-elevated">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Como funciona a pontuação?</h3>
          <p className="text-sm opacity-90">
            Avaliamos presença em sessões, ética, projetos aprovados, uso de verba pública e
            processos judiciais. A pontuação é atualizada mensalmente.
          </p>
        </CardContent>
      </Card>

      {/* Top 10 Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top 10 do Mês
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
      {!isLoading && !error && (
        <div className="space-y-3">
          {rankedPoliticians.map((politician) => (
          <Card
            key={politician.position}
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
                    {getChangeIndicator(politician.change)}
                  </div>
                  <span className="text-xs text-muted-foreground">pontos</span>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Bottom Info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Dados atualizados mensalmente com base em fontes oficiais do Congresso Nacional
        </p>
      </div>
    </div>
  );
};

export default Ranking;
