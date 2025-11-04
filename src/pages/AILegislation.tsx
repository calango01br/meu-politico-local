import { useState } from "react";
import { Sparkles, Search, Clock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const recentLaws = [
  {
    id: 1,
    type: "PL",
    number: "1234/2024",
    title: "Lei de Proteção de Dados Pessoais",
    author: "Dep. Ana Silva",
    date: "15/11/2024",
    status: "Aprovada",
  },
  {
    id: 2,
    type: "PEC",
    number: "456/2024",
    title: "Reforma Tributária Simplificada",
    author: "Sen. Carlos Mendes",
    date: "10/11/2024",
    status: "Em votação",
  },
  {
    id: 3,
    type: "MP",
    number: "789/2024",
    title: "Medida de Incentivo à Educação",
    author: "Presidente da República",
    date: "08/11/2024",
    status: "Vigente",
  },
];

const AILegislation = () => {
  const [searchInput, setSearchInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = () => {
    if (!searchInput.trim()) return;
    
    setAnalyzing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setResult({
        type: "PL",
        number: searchInput,
        summary: "Esta lei trata da proteção de dados pessoais dos brasileiros, estabelecendo regras claras sobre coleta, uso e compartilhamento de informações. As empresas precisarão obter consentimento explícito e poderão ser multadas por vazamentos.",
        impact: "Maior controle dos cidadãos sobre seus dados pessoais. Empresas terão que se adaptar às novas regras.",
        author: "Deputada Ana Silva (PT/SP)",
        status: "Aprovada e aguardando sanção presidencial",
        effectiveDate: "120 dias após a publicação oficial",
      });
      setAnalyzing(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    if (status === "Aprovada" || status === "Vigente") return "success";
    if (status === "Em votação") return "default";
    return "secondary";
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">IA Legislação</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Entenda qualquer lei em linguagem simples com ajuda da IA
        </p>
      </header>

      {/* Search Section */}
      <Card className="mb-6 shadow-elevated">
        <CardHeader>
          <CardTitle>Analisar Lei, PL ou PEC</CardTitle>
          <CardDescription>
            Digite o número da lei ou cole o texto completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: PL 1234/2024 ou cole o texto da lei..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <Button onClick={handleAnalyze} disabled={analyzing} className="whitespace-nowrap">
              {analyzing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analisar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {result && (
        <Card className="mb-6 shadow-soft border-primary/50 animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-sm">
                {result.type} {result.number}
              </Badge>
              <Badge variant={getStatusColor(result.status) as any}>
                {result.status}
              </Badge>
            </div>
            <CardTitle className="text-lg">Resumo Simplificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">O que é?</h4>
              <p className="text-sm text-foreground">{result.summary}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Impacto Prático</h4>
              <p className="text-sm text-foreground">{result.impact}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 border-t">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Autor</p>
                  <p className="text-sm font-medium">{result.author}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Vigência</p>
                  <p className="text-sm font-medium">{result.effectiveDate}</p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Acompanhar Tramitação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Laws */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Leis Recentes Explicadas
        </h2>
        
        {recentLaws.map((law) => (
          <Card
            key={law.id}
            className="shadow-soft hover:shadow-elevated transition-shadow duration-200 cursor-pointer"
            onClick={() => {
              setSearchInput(`${law.type} ${law.number}`);
              handleAnalyze();
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {law.type} {law.number}
                </Badge>
                <Badge variant={getStatusColor(law.status) as any} className="text-xs">
                  {law.status}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-sm text-foreground mb-2">{law.title}</h3>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{law.author}</span>
                <span>{law.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AILegislation;
