import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { syncPoliticalData } from "@/services/politicalDataService";

export const SyncDataButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncPoliticalData();
      toast({
        title: "✅ Sincronização concluída!",
        description: `${result.stats?.politicians || 0} políticos, ${result.stats?.expenses || 0} gastos e ${result.stats?.votes || 0} votos sincronizados.`,
      });
    } catch (error) {
      console.error("Erro na sincronização:", error);
      toast({
        title: "❌ Erro na sincronização",
        description: "Não foi possível sincronizar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Sincronizando..." : "Sincronizar Dados"}
    </Button>
  );
};