import { useState } from "react";
import { Bell, Bookmark, Share2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mockNews = [
  {
    id: 1,
    title: "Nova Lei de Proteção de Dados Pessoais é Aprovada",
    summary: "O Senado aprovou por unanimidade a modernização da LGPD. A lei agora inclui multas mais rigorosas para empresas que vazarem dados.",
    category: "Privacidade",
    date: "Há 2 horas",
    reading: "3 min",
  },
  {
    id: 2,
    title: "Orçamento da Educação Aumenta 15% em 2025",
    summary: "Câmara dos Deputados aprova aumento significativo no investimento em educação básica e superior.",
    category: "Educação",
    date: "Há 5 horas",
    reading: "4 min",
  },
  {
    id: 3,
    title: "Reforma Tributária: Entenda as Mudanças",
    summary: "A simplificação dos impostos promete reduzir a burocracia e facilitar a vida dos brasileiros. Veja o que muda na prática.",
    category: "Economia",
    date: "Há 1 dia",
    reading: "6 min",
  },
];

const glossaryTerms = [
  { term: "PEC", definition: "Proposta de Emenda Constitucional - mudança na Constituição Federal" },
  { term: "PL", definition: "Projeto de Lei - proposta de nova lei ou modificação de lei existente" },
  { term: "MP", definition: "Medida Provisória - ato do Presidente com força de lei imediata" },
  { term: "Quórum", definition: "Número mínimo de parlamentares presentes para votação válida" },
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const categories = ["Todos", "Educação", "Economia", "Saúde", "Meio Ambiente", "Privacidade"];

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cidadania Simplificada</h1>
            <p className="text-sm text-muted-foreground">Política clara para todos</p>
          </div>
          <Button size="icon" variant="ghost" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </header>

      {/* Weekly Highlight */}
      <Card className="mb-6 bg-gradient-primary text-primary-foreground border-0 shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronDown className="h-5 w-5" />
            Destaque da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm opacity-90">
            Entenda o que aconteceu esta semana: 5 leis aprovadas, 3 PECs em votação e R$ 2,3 bilhões
            em transparência analisados.
          </p>
        </CardContent>
      </Card>

      {/* Glossary Section */}
      <Card className="mb-6 shadow-soft">
        <CardHeader>
          <CardTitle>Glossário Político</CardTitle>
          <CardDescription>Toque nos termos para entender melhor</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex flex-wrap gap-2">
              {glossaryTerms.map(({ term, definition }) => (
                <Tooltip key={term}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {term}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{definition}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* News Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Notícias Simplificadas</h2>
        {mockNews.map((news) => (
          <Card key={news.id} className="shadow-soft hover:shadow-elevated transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="secondary">{news.category}</Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-base leading-tight">{news.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{news.date}</span>
                <span>{news.reading} de leitura</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
