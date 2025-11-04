import { useState } from "react";
import { Search, ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPoliticians } from "@/services/congressApi";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Politicians = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: politicians = [], isLoading, error } = useQuery({
    queryKey: ["politicians"],
    queryFn: fetchAllPoliticians,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const filteredPoliticians = politicians.filter((politician) =>
    politician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    politician.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
    politician.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Politicians List */}
      {!isLoading && !error && (
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
                  {politician.photo && <AvatarImage src={politician.photo} alt={politician.name} />}
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
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && filteredPoliticians.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum parlamentar encontrado</p>
        </div>
      )}
    </div>
  );
};

export default Politicians;
