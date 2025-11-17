import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text_to_simplify } = await req.json();

    if (!text_to_simplify) {
      throw new Error('Campo text_to_simplify é obrigatório');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('Simplificando texto com IA...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `Você é um especialista em educação cívica brasileira. Sua missão é reescrever textos de leis e projetos legislativos em linguagem simples e acessível, adequada para o nível de compreensão de um aluno de 5ª série (10-11 anos).

DIRETRIZES:
- Use frases curtas e vocabulário simples
- Evite jargões jurídicos e termos técnicos
- Quando usar termos necessários, explique-os de forma clara
- Organize o texto em tópicos quando possível
- Mantenha um tom neutro, informativo e didático
- Destaque o impacto prático da lei na vida das pessoas
- Seja objetivo e conciso

ESTRUTURA DA RESPOSTA:
1. **Resumo em uma frase**: O que a lei faz?
2. **Explicação Simples**: Como funciona na prática?
3. **Quem é afetado**: Quem essa lei impacta?
4. **Quando entra em vigor**: Prazo de vigência (se aplicável)` 
          },
          { 
            role: 'user', 
            content: `Simplifique este texto de lei:\n\n${text_to_simplify}` 
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
      }
      if (response.status === 402) {
        throw new Error('Créditos insuficientes. Adicione fundos ao seu workspace Lovable AI.');
      }
      const errorText = await response.text();
      console.error('Erro na API:', response.status, errorText);
      throw new Error('Erro ao processar com IA');
    }

    const data = await response.json();
    const simplified_text = data.choices?.[0]?.message?.content;

    if (!simplified_text) {
      throw new Error('Resposta da IA vazia');
    }

    console.log('Texto simplificado com sucesso');

    return new Response(JSON.stringify({ 
      simplified_text,
      original_length: text_to_simplify.length,
      simplified_length: simplified_text.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao simplificar legislação:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
