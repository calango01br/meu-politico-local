import { useParams } from "react-router-dom";
import { ArrowLeft, Heart, Share2, TrendingUp, TrendingDown, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const PoliticianProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - would come from API
  const politician = {
    name: "Ana Silva",
    party: "PT",
    state: "SP",
    role: "Deputada Federal",
    initials: "AS",
    performance: {
      ethics: 85,
      presence: 92,
      projects: 78,
      spending: 65,
    },
    recentActions: [
      { id: 1, title: "Votou a favor da PEC 123/2024", type: "vote", icon: TrendingUp },
      { id: 2, title: "Propôs PL sobre educação", type: "project", icon: TrendingUp },
      { id: 3, title: "Faltou à sessão do dia 15/11", type: "absence", icon: TrendingDown },
      { id: 4, title: "Absteve-se na votação da MP 456", type: "abstention", icon: MinusCircle },
    ],
    stats: {
      proposedLaws: 24,
      approvedLaws: 8,
      totalVotes: 156,
      monthlySpending: "R$ 42.500",
    },
  };

  const getActionColor = (type: string) => {
    if (type === "vote" || type === "project") return "text-success";
    if (type === "absence") return "text-destructive";
    return "text-muted-foreground";
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 85) return { label: "Excelente", color: "text-success" };
    if (score >= 70) return { label: "Bom", color: "text-accent" };
    return { label: "Atenção", color: "text-destructive" };
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/politicians")}
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

      {/* Profile Card */}
      <Card className="mb-6 shadow-elevated">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-2xl">
                {politician.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1">{politician.name}</h1>
              <p className="text-sm text-muted-foreground mb-2">{politician.role}</p>
              <div className="flex gap-2">
                <Badge variant="secondary">{politician.party}</Badge>
                <Badge variant="outline">{politician.state}</Badge>
              </div>
            </div>
          </div>

          <Button className="w-full">Seguir Parlamentar</Button>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <CardTitle>Indicadores de Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(politician.performance).map(([key, value]) => {
            const labels = {
              ethics: "Ética",
              presence: "Presença",
              projects: "Projetos",
              spending: "Uso de Verba",
            };
            const level = getPerformanceLevel(value);
            return (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{labels[key as keyof typeof labels]}</span>
                  <span className={`text-sm font-semibold ${level.color}`}>
                    {value}% - {level.label}
                  </span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="shadow-soft">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{politician.stats.proposedLaws}</p>
            <p className="text-xs text-muted-foreground mt-1">Leis Propostas</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-success">{politician.stats.approvedLaws}</p>
            <p className="text-xs text-muted-foreground mt-1">Leis Aprovadas</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-foreground">{politician.stats.totalVotes}</p>
            <p className="text-xs text-muted-foreground mt-1">Votações Totais</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6 text-center">
            <p className="text-xl font-bold text-accent">{politician.stats.monthlySpending}</p>
            <p className="text-xs text-muted-foreground mt-1">Gasto Mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Últimas Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {politician.recentActions.map((action) => (
              <div key={action.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <action.icon className={`h-5 w-5 mt-0.5 ${getActionColor(action.type)}`} />
                <p className="text-sm text-foreground flex-1">{action.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PoliticianProfile;
