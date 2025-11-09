import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Iniciando sincronização de dados políticos...');

    // 1. Buscar deputados da Câmara
    const deputiesRes = await fetch(
      'https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome&itens=513'
    );
    const deputiesData = await deputiesRes.json();
    
    // 2. Buscar senadores
    const senatorsRes = await fetch(
      'https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json'
    );
    const senatorsData = await senatorsRes.json();
    
    const allPoliticians = [];
    
    // Processar deputados
    for (const deputy of deputiesData.dados) {
      allPoliticians.push({
        id: deputy.id,
        name: deputy.nome,
        party: deputy.siglaPartido,
        state: deputy.siglaUf,
        role: 'Deputado Federal',
        photo: deputy.urlFoto,
        email: deputy.email,
      });
    }
    
    // Processar senadores
    const senators = senatorsData.ListaParlamentarEmExercicio.Parlamentares.Parlamentar;
    for (const senator of senators) {
      allPoliticians.push({
        id: parseInt(senator.CodigoParlamentar),
        name: senator.NomeParlamentar,
        party: senator.SiglaPartidoParlamentar,
        state: senator.UfParlamentar,
        role: 'Senador',
        photo: senator.UrlFotoParlamentar,
        email: senator.EmailParlamentar,
      });
    }

    console.log(`📊 Total de políticos: ${allPoliticians.length}`);

    // Salvar políticos no banco (upsert)
    const { error: politiciansError } = await supabaseClient
      .from('politicians')
      .upsert(allPoliticians, { onConflict: 'id' });

    if (politiciansError) {
      console.error('❌ Erro ao salvar políticos:', politiciansError);
      throw politiciansError;
    }

    console.log('✅ Políticos salvos com sucesso');

    // 3. Buscar gastos dos deputados (amostra de 50)
    const currentYear = new Date().getFullYear();
    const expensesData = [];
    
    for (let i = 0; i < Math.min(50, deputiesData.dados.length); i++) {
      const deputyId = deputiesData.dados[i].id;
      
      try {
        const expensesRes = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/deputados/${deputyId}/despesas?ano=${currentYear}&itens=50`
        );
        const expenses = await expensesRes.json();
        
        if (expenses.dados && expenses.dados.length > 0) {
          for (const expense of expenses.dados) {
            expensesData.push({
              politician_id: deputyId,
              year: parseInt(expense.ano),
              month: parseInt(expense.mes),
              category: expense.tipoDespesa,
              description: expense.nomeFornecedor || expense.tipoDespesa,
              value: parseFloat(expense.valorLiquido || 0),
              date: expense.dataDocumento || `${expense.ano}-${String(expense.mes).padStart(2, '0')}-01`,
            });
          }
        }
      } catch (err) {
        console.error(`⚠️ Erro ao buscar gastos do deputado ${deputyId}:`, err);
      }
    }

    console.log(`💰 Total de gastos coletados: ${expensesData.length}`);

    if (expensesData.length > 0) {
      // Deletar gastos antigos do ano atual antes de inserir novos
      await supabaseClient
        .from('politician_expenses')
        .delete()
        .eq('year', currentYear);

      const { error: expensesError } = await supabaseClient
        .from('politician_expenses')
        .insert(expensesData);

      if (expensesError) {
        console.error('❌ Erro ao salvar gastos:', expensesError);
      } else {
        console.log('✅ Gastos salvos com sucesso');
      }
    }

    // 4. Buscar votações recentes (amostra de 30 deputados)
    const votesData = [];
    
    for (let i = 0; i < Math.min(30, deputiesData.dados.length); i++) {
      const deputyId = deputiesData.dados[i].id;
      
      try {
        const votesRes = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/deputados/${deputyId}/votacoes?ordem=DESC&ordenarPor=dataHoraVoto&itens=20`
        );
        const votes = await votesRes.json();
        
        if (votes.dados && votes.dados.length > 0) {
          for (const vote of votes.dados) {
            votesData.push({
              politician_id: deputyId,
              proposition_id: String(vote.idProposicao || vote.proposicaoObjeto?.id || 'unknown'),
              proposition_title: vote.proposicaoObjeto?.ementa || vote.descricao || 'Votação',
              vote: vote.tipoVoto || 'Não registrado',
              date: vote.dataHoraVoto?.split('T')[0] || new Date().toISOString().split('T')[0],
            });
          }
        }
      } catch (err) {
        console.error(`⚠️ Erro ao buscar votos do deputado ${deputyId}:`, err);
      }
    }

    console.log(`🗳️ Total de votos coletados: ${votesData.length}`);

    if (votesData.length > 0) {
      // Limpar votos antigos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await supabaseClient
        .from('politician_votes')
        .delete()
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      const { error: votesError } = await supabaseClient
        .from('politician_votes')
        .insert(votesData);

      if (votesError) {
        console.error('❌ Erro ao salvar votos:', votesError);
      } else {
        console.log('✅ Votos salvos com sucesso');
      }
    }

    // 5. Buscar proposições recentes
    const propositionsRes = await fetch(
      'https://dadosabertos.camara.leg.br/api/v2/proposicoes?ordem=DESC&ordenarPor=id&itens=50'
    );
    const propositionsData = await propositionsRes.json();
    
    const propositions = propositionsData.dados.map((prop: any) => ({
      id: String(prop.id),
      type: prop.siglaTipo,
      number: String(prop.numero),
      year: String(prop.ano),
      summary: prop.ementa || 'Sem descrição disponível',
      author: 'Câmara dos Deputados',
      status: 'Em tramitação',
      date: new Date().toISOString().split('T')[0],
    }));

    const { error: propositionsError } = await supabaseClient
      .from('propositions')
      .upsert(propositions, { onConflict: 'id' });

    if (propositionsError) {
      console.error('❌ Erro ao salvar proposições:', propositionsError);
    } else {
      console.log('✅ Proposições salvas com sucesso');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Sincronização concluída',
        stats: {
          politicians: allPoliticians.length,
          expenses: expensesData.length,
          votes: votesData.length,
          propositions: propositions.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});