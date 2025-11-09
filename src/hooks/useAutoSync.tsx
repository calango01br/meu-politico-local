import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { syncPoliticalData } from "@/services/politicalDataService";
import { checkHasData } from "@/services/expensesService";
import { useToast } from "@/hooks/use-toast";

export const useAutoSync = () => {
  const [shouldSync, setShouldSync] = useState(false);
  const { toast } = useToast();

  // Verificar se há dados no banco
  const { data: hasData, isLoading: checkingData } = useQuery({
    queryKey: ["check-database"],
    queryFn: checkHasData,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Sincronizar se necessário
  const { data: syncResult, isLoading: isSyncing } = useQuery({
    queryKey: ["auto-sync"],
    queryFn: async () => {
      try {
        const result = await syncPoliticalData();
        toast({
          title: "✅ Dados sincronizados!",
          description: `${result.stats?.politicians || 0} políticos carregados com sucesso.`,
        });
        return result;
      } catch (error) {
        console.error("Erro ao sincronizar:", error);
        toast({
          title: "⚠️ Erro na sincronização",
          description: "Mostrando dados disponíveis das APIs.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: shouldSync && hasData === false,
    retry: 1,
  });

  useEffect(() => {
    if (hasData === false && !shouldSync) {
      setShouldSync(true);
    }
  }, [hasData, shouldSync]);

  return {
    needsSync: hasData === false,
    isSyncing: isSyncing || checkingData,
    syncComplete: syncResult !== undefined,
  };
};
