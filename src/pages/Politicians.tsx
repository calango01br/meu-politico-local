import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const mockPoliticians = [
  {
    id: 1,
    name: "Ana Silva",
    party: "PT",
    state: "SP",
    role: "Deputada Federal",
    performance: { ethics: 85, presence: 92, projects: 78 },
    initials: "AS",
  },
  {
    id: 2,
    name: "Carlos Mendes",
    party: "PSDB",
    state: "MG",
    role: "Senador",
    performance: { ethics: 90, presence: 88, projects: 82 },
    initials: "CM",
  },
  {
    id: 3,
    name: "Maria Santos",
    party: "PSOL",
    state: "RJ",
    role: "Deputada Federal",
    performance: { ethics: 95, presence: 94, projects: 89 },
    initials: "MS",
  },
  {
    id: 4,
    name: "João Pereira",
    party: "PL",
    state: "RS",
    role: "Deputado Federal",
    performance: { ethics: 72, presence: 85, projects: 70 },
    initials: "JP",
  },
];

const Politicians = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredPoliticians = mockPoliticians.filter((politician) =>
    politician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    politician.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
    politician.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-accent";
    return "text-destructive";
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Parlamentares</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Conheça deputados e senadores do Brasil
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, partido ou estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </header>

      {/* Politicians List */}
      <div className="space-y-3">
        {filteredPoliticians.map((politician) => (
          <Card
            key={politician.id}
            className="shadow-soft hover:shadow-elevated transition-all duration-200 cursor-pointer"
            onClick={() => navigate(`/politicians/${politician.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {politician.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{politician.name}</h3>
                  <p className="text-sm text-muted-foreground">{politician.role}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {politician.party}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {politician.state}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-2 text-xs">
                    <span className={getPerformanceColor(politician.performance.ethics)}>
                      Ética: {politician.performance.ethics}%
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className={getPerformanceColor(politician.performance.presence)}>
                      Presença: {politician.performance.presence}%
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPoliticians.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum parlamentar encontrado</p>
        </div>
      )}
    </div>
  );
};

export default Politicians;
