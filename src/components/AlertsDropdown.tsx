import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const AlertsDropdown = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Verificar se usuário está logado
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Buscar alertas do usuário
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["user-alerts"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!session?.user?.id,
  });

  // Marcar alerta como lido
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("user_alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-alerts"] });
    },
  });

  // Marcar todos como lidos
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) return;
      
      const { error } = await supabase
        .from("user_alerts")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-alerts"] });
      toast({
        title: "Alertas marcados como lidos",
        description: "Todos os alertas foram marcados como lidos.",
      });
    },
  });

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "new_law":
        return "📜";
      case "high_expense":
        return "💰";
      case "important_vote":
        return "🗳️";
      default:
        return "🔔";
    }
  };

  const handleAlertClick = (alert: Alert) => {
    if (!alert.is_read) {
      markAsReadMutation.mutate(alert.id);
    }
    setIsOpen(false);
  };

  if (!session?.user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Alertas</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={() => markAllAsReadMutation.mutate()}
            >
              Marcar todos como lidos
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <DropdownMenuItem disabled>
            Carregando alertas...
          </DropdownMenuItem>
        ) : alerts.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum alerta no momento
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure seus alertas nas preferências
              </p>
            </div>
          </DropdownMenuItem>
        ) : (
          alerts.map((alert) => (
            <DropdownMenuItem
              key={alert.id}
              className={`flex flex-col items-start gap-1 cursor-pointer ${
                !alert.is_read ? "bg-primary/5" : ""
              }`}
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex items-start gap-2 w-full">
                <span className="text-lg">{getAlertIcon(alert.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!alert.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};