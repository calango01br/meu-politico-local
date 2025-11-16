import { useParams } from "react-router-dom";
import { ArrowLeft, Heart, Share2, AlertCircle, CheckCircle, XCircle, Scale, Lightbulb, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPoliticianDetails } from "@/services/politicalDataService";

const PoliticianProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: politician, isLoading, error } = useQuery({
    queryKey: ["politicianDetails", id],
    queryFn: () => fetchPoliticianDetails(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Calcular pontuação total baseada em votos e gastos
  const calculateTotalScore = () => {
    if (!politician) return 0;
    
    const voteScore = Math.min((politician.stats.totalVotes || 0) / 10, 10); // Max 10 pontos
    const expenseScore = Math.max(10 - ((politician.stats.totalExpenses || 0) / 10000), 0); // Menos gasto = mais pontos
    
    return (voteScore + expenseScore).toFixed(2);
  };

  // Calcular pontuações por categoria
  const getScores = () => {
    if (!politician) return { antiPrivilegio: 0, antiDesperdicio: 0, antiCorrupcao: 0, outros: 0 };
    
    const presenceScore = Math.min((politician.stats.totalVotes || 0) / 10, 10);
    const economyScore = Math.max(10 - ((politician.stats.totalExpenses || 0) / 10000), 0);
    
    return {
      antiPrivilegio: presenceScore.toFixed(2),
      antiDesperdicio: economyScore.toFixed(2),
      antiCorrupcao: "Sem condenações",
      outros: (Math.random() * 2).toFixed(2), // Mock para "outros"
    };
  };

  const scores = getScores();
  const totalScore = calculateTotalScore();

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/politicians")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !politician) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/politicians")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do parlamentar. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/ranking")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Profile Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card */}
          <Card className="shadow-elevated">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  {politician.photo && <AvatarImage src={politician.photo} alt={politician.name} />}
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-4xl">
                    {politician.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-xl font-bold text-foreground mb-1">{politician.name}</h1>
                <p className="text-sm text-muted-foreground mb-3">{politician.role} - {politician.state}</p>
                
                {/* Total Score */}
                <div className="bg-primary/10 rounded-lg p-4 w-full mb-4">
                  <p className="text-3xl font-bold text-primary">{totalScore}</p>
                  <p className="text-xs text-muted-foreground">Pontos</p>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary">{politician.party}</Badge>
                  <Badge variant="outline">{politician.state}</Badge>
                </div>

                {/* Contact Info */}
                {politician.email && (
                  <div className="w-full text-left space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Email:</strong>
                      <br />
                      <a href={`mailto:${politician.email}`} className="text-primary hover:underline">
                        {politician.email}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full" variant="default">
              Compartilhar ficha completa
            </Button>
            <Button className="w-full" variant="outline">
              Compartilhar ficha selecionada
            </Button>
            <Button className="w-full" variant="outline">
              Comparar parlamentares
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Categories */}
          <div className="space-y-3">
            {/* Anti-Privilégios */}
            <Card className="border-l-4 border-l-blue-500 shadow-soft">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-bold text-blue-600">ANTIPRIVILÉGIOS</h3>
                      <p className="text-sm text-muted-foreground">Como votou</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{scores.antiPrivilegio} pts</p>
                </div>
              </CardContent>
            </Card>

            {/* Anti-Desperdício */}
            <Card className="border-l-4 border-l-green-500 shadow-soft">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="font-bold text-green-600">ANTIDESPERDÍCIO</h3>
                      <p className="text-sm text-muted-foreground">Presenças & Economia de Verbas</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-600">{scores.antiDesperdicio} pts</p>
                </div>
              </CardContent>
            </Card>

            {/* Anti-Corrupção */}
            <Card className="border-l-4 border-l-red-500 shadow-soft">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Scale className="h-6 w-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-600">ANTICORRUPÇÃO</h3>
                      <p className="text-sm text-muted-foreground">Processos judiciais</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-green-600">{scores.antiCorrupcao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outros */}
            <Card className="border-l-4 border-l-yellow-500 shadow-soft">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-yellow-500 mt-1" />
                    <div>
                      <h3 className="font-bold text-yellow-600">OUTROS</h3>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-yellow-600">{scores.outros} pts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Score Card */}
          <Card className="shadow-elevated bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">TOTAL</h3>
                <p className="text-3xl font-bold text-primary">{totalScore} pts</p>
              </div>
            </CardContent>
          </Card>

          {/* Trajetória */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Trajetória</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {politician.role} eleito(a) pelo estado de {politician.state}, representando o partido {politician.party}. 
                Com {politician.stats.totalVotes || 0} votações registradas e um total de R$ {(politician.stats.totalExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                em despesas parlamentares.
              </p>
            </CardContent>
          </Card>

          {/* Atuação na Câmara/Senado */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Atuação {politician.role.includes('Deputad') ? 'na Câmara dos Deputados' : 'no Senado Federal'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Votações</h4>
                  <p className="text-sm text-muted-foreground">
                    Participou de {politician.stats.totalVotes || 0} votações no período analisado, demonstrando 
                    {politician.stats.totalVotes && politician.stats.totalVotes > 100 ? ' alta ' : ' '} 
                    presença nas sessões plenárias.
                  </p>
                </div>
                
                {politician.votes && politician.votes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Votações Recentes</h4>
                    <div className="space-y-2">
                      {politician.votes.slice(0, 3).map((vote, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm p-2 bg-muted/30 rounded">
                          <Badge variant={vote.vote === 'Sim' ? 'default' : vote.vote === 'Não' ? 'destructive' : 'secondary'}>
                            {vote.vote}
                          </Badge>
                          <span className="text-muted-foreground">{vote.proposition_title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Despesas</h4>
                  <p className="text-sm text-muted-foreground">
                    Total de despesas: R$ {(politician.stats.totalExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {politician.expenses && politician.expenses.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {politician.expenses.slice(0, 5).map((expense, index) => (
                        <div key={index} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                          <span className="text-muted-foreground">{expense.category}</span>
                          <span className="font-medium">R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reconhecimentos */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Reconhecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Informações sobre reconhecimentos e premiações estarão disponíveis em breve.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PoliticianProfile;
