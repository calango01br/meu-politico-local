import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RankingScore {
  politician_id: number;
  score_total: number;
  votacoes: number;
  gastos: number;
  processos: number;
  outros: number;
  calculated_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { politician_id } = await req.json();
    const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

    console.log(`Calculando score para político ID: ${politician_id}`);

    // 1. Verifica cache existente
    const { data: cachedScore } = await supabase
      .from('politician_scores')
      .select('*')
      .eq('politician_id', politician_id)
      .single();

    if (cachedScore) {
      const cachedAt = new Date(cachedScore.calculated_at).getTime();
      const now = new Date().getTime();

      if (now - cachedAt < CACHE_DURATION_MS) {
        console.log('Retornando score do cache');
        return new Response(JSON.stringify({ 
          ...cachedScore,
          source: 'cache' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. Busca dados do político
    const { data: politician } = await supabase
      .from('politicians')
      .select('*')
      .eq('id', politician_id)
      .single();

    if (!politician) {
      throw new Error('Político não encontrado');
    }

    // 3. Busca votações (últimos 12 meses)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { data: votes } = await supabase
      .from('politician_votes')
      .select('vote')
      .eq('politician_id', politician_id)
      .gte('date', oneYearAgo.toISOString());

    // 4. Busca despesas (últimos 12 meses)
    const { data: expenses } = await supabase
      .from('politician_expenses')
      .select('value, category')
      .eq('politician_id', politician_id)
      .gte('date', oneYearAgo.toISOString());

    // 5. Calcula componentes do score
    // V (Votações): % de votos "Sim" em votações importantes
    const totalVotes = votes?.length || 0;
    const favorableVotes = votes?.filter(v => v.vote === 'Sim').length || 0;
    const V = totalVotes > 0 ? (favorableVotes / totalVotes) * 10 : 5;

    // G (Gastos): Eficiência nos gastos (inverte escala - menos gastos = melhor)
    const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.value), 0) || 0;
    const avgMonthlyExpense = totalExpenses / 12;
    const maxExpectedMonthly = 50000; // R$ 50k como referência
    const G = Math.max(0, Math.min(10, 10 - (avgMonthlyExpense / maxExpectedMonthly) * 10));

    // P (Processos): Placeholder - seria integrado com dados de processos judiciais
    const P = 0; // Sem dados de processos, neutro

    // OT (Outros): Placeholder - seria integrado com ações destacadas
    const OT = 0;

    // Fórmula: ((V × 3) + G) / 4 + P + OT
    const score_total = Number((((V * 3) + G) / 4 + P + OT).toFixed(2));

    const scoreData: RankingScore = {
      politician_id,
      score_total,
      votacoes: Number(V.toFixed(2)),
      gastos: Number(G.toFixed(2)),
      processos: P,
      outros: OT,
      calculated_at: new Date().toISOString(),
    };

    // 6. Salva/atualiza cache
    await supabase
      .from('politician_scores')
      .upsert(scoreData, { onConflict: 'politician_id' });

    console.log(`Score calculado: ${score_total}`);

    return new Response(JSON.stringify({ 
      ...scoreData,
      source: 'calculated' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao calcular score:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
